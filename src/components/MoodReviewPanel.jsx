import { useMemo } from 'react';
import { MEMORY_TAGS, getMemoryTagById, normalizeMemoryTagId } from '../config/memoryTags';

export default function MoodReviewPanel({
  entries,
  loading,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  activeTagFilter,
  onTagFilterChange,
  onOpenDate,
  listError = null,
  onRetryList,
}) {
  const filtered = useMemo(() => {
    const safeEntries = Array.isArray(entries) ? entries : [];
    return safeEntries
      .filter((entry) => {
        if (!entry?.date) return false;
        if (activeTagFilter === 'all') return true;
        return normalizeMemoryTagId(entry.tag || entry.mood || null) === activeTagFilter;
      })
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
  }, [entries, activeTagFilter]);

  return (
    <div className="px-4 sm:px-6 pt-4 pb-6">
      <div className="rounded-3xl border border-lb-border bg-lb-elevated/90 p-4 sm:p-6 ring-1 ring-lb-accent/10 shadow-editorial">
        <h3 className="font-display text-2xl text-lb-text mb-1">Mooda göre anılar</h3>
        <p className="text-xs text-lb-subtext mb-4 font-hero-sub">
          Emoji etiketine göre filtreleyip anıları inceleyebilirsin.
        </p>

        {listError && !loading && (
          <div
            role="alert"
            className="mb-3 rounded-xl border border-lb-danger/35 bg-lb-danger/10 px-3 py-2 text-xs text-lb-text flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <span>{listError}</span>
            {onRetryList && (
              <button
                type="button"
                onClick={onRetryList}
                className="shrink-0 rounded-lg border border-lb-border bg-lb-surface px-2.5 py-1 text-[11px] font-medium text-lb-accent active:scale-[0.98]"
              >
                Tekrar dene
              </button>
            )}
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <TagChip
            active={activeTagFilter === 'all'}
            onClick={() => onTagFilterChange('all')}
            label="Tümü"
          />
          {MEMORY_TAGS.map((tag) => (
            <TagChip
              key={tag.id}
              active={activeTagFilter === tag.id}
              onClick={() => onTagFilterChange(tag.id)}
              label={`${tag.emoji} ${tag.label}`}
            />
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {loading ? (
            <p className="text-sm text-lb-subtext font-hero-sub">Anılar yükleniyor…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-lb-subtext font-hero-sub">Bu kritere uygun anı bulunamadı.</p>
          ) : (
            filtered.map((entry) => {
              const tagMeta = getMemoryTagById(normalizeMemoryTagId(entry.tag || entry.mood || null));
              return (
                <button
                  type="button"
                  key={entry.id}
                  onClick={() => onOpenDate(entry.date)}
                  className="w-full text-left rounded-2xl border border-lb-border bg-lb-canvas hover:bg-lb-muted/40 px-4 py-3 transition active:scale-[0.99]"
                >
                  <p className="text-[11px] text-lb-subtext font-hero-sub">
                    {entry.date} • {entry.userDisplayName}
                  </p>
                  <p className="text-sm text-lb-text line-clamp-2 mt-1">{entry.text || entry.title || 'Metin yok'}</p>
                  {tagMeta && (
                    <span className="inline-flex mt-2 text-xs rounded-full border border-lb-border bg-lb-elevated text-lb-accent px-2.5 py-1 font-hero-sub">
                      {tagMeta.emoji} {tagMeta.label}
                    </span>
                  )}
                </button>
              );
            })
          )}
          {!loading && filtered.length > 0 && hasMore && (
            <button
              type="button"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="w-full rounded-xl border border-lb-accent/35 bg-lb-accent/10 hover:bg-lb-accent/20 text-lb-accent text-sm py-3 font-medium transition disabled:opacity-60 active:scale-[0.98]"
            >
              {loadingMore ? 'Yükleniyor…' : 'Daha fazla'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TagChip({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs whitespace-nowrap rounded-full border px-3 min-h-[36px] transition active:scale-[0.98] font-hero-sub ${
        active
          ? 'bg-lb-accent border-lb-accent text-lb-page shadow-glow'
          : 'bg-lb-canvas border-lb-border text-lb-subtext hover:border-lb-accent/35'
      }`}
    >
      {label}
    </button>
  );
}
