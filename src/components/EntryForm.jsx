import { useState } from 'react';
import { MOOD_OPTIONS } from '../config/appConfig';
import ImageUploader from './ImageUploader';
import { uploadImages } from '../services/storageService';

export default function EntryForm({ dateKey, userId, onSave, onCancel, initial }) {
  const [title, setTitle]   = useState(initial?.title ?? '');
  const [text, setText]     = useState(initial?.text ?? '');
  const [mood, setMood]     = useState(initial?.mood ?? '');
  const [images, setImages] = useState(initial?.imageUrls ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);

  async function handleFiles(files) {
    setUploading(true);
    try {
      const uploaded = await uploadImages(files, dateKey, userId);
      console.log('[STORAGE_UPLOAD_SUCCESS]', uploaded.length, 'files');
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error('[STORAGE_UPLOAD_ERROR]', err.message);
      alert('Fotoğraf yüklenemedi: ' + err.message);
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
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Başlık (isteğe bağlı)"
        className="w-full border border-[#e0cdb8] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#c9a98a] text-[#3d2b1f]"
      />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Bugün ne yaşadın? Ne hissettin?"
        rows={4}
        className="w-full border border-[#e0cdb8] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#c9a98a] text-[#3d2b1f] resize-none"
      />

      <div className="flex flex-wrap gap-1.5">
        {MOOD_OPTIONS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMood(mood === m.value ? '' : m.value)}
            className={`text-xs rounded-full px-2.5 py-1 border transition-colors ${
              mood === m.value
                ? 'bg-[#a0704a] text-white border-[#a0704a]'
                : 'bg-white text-[#8a6a5a] border-[#e0cdb8] hover:border-[#c9a98a]'
            }`}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-1">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square">
              <img
                src={typeof img === 'object' ? img.url : img}
                alt=""
                className="w-full h-full object-cover rounded"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 text-white rounded-full text-xs flex items-center justify-center leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <ImageUploader onFilesSelected={handleFiles} uploading={uploading} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-[#b09080] hover:text-[#5c3d2a] px-3 py-1.5 rounded-lg border border-[#e0cdb8] hover:border-[#c9a98a] transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="text-xs bg-[#a0704a] hover:bg-[#8a5e3c] text-white px-4 py-1.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? 'Kaydediliyor…' : initial ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>
    </form>
  );
}
