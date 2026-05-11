import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useComments } from '../hooks/useComments';
import { USER_PROFILES } from '../config/appConfig';
import { uploadImages } from '../services/storageService';
import { normalizeDateKey } from '../utils/dateUtils';

function formatCommentTime(ts) {
  if (!ts?.toDate) return '';
  try {
    return ts.toDate().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function isLeftUser(email) {
  return USER_PROFILES[email]?.side === 'left';
}

export default function CommentsScreen({ entry, onClose, onCommentsUpdated }) {
  const { user } = useAuth();
  const entryId = entry?.id ?? null;
  const { comments, loading, addComment, deleteComment } = useComments(entryId);

  const [commentText, setCommentText] = useState('');
  const [commentImage, setCommentImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const imageInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleCommentImageSelect(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    setCommentImage(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  function clearCommentImage() {
    setCommentImage(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  async function handleSubmitComment() {
    if (!entry || !user?.uid || !user?.email) return;
    if (!commentText.trim() && !commentImage) return;
    setSubmitting(true);
    try {
      let imageUrl = null;
      if (commentImage) {
        const dateKey = normalizeDateKey(entry.date) || entry.date;
        const uploaded = await uploadImages([commentImage], dateKey, user.uid);
        imageUrl = uploaded[0]?.url ?? null;
      }
      await addComment({
        userId: user.uid,
        userEmail: user.email,
        userDisplayName: USER_PROFILES[user.email]?.displayName ?? user.email,
        text: commentText.trim(),
        imageUrl,
      });
      setCommentText('');
      clearCommentImage();
      onCommentsUpdated?.(entry.id);
    } catch (err) {
      console.error('[CommentsScreen]', err);
    } finally {
      setSubmitting(false);
    }
  }

  if (!entry) return null;

  const authorLeft = isLeftUser(entry.userEmail);

  return (
    <div className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm flex flex-col justify-end touch-scroll-overlay">
      <button
        type="button"
        className="absolute inset-0 cursor-default z-0"
        aria-label="Kapat"
        onClick={onClose}
      />

      <div
        className="relative z-10 bg-lb-surface rounded-t-[2rem] flex flex-col max-h-[90dvh] shadow-book border border-lb-border border-b-0 touch-scroll-overlay"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-lb-border" />
        </div>

        <div className="flex items-center justify-between px-5 pb-3 border-b border-lb-border shrink-0">
          <h3 className="font-display text-lg text-lb-text">Yorumlar</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-full bg-lb-elevated flex items-center justify-center text-lb-subtext hover:text-lb-text transition active:scale-[0.98]"
            aria-label="Kapat"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-3 border-b border-lb-border/50 bg-lb-canvas/60 flex gap-3 items-start shrink-0">
          <div
            className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
              authorLeft ? 'bg-lb-accent text-lb-page' : 'bg-lb-accent2 text-white'
            }`}
          >
            {entry.userDisplayName?.[0] ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-lb-text">{entry.userDisplayName}</p>
            <p className="text-xs text-lb-subtext line-clamp-2 mt-0.5">{entry.text || entry.title || '—'}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 touch-scroll-overlay min-h-[120px]">
          {loading && <p className="text-sm text-lb-subtext font-hero-sub">Yükleniyor…</p>}
          {!loading &&
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 items-start">
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    isLeftUser(comment.userEmail) ? 'bg-lb-accent text-lb-page' : 'bg-lb-accent2 text-white'
                  }`}
                >
                  {comment.userDisplayName?.[0] ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-lb-text">{comment.userDisplayName}</span>
                    <span className="text-[10px] text-lb-subtext">{formatCommentTime(comment.createdAt)}</span>
                  </div>
                  {comment.text && (
                    <p className="text-sm text-lb-text/90 mt-0.5 leading-relaxed font-hero-sub">{comment.text}</p>
                  )}
                  {comment.imageUrl && (
                    <img
                      src={comment.imageUrl}
                      className="mt-2 rounded-xl max-w-[200px] border border-lb-border"
                      alt=""
                    />
                  )}
                </div>
                {comment.userId === user?.uid && (
                  <button
                    type="button"
                    onClick={() => {
                      void deleteComment(comment.id);
                      onCommentsUpdated?.(entry.id);
                    }}
                    className="text-lb-subtext hover:text-lb-danger text-xs px-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition active:scale-[0.98]"
                    aria-label="Yorumu sil"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
        </div>

        <div className="px-4 py-3 border-t border-lb-border bg-lb-canvas/80 shrink-0">
          {previewUrl && (
            <div className="relative inline-block mb-2">
              <img src={previewUrl} className="h-16 w-16 rounded-xl object-cover border border-lb-border" alt="" />
              <button
                type="button"
                onClick={() => clearCommentImage()}
                className="absolute -top-1 -right-1 w-6 h-6 min-h-[44px] min-w-[44px] bg-lb-page rounded-full text-[10px] text-lb-text border border-lb-border flex items-center justify-center active:scale-[0.98]"
                aria-label="Fotoğrafı kaldır"
              >
                ×
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-lb-elevated border border-lb-border flex items-center justify-center text-lb-accent hover:border-lb-accent/50 transition flex-shrink-0 active:scale-[0.98]"
              aria-label="Fotoğraf ekle"
            >
              📷
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCommentImageSelect}
            />
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Yorum ekle…"
              rows={1}
              className="flex-1 bg-lb-elevated border border-lb-border rounded-2xl px-4 py-2.5 text-sm text-lb-text placeholder:text-lb-subtext outline-none focus:border-lb-accent focus:ring-2 focus:ring-lb-accent resize-none max-h-24 overflow-y-auto font-hero-sub"
              style={{ fontSize: 16 }}
            />
            <button
              type="button"
              onClick={() => void handleSubmitComment()}
              disabled={(!commentText.trim() && !commentImage) || submitting}
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-lb-accent text-lb-page flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition active:scale-[0.93] shadow-[0_4px_16px_rgba(227,176,92,0.3)]"
              aria-label="Gönder"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
