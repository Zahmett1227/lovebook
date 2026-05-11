import { useEffect, useMemo, useState } from 'react';
import { MEMORY_TAGS, normalizeMemoryTagId } from '../config/memoryTags';
import ImageUploader from './ImageUploader';
import VideoUploader from './VideoUploader';
import { uploadImages, uploadVideos } from '../services/storageService';
import { normalizeImageUrls, normalizeVideoItems } from '../utils/imageUtils';
import { bytesToMb, estimateSessionCost } from '../utils/costUtils';
import { getErrorMessage, storageUserMessage } from '../utils/errorUtils';

export default function EntryForm({
  dateKey,
  userId,
  onSave,
  onCancel,
  initial,
  formId,
  hideSubmitButton = false,
  externalSaving = false,
}) {
  const [title, setTitle]   = useState(initial?.title ?? '');
  const [text, setText]     = useState(initial?.text ?? '');
  const [selectedTag, setSelectedTag] = useState(
    normalizeMemoryTagId(initial?.tag || initial?.mood || '')
  );
  const [images, setImages] = useState(normalizeImageUrls(initial?.imageUrls));
  const [videos, setVideos] = useState(normalizeVideoItems(initial?.videoUrls));
  const [sessionFiles, setSessionFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [uploadError, setUploadError] = useState('');

  const sessionCost = useMemo(() => estimateSessionCost(sessionFiles), [sessionFiles]);
  const sessionSizeMb = useMemo(() => bytesToMb(sessionCost.totalBytes), [sessionCost.totalBytes]);
  const usagePercent = Math.min((sessionSizeMb / 100) * 100, 100);

  useEffect(() => {
    const payload = {
      totalBytes: sessionCost.totalBytes,
      storageUsd: sessionCost.storageUsd,
      operationUsd: sessionCost.operationUsd,
      totalUsd: sessionCost.totalUsd,
      uploadOps: sessionCost.uploadOps,
    };
    try {
      localStorage.setItem('lovebook-session-cost', JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent('lovebook-session-cost-update', { detail: payload }));
    } catch {
      // best effort only
    }
  }, [sessionCost]);

  async function handleImageFiles(files) {
    setUploadError('');
    setUploading(true);
    try {
      const uploaded = await uploadImages(files, dateKey, userId);
      console.log('[STORAGE_UPLOAD_SUCCESS]', uploaded.length, 'files');
      setImages((prev) => [...(Array.isArray(prev) ? prev : []), ...uploaded]);
      setSessionFiles((prev) => [...prev, ...files]);
      if (uploaded.length < files.length) {
        setUploadError(`Bazı fotoğraflar yüklenemedi (${uploaded.length}/${files.length}).`);
      }
    } catch (err) {
      const message = storageUserMessage(err) || getErrorMessage(err, 'Fotoğraf yüklenemedi.');
      console.error('[STORAGE_UPLOAD_ERROR]', err?.code, message);
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  }

  async function handleVideoFiles(files) {
    setUploadError('');
    setUploading(true);
    try {
      const uploaded = await uploadVideos(files, dateKey, userId);
      console.log('[STORAGE_UPLOAD_SUCCESS]', uploaded.length, 'videos');
      setVideos((prev) => [...(Array.isArray(prev) ? prev : []), ...uploaded]);
      setSessionFiles((prev) => [...prev, ...files]);
      if (uploaded.length < files.length) {
        setUploadError(`Bazı videolar yüklenemedi (${uploaded.length}/${files.length}).`);
      }
    } catch (err) {
      const message = storageUserMessage(err) || getErrorMessage(err, 'Video yüklenemedi.');
      console.error('[STORAGE_UPLOAD_ERROR]', err?.code, message);
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index) {
    setImages((prev) => (Array.isArray(prev) ? prev.filter((_, i) => i !== index) : []));
  }

  function removeVideo(index) {
    setVideos((prev) => (Array.isArray(prev) ? prev.filter((_, i) => i !== index) : []));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() && !text.trim() && images.length === 0 && videos.length === 0) return;
    if (externalSaving) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        text: text.trim(),
        tag: selectedTag || '',
        mood: selectedTag || '',
        favorite: initial?.favorite ?? false,
        imageUrls: images,
        videoUrls: videos,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-3">
      {uploadError && (
        <p className="text-xs text-lb-danger bg-lb-danger/10 border border-lb-danger/30 rounded-xl px-3 py-2">
          {uploadError}
        </p>
      )}

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Başlık (isteğe bağlı)"
        className="lb-input"
      />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Bugün ne yaşadın? Ne hissettin?"
        rows={5}
        className="lb-input resize-y min-h-[120px]"
      />

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
        {MEMORY_TAGS.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => setSelectedTag(selectedTag === tag.id ? '' : tag.id)}
            className={`font-hero-sub text-sm min-h-[44px] rounded-full px-3 border active:scale-[0.98] transition ${
              selectedTag === tag.id
                ? `${tag.color} shadow-[0_0_16px_rgba(227,176,92,0.2)]`
                : 'bg-lb-canvas border-lb-border text-lb-subtext hover:border-lb-accent/40'
            }`}
          >
            {tag.emoji} {tag.label}
          </button>
        ))}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square">
              <img
                src={typeof img === 'object' ? img.url : img}
                alt=""
                className="w-full h-full object-cover rounded-xl border border-lb-border"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-lb-text rounded-full text-xs flex items-center justify-center leading-none active:scale-[0.98]"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {videos.map((video, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden border border-lb-border bg-lb-canvas">
              <video
                src={video.url}
                controls
                preload="metadata"
                className="w-full h-36 object-cover"
              />
              <button
                type="button"
                onClick={() => removeVideo(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-lb-text rounded-full text-xs flex items-center justify-center leading-none active:scale-[0.98]"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {sessionFiles.length > 0 && (
        <div className="rounded-2xl border border-lb-border bg-lb-canvas p-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-lb-subtext">
            <span>Blaze tahmini (bu oturum)</span>
            <span className="text-lb-text font-medium">{sessionSizeMb.toFixed(2)} MB</span>
          </div>
          <div className="h-2 rounded-full bg-lb-muted overflow-hidden">
            <div
              className="h-full bg-lb-accent transition-all"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="text-[11px] text-lb-subtext">
            Depolama: ${sessionCost.storageUsd.toFixed(4)} • İşlem: ${sessionCost.operationUsd.toFixed(4)} • Toplam: ${sessionCost.totalUsd.toFixed(4)}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <ImageUploader
          onFilesSelected={handleImageFiles}
          uploading={uploading}
          onError={setUploadError}
        />
        <VideoUploader
          onFilesSelected={handleVideoFiles}
          uploading={uploading}
          onError={setUploadError}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="lb-btn-ghost text-sm px-4 active:scale-[0.98]">
          İptal
        </button>
        {!hideSubmitButton && (
          <button
            type="submit"
            disabled={saving || uploading || externalSaving}
            className="lb-btn-primary text-sm px-6 disabled:opacity-50 active:scale-[0.98]"
          >
            {saving || externalSaving ? 'Kaydediliyor…' : initial ? 'Güncelle' : 'Kaydet'}
          </button>
        )}
      </div>
    </form>
  );
}
