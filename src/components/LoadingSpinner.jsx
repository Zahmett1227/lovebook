export default function LoadingSpinner({ message = 'Yükleniyor…' }) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-4 border-[#5a9378] border-t-transparent rounded-full animate-spin" />
      <p className="text-[#3d7259] text-sm">{message}</p>
    </div>
  );
}
