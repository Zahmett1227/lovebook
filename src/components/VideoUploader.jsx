import { useRef } from 'react';

const MAX_VIDEO_MB = 100;
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.m4v', '.webm'];

export default function VideoUploader({ onFilesSelected, uploading, onError }) {
  const inputRef = useRef(null);

  function handleChange(e) {
    const files = Array.from(e.target.files || []);
    const validFiles = [];

    for (const file of files) {
      const lowerName = file.name.toLowerCase();
      const hasVideoMime = file.type?.startsWith('video/');
      const hasVideoExt = VIDEO_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
      if (!hasVideoMime && !hasVideoExt) {
        onError?.('Lütfen yalnızca video dosyası seç.');
        continue;
      }

      if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
        onError?.(`Video boyutu en fazla ${MAX_VIDEO_MB} MB olabilir.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) onFilesSelected(validFiles);
    e.target.value = '';
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="flex items-center justify-center gap-2 text-sm text-lb-accent2 border border-lb-border bg-lb-elevated rounded-2xl px-4 min-h-[44px] hover:border-lb-accent2/50 hover:bg-lb-muted/50 transition disabled:opacity-50 active:scale-[0.98] font-medium"
      >
        <span className="text-lg leading-none opacity-90" aria-hidden>▶</span>
        <span>{uploading ? 'Yükleniyor…' : 'Video'}</span>
      </button>
    </div>
  );
}
