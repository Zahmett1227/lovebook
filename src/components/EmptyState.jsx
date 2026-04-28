export default function EmptyState({ message = 'Bugüne henüz bir anı eklenmemiş.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="text-4xl mb-3 opacity-40">🌸</div>
      <p className="text-[#b09080] text-sm italic">{message}</p>
    </div>
  );
}
