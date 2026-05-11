import { useState } from 'react';
import { getMemoryTagById, normalizeMemoryTagId } from '../config/memoryTags';
import { normalizeImageUrls, normalizeVideoItems } from '../utils/imageUtils';
import ImageLightbox from './ImageLightbox';

export default function EntryCard({ entry, isOwner, onEdit, onDelete, onToggleFavorite }) {
  const [lightbox, setLightbox] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const entryTag = normalizeMemoryTagId(entry.tag || entry.mood || null);
  const tagMeta = getMemoryTagById(entryTag);
  const imageUrls = normalizeImageUrls(entry.imageUrls);
  const videoItems = normalizeVideoItems(entry.videoUrls);
  const createdTime = entry.createdAt?.toDate
    ? entry.createdAt.toDate().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="bg-lb-elevated rounded-2xl border border-lb-border p-4 space-y-3 shadow-editorial ring-1 ring-white/[0.03]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-lb-text">{entry.userDisplayName}</span>
          <span className="text-[11px] text-lb-subtext">{createdTime}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onToggleFavorite?.(entry)}
            className="text-sm px-2 min-h-[32px] rounded-xl hover:bg-lb-muted text-lb-accent transition-colors"
            aria-label={entry.favorite ? 'Favoriden çıkar' : 'Favoriye ekle'}
            title={entry.favorite ? 'Favoriden çıkar' : 'Favoriye ekle'}
          >
            {entry.favorite ? '⭐' : '☆'}
          </button>
          {isOwner && (
            <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(entry)}
              className="text-xs text-lb-accent hover:text-lb-text px-2 min-h-[32px] rounded-xl hover:bg-lb-muted transition-colors"
            >
              Düzenle
            </button>
            {confirmDelete ? (
              <span className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  className="text-xs text-lb-danger hover:text-red-300 px-2 min-h-[32px] rounded-xl"
                >
                  Sil
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-lb-subtext px-2 min-h-[32px]"
                >
                  İptal
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-lb-subtext hover:text-lb-danger px-2 min-h-[32px] rounded-xl hover:bg-lb-danger/10 transition-colors"
              >
                ×
              </button>
            )}
            </div>
          )}
        </div>
      </div>

      {entry.text && (
        <p className="text-sm text-lb-text/95 leading-relaxed whitespace-pre-wrap">
          {entry.text}
        </p>
      )}

      {entry.title && (
        <p className="text-xs font-medium text-lb-accent bg-lb-accent/10 border border-lb-accent/25 rounded-full px-3 py-1 inline-flex">
          {entry.title}
        </p>
      )}

      {imageUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5">
          {imageUrls.map((img, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setLightbox(i)}
              className="aspect-square rounded-xl overflow-hidden border border-lb-border hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              <img
                src={img}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {videoItems.length > 0 && (
        <div className="space-y-2">
          {videoItems.map((video, i) => (
            <div key={`${video.url}-${i}`} className="rounded-xl overflow-hidden border border-lb-border bg-lb-canvas">
              <video
                src={video.url}
                controls
                preload="none"
                className="w-full max-h-64 object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {tagMeta && (
        <p className={`text-xs border rounded-full px-2.5 py-1 inline-flex ${tagMeta.color}`}>
          {tagMeta.emoji} {tagMeta.label}
        </p>
      )}

      {lightbox !== null && (
        <ImageLightbox
          images={imageUrls}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
