import { useMemo } from 'react';
import { MEMORY_TAGS, getMemoryTagById, normalizeMemoryTagId } from '../config/memoryTags';

export default function MoodReviewPanel({
  entries,
  loading,
  activeTagFilter,
  onTagFilterChange,
  onOpenDate,
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
      <div className="rounded-3xl border border-[#ead8d1] bg-[#fff9f7]/90 p-4 sm:p-5 shadow-editorial">
        <h3 className="font-display text-2xl text-[#633f41] mb-1">Mooda göre anılar</h3>
        <p className="text-xs text-[#8f6661] mb-3">Emoji etiketine göre filtreleyip anıları inceleyebilirsin.</p>

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

        <div className="mt-3 space-y-2">
          {loading ? (
            <p className="text-sm text-[#8f6661]">Anılar yükleniyor…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-[#8f6661]">Bu kritere uygun anı bulunamadı.</p>
          ) : (
            filtered.map((entry) => {
              const tagMeta = getMemoryTagById(normalizeMemoryTagId(entry.tag || entry.mood || null));
              return (
                <button
                  key={entry.id}
                  onClick={() => onOpenDate(entry.date)}
                  className="w-full text-left rounded-2xl border border-[#ead8d1] bg-white hover:bg-[#fff3ef] px-3 py-3 transition active:scale-[0.99]"
                >
                  <p className="text-[11px] text-[#9a726c]">{entry.date} • {entry.userDisplayName}</p>
                  <p className="text-sm text-[#5e3f3f] mt-1 line-clamp-2">{entry.text || entry.title || 'Metin yok'}</p>
                  {tagMeta && (
                    <span className="inline-flex mt-2 text-xs rounded-full border border-[#ecd8d1] bg-[#fff7f3] text-[#7a4f4f] px-2.5 py-1">
                      {tagMeta.emoji} {tagMeta.label}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function TagChip({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs whitespace-nowrap rounded-full border px-3 min-h-[36px] transition active:scale-[0.98] ${
        active
          ? 'bg-[#8f5f5f] border-[#8f5f5f] text-white'
          : 'bg-[#fffaf8] border-[#e7d3cb] text-[#7a4f4f] hover:bg-[#f8ece7]'
      }`}
    >
      {label}
    </button>
  );
}
