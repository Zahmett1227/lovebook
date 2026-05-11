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
      className="fixed inset-0 z-[110] bg-black/85 lightbox-overlay flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none"
        onClick={onClose}
      >
        ×
      </button>
      <img
        src={images[safeIndex]}
        alt=""
        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
