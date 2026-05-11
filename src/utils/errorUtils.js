export function getErrorMessage(err, fallback = 'Bilinmeyen hata') {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err.trim()) return err;
  try {
    const parsed = String(err);
    return parsed && parsed !== '[object Object]' ? parsed : fallback;
  } catch {
    return fallback;
  }
}
