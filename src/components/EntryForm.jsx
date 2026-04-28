import { useState } from 'react';
import { MEMORY_TAGS, normalizeMemoryTagId } from '../config/memoryTags';
import ImageUploader from './ImageUploader';
import { uploadImages } from '../services/storageService';

export default function EntryForm({ dateKey, userId, onSave, onCancel, initial }) {
  const [title, setTitle]   = useState(initial?.title ?? '');
  const [text, setText]     = useState(initial?.text ?? '');
  const [selectedTag, setSelectedTag] = useState(
    normalizeMemoryTagId(initial?.tag || initial?.mood || '')
  );
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
      await onSave({
        title: title.trim(),
        text: text.trim(),
        tag: selectedTag || '',
        // Backward compatibility for existing reads expecting mood.
        mood: selectedTag || '',
        imageUrls: images,
      });
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
        {MEMORY_TAGS.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => setSelectedTag(selectedTag === tag.id ? '' : tag.id)}
            className={`text-sm min-h-[44px] rounded-full px-3 border active:scale-[0.98] transition ${
              selectedTag === tag.id
                ? `${tag.color} shadow-sm`
                : 'bg-white text-[#2e664c] border-[#cbe3d5] hover:border-[#7bb395]'
            }`}
          >
            {tag.emoji} {tag.label}
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
