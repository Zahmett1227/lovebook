export default function EmptyState({ message = 'Henüz kayıt yok.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center bg-lb-canvas/60 border border-dashed border-lb-border rounded-2xl">
      <div className="text-4xl mb-3 opacity-40">✦</div>
      <p className="text-lb-subtext text-sm italic max-w-[26ch] px-4 leading-relaxed font-hero-sub">
        {message}
      </p>
    </div>
  );
}
