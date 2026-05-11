export default function LoadingSpinner({
  message = 'Yükleniyor…',
  slowHint = false,
  slowHintText = 'Bağlantı yavaş olabilir; birkaç saniye daha bekle veya ağı kontrol et.',
}) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 px-4 bg-lb-page">
      <div
        className="w-10 h-10 border-[3px] border-lb-border border-t-lb-accent rounded-full animate-spin"
        aria-hidden
      />
      <p className="text-lb-text text-sm text-center font-hero-sub">{message}</p>
      {slowHint && (
        <p className="text-lb-subtext text-xs text-center max-w-xs font-hero-sub mt-1">{slowHintText}</p>
      )}
    </div>
  );
}
