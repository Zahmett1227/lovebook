import { useRef } from 'react';

const MAX_MB = 10;
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

export default function ImageUploader({ onFilesSelected, uploading, onError }) {
  const inputRef = useRef(null);

  function handleChange(e) {
    const files = Array.from(e.target.files || []);
    const validFiles = [];

    for (const file of files) {
      const lowerName = file.name.toLowerCase();
      const isHeic = lowerName.endsWith('.heic') || lowerName.endsWith('.heif')
        || file.type?.includes('heic')
        || file.type?.includes('heif');
      const hasImageMime = file.type?.startsWith('image/');
      const hasImageExt = IMAGE_EXTENSIONS.some((ext) => lowerName.endsWith(ext));

      if (isHeic) {
        onError?.('Bu fotoğraf formatı desteklenmiyor, lütfen JPEG/PNG seç.');
        continue;
      }

      if (!hasImageMime && !hasImageExt) {
        onError?.('Lütfen yalnızca görsel dosyası seç.');
        continue;
      }

      if (file.size > MAX_MB * 1024 * 1024) {
        onError?.(`Fotoğraf boyutu en fazla ${MAX_MB} MB olabilir.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length) onFilesSelected(validFiles);
    e.target.value = '';
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="flex items-center justify-center gap-1.5 text-sm text-[#2d674d] hover:text-[#1f6b4b] border border-[#cbe3d5] rounded-2xl px-4 min-h-[44px] hover:border-[#7bb395] transition disabled:opacity-50 active:scale-[0.98]"
      >
        <span>📷</span>
        <span>{uploading ? 'Yükleniyor…' : 'Fotoğraf Ekle'}</span>
      </button>
    </div>
  );
}
