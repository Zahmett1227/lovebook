export default function EmptyState({ message = 'Bugüne henüz bir anı eklenmemiş.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center bg-white/70 border border-dashed border-[#cbe3d5] rounded-2xl">
      <div className="text-4xl mb-3 opacity-50">💌</div>
      <p className="text-[#5a8f75] text-sm italic max-w-[24ch]">{message}</p>
    </div>
  );
}
