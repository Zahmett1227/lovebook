export default function BookLayout({ children }) {
  return (
    <div
      className="min-h-[100dvh] px-2 pt-3 pb-[max(5.5rem,env(safe-area-inset-bottom))] md:pb-8 sm:px-5 flex items-start justify-center bg-lb-page"
      style={{
        paddingTop: 'max(12px, env(safe-area-inset-top))',
      }}
    >
      <div className="w-full max-w-6xl relative">
        {/* Dış derinlik — koyu sinema çerçevesi */}
        <div
          className="absolute rounded-[1.35rem] bg-black/50 blur-sm"
          style={{
            inset: 0,
            transform: 'translate(8px, 10px)',
          }}
        />
        <div
          className="absolute rounded-[1.35rem] border border-lb-accent/25 bg-gradient-to-br from-lb-muted/40 to-transparent"
          style={{
            inset: 0,
            transform: 'translate(4px, 5px)',
          }}
        />

        <div
          className="relative rounded-[1.25rem] overflow-hidden border border-lb-border bg-lb-surface"
          style={{
            minHeight: 'calc(100dvh - 28px)',
            boxShadow:
              '0 0 0 1px rgba(227,176,92,0.18), ' +
              '0 32px 80px rgba(0,0,0,0.55), ' +
              'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* Altın şerit — üst vurgu */}
          <div
            className="h-px w-full pointer-events-none"
            style={{ background: 'var(--lb-gold-line)' }}
          />

          <div
            className="absolute inset-y-0 left-0 w-2 pointer-events-none opacity-40"
            style={{
              background: 'linear-gradient(to right, rgba(227,176,92,0.25), transparent)',
            }}
          />
          <div
            className="absolute inset-y-0 right-0 w-2 pointer-events-none opacity-25"
            style={{
              background: 'linear-gradient(to left, rgba(199,107,138,0.2), transparent)',
            }}
          />

          {children}
        </div>
      </div>
    </div>
  );
}
