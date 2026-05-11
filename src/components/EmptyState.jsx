export default function EmptyState({ message = 'Bugüne henüz bir anı eklenmemiş.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center bg-lb-canvas/80 border border-dashed border-lb-border rounded-2xl">
      <div className="text-3xl mb-2 opacity-60 grayscale">✦</div>
      <p className="text-lb-subtext text-sm italic max-w-[28ch] px-3">{message}</p>
    </div>
  );
}
