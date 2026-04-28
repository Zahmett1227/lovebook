import { useState } from 'react';
import { MOOD_OPTIONS } from '../config/appConfig';
import ImageLightbox from './ImageLightbox';

const MOOD_BADGE_STYLE = {
  happy: 'bg-[#fff5c7] text-[#7a5a00] border-[#f3de82]',
  miss: 'bg-[#e7f0ff] text-[#2f4f8c] border-[#b9ccf0]',
  funny: 'bg-[#efe9ff] text-[#5d4391] border-[#d0bff3]',
  travel: 'bg-[#e8f8ff] text-[#2a6077] border-[#b8dff0]',
  special: 'bg-[#ffecee] text-[#8c3f4d] border-[#f0bfca]',
  surprise: 'bg-[#fff0da] text-[#8b5a2b] border-[#edc89a]',
  heart: 'bg-[#ffe9ee] text-[#913e53] border-[#f0bfd0]',
};

export default function EntryCard({ entry, isOwner, onEdit, onDelete }) {
  const [lightbox, setLightbox] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const mood = MOOD_OPTIONS.find((m) => m.value === entry.mood);
  const createdTime = entry.createdAt?.toDate
    ? entry.createdAt.toDate().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="bg-white rounded-2xl border border-[#cbe3d5] p-4 space-y-3 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-[#174330]">{entry.userDisplayName}</span>
          <span className="text-[11px] text-[#77a58f]">{createdTime}</span>
        </div>
        {isOwner && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(entry)}
              className="text-xs text-[#6e9f87] hover:text-[#1f6b4b] px-2 min-h-[32px] rounded-xl hover:bg-[#edf8f2] transition-colors"
            >
              Düzenle
            </button>
            {confirmDelete ? (
              <span className="flex items-center gap-1">
                <button
                  onClick={() => onDelete(entry.id)}
                  className="text-xs text-red-600 hover:text-red-700 px-2 min-h-[32px] rounded-xl"
                >
                  Sil
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-[#6e9f87] px-2 min-h-[32px]"
                >
                  İptal
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-[#6e9f87] hover:text-red-500 px-2 min-h-[32px] rounded-xl hover:bg-red-50 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* Text */}
      {entry.text && (
        <p className="text-sm text-[#22533c] leading-relaxed whitespace-pre-wrap">
          {entry.text}
        </p>
      )}

      {entry.title && (
        <p className="text-xs font-medium text-[#2d664d] bg-[#eaf6ef] border border-[#cbe3d5] rounded-full px-3 py-1 inline-flex">
          {entry.title}
        </p>
      )}

      {/* Images */}
      {entry.imageUrls?.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5">
          {entry.imageUrls.map((img, i) => (
            <button
              key={i}
              onClick={() => setLightbox(i)}
              className="aspect-square rounded-xl overflow-hidden hover:opacity-90 transition-opacity active:scale-[0.98]"
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
      {mood && (
        <p className={`text-xs border rounded-full px-2.5 py-1 inline-flex ${MOOD_BADGE_STYLE[mood.value] ?? 'text-[#2f6b51] bg-[#eaf6ef] border-[#cbe3d5]'}`}>
          {mood.emoji} {mood.label}
        </p>
      )}

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
