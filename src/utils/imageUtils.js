export function resolveImageUrl(image) {
  if (!image) return null;
  if (typeof image === 'string') return image.trim() || null;
  if (typeof image === 'object') {
    const candidate = image.url || image.downloadURL || image.src || image.uri;
    return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : null;
  }
  return null;
}

export function normalizeImageUrls(images) {
  if (!Array.isArray(images)) return [];
  return images.map(resolveImageUrl).filter(Boolean);
}

export function resolveVideoUrl(video) {
  if (!video) return null;
  if (typeof video === 'string') return video.trim() || null;
  if (typeof video === 'object') {
    const candidate = video.url || video.downloadURL || video.src || video.uri;
    return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : null;
  }
  return null;
}

export function normalizeVideoItems(videos) {
  if (!Array.isArray(videos)) return [];
  return videos
    .map((video) => {
      const url = resolveVideoUrl(video);
      if (!url) return null;
      if (typeof video === 'object' && video !== null) {
        return {
          url,
          path: typeof video.path === 'string' ? video.path : '',
          contentType: typeof video.contentType === 'string' ? video.contentType : '',
          sizeBytes: Number.isFinite(video.sizeBytes) ? video.sizeBytes : 0,
          name: typeof video.name === 'string' ? video.name : '',
        };
      }
      return { url, path: '', contentType: '', sizeBytes: 0, name: '' };
    })
    .filter(Boolean);
}
