export default function BookLayout({ children }) {
  return (
    <div className="min-h-screen py-6 px-3 sm:px-6 flex items-start justify-center">
      <div className="w-full max-w-6xl relative">

        {/* Stacked-pages shadow — depth illusion */}
        <div
          className="absolute rounded-2xl"
          style={{
            inset: 0,
            transform: 'translate(6px, 8px)',
            background: '#d4b896',
            opacity: 0.45,
            borderRadius: '1.5rem',
          }}
        />
        <div
          className="absolute rounded-2xl"
          style={{
            inset: 0,
            transform: 'translate(3px, 4px)',
            background: '#e2c9a8',
            opacity: 0.6,
            borderRadius: '1.5rem',
          }}
        />

        {/* Main book body */}
        <div
          className="relative bg-[#fdfaf5] rounded-2xl overflow-hidden"
          style={{
            minHeight: '90vh',
            boxShadow:
              '-10px 0 30px rgba(0,0,0,0.10), ' +
              '10px 0  30px rgba(0,0,0,0.10), ' +
              '0  28px 70px rgba(0,0,0,0.18), ' +
              'inset 0 0 0 1px rgba(255,255,255,0.7)',
          }}
        >
          {/* Left-edge page lines (decorative) */}
          <div
            className="absolute inset-y-0 left-0 w-3 pointer-events-none"
            style={{
              background:
                'linear-gradient(to right, rgba(0,0,0,0.04), transparent)',
            }}
          />
          {/* Right-edge page lines */}
          <div
            className="absolute inset-y-0 right-0 w-3 pointer-events-none"
            style={{
              background:
                'linear-gradient(to left, rgba(0,0,0,0.04), transparent)',
            }}
          />

          {children}
        </div>
      </div>
    </div>
  );
}
