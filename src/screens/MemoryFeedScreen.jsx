import { useEffect, useMemo, useRef, useState } from 'react';
import { MEMORY_TAGS } from '../config/memoryTags';
import { ALLOWED_USERS, USER_PROFILES, generateCoupleId } from '../config/appConfig';
import { useCoupleProfile } from '../hooks/useCoupleProfile';
import { getMemoryTagById, normalizeMemoryTagId } from '../config/memoryTags';
import { formatDateDisplay } from '../utils/dateUtils';
import { normalizeImageUrls, normalizeVideoItems, resolveImageUrl } from '../utils/imageUtils';

export default function MemoryFeedScreen({
  allEntries = [],
  loading = false,
  currentUserEmail = '',
  onOpenComments,
  onToggleFavorite,
  onDeleteEntry,
  onEditEntry,
}) {
  const [sortOrder, setSortOrder] = useState('newest');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const coupleId = useMemo(() => generateCoupleId(ALLOWED_USERS[0], ALLOWED_USERS[1]), []);
  const { profile } = useCoupleProfile(coupleId);
  const leftEmail = useMemo(() => ALLOWED_USERS.find((e) => USER_PROFILES[e]?.side === 'left'), []);
  const rightEmail = useMemo(() => ALLOWED_USERS.find((e) => USER_PROFILES[e]?.side === 'right'), []);

  function getAvatarUrl(userEmail) {
    if (userEmail === leftEmail) return profile?.leftUserPhotoUrl ?? null;
    if (userEmail === rightEmail) return profile?.rightUserPhotoUrl ?? null;
    return null;
  }

  const displayedEntries = useMemo(() => {
    let list = [...(Array.isArray(allEntries) ? allEntries : [])];
    if (activeFilter !== 'all') {
      list = list.filter(
        (e) => normalizeMemoryTagId(e.tag || e.mood || null) === activeFilter
      );
    }
    list.sort((a, b) => {
      const da = new Date(`${a.date}T12:00:00`);
      const db = new Date(`${b.date}T12:00:00`);
      const ta = da.getTime();
      const tb = db.getTime();
      return sortOrder === 'newest' ? tb - ta : ta - tb;
    });
    return list;
  }, [allEntries, sortOrder, activeFilter]);

  function toggleSort() {
    setSortOrder((o) => (o === 'newest' ? 'oldest' : 'newest'));
  }

  return (
    <div className="min-h-0 flex flex-col bg-lb-page/40">
      <div className="sticky top-0 z-30 bg-lb-canvas/95 backdrop-blur-xl border-b border-lb-border px-4 py-3 flex items-center gap-2 touch-scroll-overlay">
        <h1 className="font-display text-xl text-lb-text flex-1">Anılar</h1>
        <button
          type="button"
          onClick={() => toggleSort()}
          className="flex items-center gap-1.5 text-xs text-lb-subtext border border-lb-border bg-lb-elevated rounded-full px-3 min-h-[36px] hover:border-lb-accent/40 transition active:scale-[0.98]"
        >
          {sortOrder === 'newest' ? '↓ Yeniden eskiye' : '↑ Eskiden yeniye'}
        </button>
        <button
          type="button"
          onClick={() => setShowFilterSheet(true)}
          className="flex items-center gap-1.5 text-xs text-lb-subtext border border-lb-border bg-lb-elevated rounded-full px-3 min-h-[36px] hover:border-lb-accent/40 transition active:scale-[0.98]"
        >
          🎯 Filtrele
          {activeFilter !== 'all' && (
            <span className="w-1.5 h-1.5 rounded-full bg-lb-accent ml-1" aria-hidden />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-4 touch-scroll-overlay">
        {loading ? (
          <p className="text-sm text-lb-subtext px-4 py-6 font-hero-sub">Anılar yükleniyor…</p>
        ) : displayedEntries.length === 0 ? (
          <p className="text-sm text-lb-subtext px-4 py-6 font-hero-sub">Bu kritere uygun anı yok.</p>
        ) : (
          displayedEntries.map((entry) => (
            <FeedPost
              key={entry.id}
              entry={entry}
              isOwner={Boolean(currentUserEmail && entry.userEmail === currentUserEmail)}
              menuOpen={menuOpenId === entry.id}
              onMenuToggle={() => setMenuOpenId((id) => (id === entry.id ? null : entry.id))}
              onCloseMenu={() => setMenuOpenId(null)}
              onOpenComments={onOpenComments}
              onToggleFavorite={onToggleFavorite}
              onDeleteEntry={onDeleteEntry}
              onEditEntry={onEditEntry}
              avatarUrl={getAvatarUrl(entry.userEmail)}
            />
          ))
        )}
      </div>

      {showFilterSheet && (
        <FilterBottomSheet
          activeFilter={activeFilter}
          onApply={(id) => {
            setActiveFilter(id);
            setShowFilterSheet(false);
          }}
          onClear={() => {
            setActiveFilter('all');
            setShowFilterSheet(false);
          }}
          onClose={() => setShowFilterSheet(false)}
        />
      )}
    </div>
  );
}

function FeedPost({
  entry,
  isOwner,
  menuOpen,
  onMenuToggle,
  onCloseMenu,
  onOpenComments,
  onToggleFavorite,
  onDeleteEntry,
  onEditEntry,
  avatarUrl = null,
}) {
  const tagMeta = getMemoryTagById(normalizeMemoryTagId(entry.tag || entry.mood || null));
  const imageUrls = normalizeImageUrls(entry.imageUrls);
  const videoItems = normalizeVideoItems(entry.videoUrls);
  const resolvedImages = imageUrls.map((u) => resolveImageUrl(u)).filter(Boolean);
  const isLeftUser = USER_PROFILES[entry.userEmail]?.side === 'left';
  const scrollRef = useRef(null);
  const [activeImg, setActiveImg] = useState(0);

  function onScrollSnap() {
    const el = scrollRef.current;
    if (!el || resolvedImages.length < 2) return;
    const w = el.clientWidth;
    const i = Math.round(el.scrollLeft / w);
    setActiveImg(Math.min(Math.max(i, 0), resolvedImages.length - 1));
  }

  const displayName = entry.userDisplayName?.trim() || '?';
  const initial = displayName[0] ?? '?';

  return (
    <article className="border-b border-lb-border/60 pb-1 mb-1">
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className={`w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ${
            isLeftUser ? 'ring-lb-accent/40' : 'ring-lb-accent2/40'
          }`}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center text-sm font-bold ${
                isLeftUser ? 'bg-lb-accent text-lb-page' : 'bg-lb-accent2 text-white'
              }`}
            >
              {initial}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-lb-text truncate">{displayName}</p>
          <p className="text-[11px] text-lb-subtext">
            {formatDateDisplay(entry.date)}
            {tagMeta && (
              <span>
                {' '}
                · {tagMeta.emoji} {tagMeta.label}
              </span>
            )}
          </p>
        </div>
        {isOwner && (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => onMenuToggle()}
              className="text-lb-subtext px-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-lb-elevated transition active:scale-[0.98]"
              aria-expanded={menuOpen}
              aria-label="Anı seçenekleri"
            >
              ···
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 rounded-xl border border-lb-border bg-lb-elevated shadow-book py-1 min-w-[140px]">
                <button
                  type="button"
                  className="w-full text-left text-sm px-3 py-2.5 min-h-[44px] text-lb-text hover:bg-lb-muted active:scale-[0.98]"
                  onClick={() => {
                    onCloseMenu();
                    onEditEntry?.(entry);
                  }}
                >
                  Düzenle
                </button>
                <button
                  type="button"
                  className="w-full text-left text-sm px-3 py-2.5 min-h-[44px] text-lb-danger hover:bg-lb-danger/10 active:scale-[0.98]"
                  onClick={() => {
                    onCloseMenu();
                    if (window.confirm('Bu anıyı silmek istediğine emin misin?')) {
                      void onDeleteEntry?.(entry.id);
                    }
                  }}
                >
                  Sil
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {resolvedImages.length > 0 && (
        <div className="relative w-full bg-lb-canvas">
          {resolvedImages.length === 1 ? (
            <div className="aspect-square w-full">
              <img
                src={resolvedImages[0]}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <>
              <div
                ref={scrollRef}
                onScroll={onScrollSnap}
                className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar aspect-square touch-scroll-overlay"
              >
                {resolvedImages.map((src, i) => (
                  <div key={src + i} className="w-full flex-shrink-0 snap-start aspect-square">
                    <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 pointer-events-none">
                {resolvedImages.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition ${
                      i === activeImg ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {videoItems.length > 0 && resolvedImages.length === 0 && (
        <video
          src={videoItems[0].url}
          controls
          preload="none"
          className="w-full max-h-80 bg-lb-canvas object-cover"
        />
      )}

      <div className="flex items-center gap-1 px-3 pt-2 pb-1">
        <button
          type="button"
          onClick={() => void onToggleFavorite?.(entry)}
          className="text-xl p-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition active:scale-[0.88]"
          aria-label={entry.favorite ? 'Favoriden çıkar' : 'Favoriye ekle'}
        >
          {entry.favorite ? '♥' : '♡'}
        </button>
        <button
          type="button"
          onClick={() => onOpenComments?.(entry)}
          className="text-xl p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-lb-subtext hover:text-lb-text transition active:scale-[0.98]"
          aria-label="Yorumlar"
        >
          💬
        </button>
        {(entry.commentCount ?? 0) > 0 && (
          <span className="text-xs text-lb-subtext ml-1">{entry.commentCount} yorum</span>
        )}
      </div>

      <div className="px-4 pb-3 space-y-1">
        {entry.title && (
          <p className="text-sm font-semibold text-lb-text">{entry.title}</p>
        )}
        {entry.text && (
          <p className="text-sm text-lb-text/90 leading-relaxed font-hero-sub line-clamp-3">{entry.text}</p>
        )}
        {(entry.commentCount ?? 0) > 0 && (
          <button
            type="button"
            onClick={() => onOpenComments?.(entry)}
            className="text-xs text-lb-subtext hover:text-lb-accent transition pt-0.5 active:scale-[0.98]"
          >
            {entry.commentCount} yorumun tamamını gör
          </button>
        )}
      </div>
    </article>
  );
}

function FilterBottomSheet({ activeFilter, onApply, onClear, onClose }) {
  const [pending, setPending] = useState(activeFilter);
  useEffect(() => {
    setPending(activeFilter);
  }, [activeFilter]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end touch-scroll-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="bg-lb-surface rounded-t-[2rem] p-6 max-h-[85dvh] overflow-y-auto touch-scroll-overlay"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-lg text-lb-text mb-4">Mood&apos;a göre filtrele</h3>
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            type="button"
            onClick={() => setPending('all')}
            className={`rounded-2xl border px-4 py-3 min-h-[52px] text-sm font-hero-sub transition active:scale-[0.98] ${
              pending === 'all'
                ? 'bg-lb-accent/15 border-lb-accent text-lb-accent'
                : 'bg-lb-elevated border-lb-border text-lb-subtext'
            }`}
          >
            Tümü
          </button>
          {MEMORY_TAGS.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setPending(tag.id)}
              className={`rounded-2xl border px-4 py-3 min-h-[52px] text-sm font-hero-sub transition active:scale-[0.98] ${
                pending === tag.id
                  ? 'bg-lb-accent/15 border-lb-accent text-lb-accent'
                  : 'bg-lb-elevated border-lb-border text-lb-subtext'
              }`}
            >
              {tag.emoji} {tag.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onApply(pending)}
          className="lb-btn-primary w-full min-h-[48px] mb-2 active:scale-[0.98]"
        >
          Uygula
        </button>
        <button type="button" onClick={onClear} className="lb-btn-ghost w-full min-h-[48px] active:scale-[0.98]">
          Temizle
        </button>
      </div>
    </div>
  );
}
