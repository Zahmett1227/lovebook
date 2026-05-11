import { useEffect } from 'react';

export default function ImageLightbox({ images, startIndex, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!images?.length) return null;
  const safeIndex = Number.isInteger(startIndex) && startIndex >= 0 && startIndex < images.length
    ? startIndex
    : 0;

  return (
    <div
      className="fixed inset-0 z-[110] bg-black/90 lightbox-overlay flex items-center justify-center p-4"
      onClick={onClose}
      role="presentation"
    >
      <button
        type="button"
        className="absolute top-4 right-4 text-white/60 hover:text-white text-3xl w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition active:scale-[0.98]"
        onClick={onClose}
        aria-label="Kapat"
      >
        ×
      </button>
      <img
        src={images[safeIndex]}
        alt=""
        className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
