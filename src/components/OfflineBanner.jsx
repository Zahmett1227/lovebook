import { useEffect, useState } from 'react';

export default function OfflineBanner() {
  const [offline, setOffline] = useState(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const onUp = () => setOffline(false);
    const onDown = () => setOffline(true);
    window.addEventListener('online', onUp);
    window.addEventListener('offline', onDown);
    return () => {
      window.removeEventListener('online', onUp);
      window.removeEventListener('offline', onDown);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="mx-3 sm:mx-6 mt-3 rounded-xl border border-lb-accent/40 bg-lb-accent/10 px-3 py-2.5 text-center text-xs sm:text-sm text-lb-text"
    >
      Çevrimdışı görünüyorsun. Bağlantı gelince içerik yenilenecek; gerekirse sayfayı yenile.
    </div>
  );
}
