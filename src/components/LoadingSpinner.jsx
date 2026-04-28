export default function LoadingSpinner({ message = 'Yükleniyor…' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-4 border-[#c9a98a] border-t-transparent rounded-full animate-spin" />
      <p className="text-[#8a6a5a] text-sm">{message}</p>
    </div>
  );
}
