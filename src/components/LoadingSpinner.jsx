export default function LoadingSpinner({
  message = 'Yükleniyor…',
  slowHint = false,
  slowHintText = 'Bağlantı yavaş olabilir; birkaç saniye daha bekle veya ağı kontrol et.',
}) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-3 px-4">
      <div
        className="w-8 h-8 border-4 border-[#c49a92] border-t-transparent rounded-full animate-spin"
        aria-hidden
      />
      <p className="text-[#6f4548] text-sm text-center font-hero-sub">{message}</p>
      {slowHint && (
        <p className="text-[#9a726c] text-xs text-center max-w-xs font-hero-sub">{slowHintText}</p>
      )}
    </div>
  );
}
