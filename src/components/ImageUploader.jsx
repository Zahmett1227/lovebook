import { useRef } from 'react';

export default function ImageUploader({ onFilesSelected, uploading }) {
  const inputRef = useRef(null);

  function handleChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length) onFilesSelected(files);
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
        className="flex items-center gap-1.5 text-xs text-[#8a6a5a] hover:text-[#5c3d2a] border border-[#e0cdb8] rounded-lg px-3 py-1.5 hover:border-[#c9a98a] transition-colors disabled:opacity-50"
      >
        <span>📷</span>
        <span>{uploading ? 'Yükleniyor…' : 'Fotoğraf Ekle'}</span>
      </button>
    </div>
  );
}
