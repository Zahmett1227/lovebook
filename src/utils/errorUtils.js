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

/** Kullanıcıya gösterilecek kısa Türkçe Firestore / ağ mesajı (teknik ayrıntı içermez). */
export function firestoreUserMessage(err) {
  const raw = getErrorMessage(err, '').toLowerCase();
  if (/offline|failed to fetch|network|unavailable|timeout|timed out/i.test(raw)) {
    return 'İnternet bağlantısı kesildi veya sunucuya ulaşılamıyor. Bağlantını kontrol edip tekrar dene.';
  }
  if (/permission|insufficient|missing or insufficient/i.test(raw)) {
    return 'Bu verilere erişim izni yok. Oturumunun açık olduğundan emin ol veya yeniden giriş yap.';
  }
  if (/index|indexes required|failed-precondition/i.test(raw)) {
    return 'Veri sorgusu şu an yapılandırılamıyor. Lütfen yöneticiye bildir.';
  }
  return 'Veriler yüklenemedi. Sayfayı yenileyebilir veya biraz sonra tekrar deneyebilirsin.';
}

