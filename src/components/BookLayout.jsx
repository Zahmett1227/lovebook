export default function BookLayout({ children }) {
  return (
    <div
      className="min-h-[100dvh] px-2 pt-3 pb-24 sm:pb-6 sm:px-6 flex items-start justify-center"
      style={{
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        paddingBottom: 'max(88px, env(safe-area-inset-bottom))',
      }}
    >
      <div className="w-full max-w-6xl relative">

        {/* Stacked-pages shadow — depth illusion */}
        <div
          className="absolute rounded-2xl"
          style={{
            inset: 0,
            transform: 'translate(6px, 8px)',
            background: '#d4aba3',
            opacity: 0.34,
            borderRadius: '1.5rem',
          }}
        />
        <div
          className="absolute rounded-2xl"
          style={{
            inset: 0,
            transform: 'translate(3px, 4px)',
            background: '#e5c4bc',
            opacity: 0.54,
            borderRadius: '1.5rem',
          }}
        />

        {/* Main book body */}
        <div
          className="relative bg-[#fff9f6] rounded-2xl overflow-hidden"
          style={{
            minHeight: 'calc(100dvh - 24px)',
            boxShadow:
              '-10px 0 30px rgba(91,47,47,0.08), ' +
              '10px 0  30px rgba(91,47,47,0.08), ' +
              '0  28px 70px rgba(91,47,47,0.16), ' +
              'inset 0 0 0 1px rgba(255,255,255,0.7)',
          }}
        >
          {/* Left-edge page lines (decorative) */}
          <div
            className="absolute inset-y-0 left-0 w-3 pointer-events-none"
            style={{
              background:
                'linear-gradient(to right, rgba(131,78,78,0.08), transparent)',
            }}
          />
          {/* Right-edge page lines */}
          <div
            className="absolute inset-y-0 right-0 w-3 pointer-events-none"
            style={{
              background:
                'linear-gradient(to left, rgba(131,78,78,0.08), transparent)',
            }}
          />

          {children}
        </div>
      </div>
    </div>
  );
}
