const NAV_ITEMS = [
  { id: 'home', icon: '🏠', label: 'Ana Sayfa' },
  { id: 'calendar', icon: '🗓', label: 'Takvim' },
  { id: 'add', icon: '+', label: null },
  { id: 'memories', icon: '📖', label: 'Anılar' },
  { id: 'profile', icon: '👤', label: 'Profil' },
];

export default function BookLayout({ children, mobileNav = null }) {
  const showBottomNav = Boolean(mobileNav);
  const activeTab = mobileNav?.activeTab ?? null;

  return (
    <div
      className={`min-h-[100dvh] px-2 pt-3 sm:px-5 flex items-start justify-center bg-lb-page ${
        showBottomNav
          ? 'pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-8'
          : 'pb-[max(5.5rem,env(safe-area-inset-bottom))] md:pb-8'
      }`}
      style={{
        paddingTop: 'max(12px, env(safe-area-inset-top))',
      }}
    >
      <div className="w-full max-w-6xl relative">
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

        {showBottomNav && (
          <nav
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-lb-canvas/96 backdrop-blur-2xl border-t border-lb-border flex items-end justify-around px-2 pt-2 bottom-nav-safe touch-scroll-overlay"
            aria-label="Ana navigasyon"
          >
            {NAV_ITEMS.map((item) =>
              item.id === 'add' ? (
                <button
                  key="add"
                  type="button"
                  onClick={mobileNav.onAdd}
                  className="w-14 h-14 rounded-[18px] bg-lb-accent text-lb-page flex items-center justify-center text-3xl font-light mb-2 shadow-[0_8px_32px_rgba(227,176,92,0.45)] active:scale-[0.92] transition border-2 border-lb-accent/30 font-display"
                  aria-label="Bugüne anı ekle"
                >
                  +
                </button>
              ) : (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => mobileNav.onTab(item.id)}
                  className="flex flex-col items-center gap-1 px-3 py-1 min-h-[44px] min-w-[44px] transition active:scale-[0.98]"
                  aria-label={item.label || item.id}
                >
                  <span
                    className={`text-[22px] leading-none transition-transform ${
                      activeTab === item.id ? 'scale-110' : 'scale-100'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.label && (
                    <span
                      className={`text-[8px] uppercase tracking-[0.1em] transition-colors font-hero-sub ${
                        activeTab === item.id ? 'text-lb-accent' : 'text-lb-subtext'
                      }`}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              )
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
