import { useEffect, useMemo, useState } from 'react';
import { MEMORY_TAGS, normalizeMemoryTagId } from '../config/memoryTags';
import ImageUploader from './ImageUploader';
import VideoUploader from './VideoUploader';
import { uploadImages, uploadVideos } from '../services/storageService';
import { normalizeImageUrls, normalizeVideoItems } from '../utils/imageUtils';
import { bytesToMb, estimateSessionCost } from '../utils/costUtils';

export default function EntryForm({ dateKey, userId, onSave, onCancel, initial }) {
  const [title, setTitle]   = useState(initial?.title ?? '');
  const [text, setText]     = useState(initial?.text ?? '');
  const [selectedTag, setSelectedTag] = useState(
    normalizeMemoryTagId(initial?.tag || initial?.mood || '')
  );
  const [images, setImages] = useState(normalizeImageUrls(initial?.imageUrls));
  const [videos, setVideos] = useState(normalizeVideoItems(initial?.videoUrls));
  const [sessionFiles, setSessionFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [uploadError, setUploadError] = useState('');

  const sessionCost = useMemo(() => estimateSessionCost(sessionFiles), [sessionFiles]);
  const sessionSizeMb = useMemo(() => bytesToMb(sessionCost.totalBytes), [sessionCost.totalBytes]);
  const usagePercent = Math.min((sessionSizeMb / 100) * 100, 100);

  useEffect(() => {
    const payload = {
      totalBytes: sessionCost.totalBytes,
      storageUsd: sessionCost.storageUsd,
      operationUsd: sessionCost.operationUsd,
      totalUsd: sessionCost.totalUsd,
      uploadOps: sessionCost.uploadOps,
    };
    try {
      localStorage.setItem('lovebook-session-cost', JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent('lovebook-session-cost-update', { detail: payload }));
    } catch {
      // best effort only
    }
  }, [sessionCost]);

  async function handleImageFiles(files) {
    setUploadError('');
    setUploading(true);
    try {
      const uploaded = await uploadImages(files, dateKey, userId);
      console.log('[STORAGE_UPLOAD_SUCCESS]', uploaded.length, 'files');
      setImages((prev) => [...(Array.isArray(prev) ? prev : []), ...uploaded]);
      setSessionFiles((prev) => [...prev, ...files]);
    } catch (err) {
      console.error('[STORAGE_UPLOAD_ERROR]', err.message);
      setUploadError(`Fotoğraf yüklenemedi: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleVideoFiles(files) {
    setUploadError('');
    setUploading(true);
    try {
      const uploaded = await uploadVideos(files, dateKey, userId);
      console.log('[STORAGE_UPLOAD_SUCCESS]', uploaded.length, 'videos');
      setVideos((prev) => [...(Array.isArray(prev) ? prev : []), ...uploaded]);
      setSessionFiles((prev) => [...prev, ...files]);
    } catch (err) {
      console.error('[STORAGE_UPLOAD_ERROR]', err.message);
      setUploadError(`Video yüklenemedi: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index) {
    setImages((prev) => (Array.isArray(prev) ? prev.filter((_, i) => i !== index) : []));
  }

  function removeVideo(index) {
    setVideos((prev) => (Array.isArray(prev) ? prev.filter((_, i) => i !== index) : []));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() && !text.trim() && images.length === 0 && videos.length === 0) return;
    setSaving(true);
    try {
      // onSave handles its own error state and logging
      await onSave({
        title: title.trim(),
        text: text.trim(),
        tag: selectedTag || '',
        // Backward compatibility for existing reads expecting mood.
        mood: selectedTag || '',
        favorite: initial?.favorite ?? false,
        imageUrls: images,
        videoUrls: videos,
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

      {videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {videos.map((video, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden border border-[#cbe3d5] bg-white">
              <video
                src={video.url}
                controls
                preload="metadata"
                className="w-full h-36 object-cover"
              />
              <button
                type="button"
                onClick={() => removeVideo(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/65 text-white rounded-full text-sm flex items-center justify-center leading-none active:scale-[0.98]"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {sessionFiles.length > 0 && (
        <div className="rounded-2xl border border-[#cbe3d5] bg-[#f4fbf7] p-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#2e664c]">
            <span>Blaze Tahmini (bu yükleme oturumu)</span>
            <span>{sessionSizeMb.toFixed(2)} MB</span>
          </div>
          <div className="h-2 rounded-full bg-[#dbeee2] overflow-hidden">
            <div
              className="h-full bg-[#2d7b58] transition-all"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="text-[11px] text-[#4b7f66]">
            Aylık depolama: ${sessionCost.storageUsd.toFixed(4)} • İşlem: ${sessionCost.operationUsd.toFixed(4)} • Toplam: ${sessionCost.totalUsd.toFixed(4)}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <ImageUploader
            onFilesSelected={handleImageFiles}
            uploading={uploading}
            onError={setUploadError}
          />
          <VideoUploader
            onFilesSelected={handleVideoFiles}
            uploading={uploading}
            onError={setUploadError}
          />
        </div>
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
