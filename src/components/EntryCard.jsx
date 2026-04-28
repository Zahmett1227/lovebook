import { useState } from 'react';
import { MOOD_OPTIONS } from '../config/appConfig';
import ImageLightbox from './ImageLightbox';

export default function EntryCard({ entry, isOwner, onEdit, onDelete }) {
  const [lightbox, setLightbox] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const mood = MOOD_OPTIONS.find((m) => m.value === entry.mood);

  return (
    <div className="bg-white rounded-xl border border-[#e8d5c0] p-4 space-y-2 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {entry.title && (
            <span className="text-sm font-semibold text-[#3d2b1f]">{entry.title}</span>
          )}
          {mood && (
            <span className="text-xs bg-[#faf0e6] border border-[#e8d5c0] rounded-full px-2 py-0.5 text-[#8a6a5a]">
              {mood.emoji} {mood.label}
            </span>
          )}
        </div>
        {isOwner && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(entry)}
              className="text-xs text-[#b09080] hover:text-[#5c3d2a] px-1.5 py-0.5 rounded hover:bg-[#f5ead8] transition-colors"
            >
              Düzenle
            </button>
            {confirmDelete ? (
              <span className="flex items-center gap-1">
                <button
                  onClick={() => onDelete(entry.id)}
                  className="text-xs text-red-600 hover:text-red-700 px-1.5 py-0.5 rounded"
                >
                  Sil
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-[#b09080] px-1"
                >
                  İptal
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-[#b09080] hover:text-red-500 px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* Text */}
      {entry.text && (
        <p className="text-sm text-[#5c3d2a] leading-relaxed whitespace-pre-wrap">
          {entry.text}
        </p>
      )}

      {/* Images */}
      {entry.imageUrls?.length > 0 && (
        <div className="grid grid-cols-3 gap-1">
          {entry.imageUrls.map((img, i) => (
            <button
              key={i}
              onClick={() => setLightbox(i)}
              className="aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
            >
              <img
                src={typeof img === 'object' ? img.url : img}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      <p className="text-[10px] text-[#c0a090]">
        {entry.userDisplayName}
        {entry.createdAt?.toDate &&
          ` · ${entry.createdAt.toDate().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`}
      </p>

      {lightbox !== null && (
        <ImageLightbox
          images={(entry.imageUrls || []).map((img) =>
            typeof img === 'object' ? img.url : img
          )}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
