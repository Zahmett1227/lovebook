import { useState } from 'react';
import { MOOD_OPTIONS } from '../config/appConfig';
import ImageUploader from './ImageUploader';
import { uploadImages } from '../services/storageService';

const MOOD_CHIP_STYLE = {
  happy: 'bg-[#fff5c7] text-[#7a5a00] border-[#f3de82]',
  miss: 'bg-[#e7f0ff] text-[#2f4f8c] border-[#b9ccf0]',
  funny: 'bg-[#efe9ff] text-[#5d4391] border-[#d0bff3]',
  travel: 'bg-[#e8f8ff] text-[#2a6077] border-[#b8dff0]',
  special: 'bg-[#ffecee] text-[#8c3f4d] border-[#f0bfca]',
  surprise: 'bg-[#fff0da] text-[#8b5a2b] border-[#edc89a]',
  heart: 'bg-[#ffe9ee] text-[#913e53] border-[#f0bfd0]',
};

export default function EntryForm({ dateKey, userId, onSave, onCancel, initial }) {
  const [title, setTitle]   = useState(initial?.title ?? '');
  const [text, setText]     = useState(initial?.text ?? '');
  const [mood, setMood]     = useState(initial?.mood ?? '');
  const [images, setImages] = useState(initial?.imageUrls ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function handleFiles(files) {
    setUploadError('');
    setUploading(true);
    try {
      const uploaded = await uploadImages(files, dateKey, userId);
      console.log('[STORAGE_UPLOAD_SUCCESS]', uploaded.length, 'files');
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error('[STORAGE_UPLOAD_ERROR]', err.message);
      setUploadError(`Fotoğraf yüklenemedi: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() && !text.trim() && images.length === 0) return;
    setSaving(true);
    try {
      // onSave handles its own error state and logging
      await onSave({ title: title.trim(), text: text.trim(), mood, imageUrls: images });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {uploadError && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {uploadError}
        </p>
      )}

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Başlık (isteğe bağlı)"
        className="w-full border border-[#cbe3d5] rounded-2xl px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#7bb395] text-[#174330]"
      />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Bugün ne yaşadın? Ne hissettin?"
        rows={5}
        className="w-full border border-[#cbe3d5] rounded-2xl px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#7bb395] text-[#174330] resize-y min-h-[120px]"
      />

      <div className="flex flex-wrap gap-2">
        {MOOD_OPTIONS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMood(mood === m.value ? '' : m.value)}
            className={`text-sm min-h-[44px] rounded-full px-3 border active:scale-[0.98] transition ${
              mood === m.value
                ? `${MOOD_CHIP_STYLE[m.value] ?? 'bg-[#1f6b4b] text-white border-[#1f6b4b]'} shadow-sm`
                : 'bg-white text-[#2e664c] border-[#cbe3d5] hover:border-[#7bb395]'
            }`}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square">
              <img
                src={typeof img === 'object' ? img.url : img}
                alt=""
                className="w-full h-full object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/65 text-white rounded-full text-sm flex items-center justify-center leading-none active:scale-[0.98]"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <ImageUploader
          onFilesSelected={handleFiles}
          uploading={uploading}
          onError={setUploadError}
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-[#6e9f87] hover:text-[#1f6b4b] px-4 min-h-[44px] rounded-2xl border border-[#cbe3d5] hover:border-[#7bb395] transition active:scale-[0.98] flex-1 sm:flex-none"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="text-sm bg-[#1f6b4b] hover:bg-[#195a40] text-white px-5 min-h-[44px] rounded-2xl transition disabled:opacity-60 active:scale-[0.98] flex-1 sm:flex-none"
          >
            {saving ? 'Kaydediliyor…' : initial ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>
    </form>
  );
}
