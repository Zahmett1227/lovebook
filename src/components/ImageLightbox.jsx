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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 lightbox-overlay flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none"
        onClick={onClose}
      >
        ×
      </button>
      <img
        src={images[startIndex]}
        alt=""
        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
