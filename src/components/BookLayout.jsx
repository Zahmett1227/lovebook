import { useAuth } from '../hooks/useAuth';
import { logout } from '../services/authService';
import { USER_PROFILES } from '../config/appConfig';

function NavIconButton({ active, onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-end gap-1 min-w-0 flex-1 pb-1 min-h-[44px] active:scale-[0.98] transition ${
        active ? 'text-lb-accent' : 'text-lb-subtext'
      }`}
      aria-label={label}
    >
      {children}
      <span className="font-hero-sub text-[10px] leading-tight truncate max-w-full">{label}</span>
    </button>
  );
}

export default function BookLayout({ children, mobileNav = null }) {
  const { user } = useAuth();
  const profile = user ? USER_PROFILES[user.email] : null;
  const showBottomNav = Boolean(mobileNav);

  return (
    <div
      className={`min-h-[100dvh] px-2 pt-3 sm:px-5 flex items-start justify-center bg-lb-page ${
        showBottomNav ? 'pb-24 lg:pb-8' : 'pb-[max(5.5rem,env(safe-area-inset-bottom))] md:pb-8'
      }`}
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

        {showBottomNav && (
          <nav
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-lb-canvas/95 backdrop-blur-xl border-t border-lb-border flex items-end justify-around px-2 pt-2 bottom-nav-safe"
            aria-label="Ana navigasyon"
          >
            <NavIconButton
              label="Ana sayfa"
              active={mobileNav.viewMode === 'launch'}
              onClick={mobileNav.onHome}
            >
              <span className="text-xl leading-none" aria-hidden>
                ⌂
              </span>
            </NavIconButton>
            <NavIconButton
              label="Takvim"
              active={mobileNav.viewMode === 'calendar' || mobileNav.viewMode === 'review-date'}
              onClick={mobileNav.onCalendar}
            >
              <span className="text-xl leading-none" aria-hidden>
                ▦
              </span>
            </NavIconButton>
            <div className="flex flex-col items-center justify-end flex-1 -mt-4">
              <button
                type="button"
                onClick={mobileNav.onAdd}
                className="w-14 h-14 rounded-2xl bg-lb-accent text-lb-page shadow-[0_8px_32px_rgba(227,176,92,0.4)] mb-2 flex items-center justify-center text-2xl font-light leading-none active:scale-[0.98] transition font-display"
                aria-label="Bugüne anı ekle"
              >
                +
              </button>
            </div>
            <NavIconButton
              label="Anılar"
              active={mobileNav.viewMode === 'review-mood'}
              onClick={mobileNav.onMood}
            >
              <span className="text-xl leading-none" aria-hidden>
                ♥
              </span>
            </NavIconButton>
            <button
              type="button"
              onClick={() => void logout()}
              className="flex flex-col items-center justify-end gap-1 min-w-0 flex-1 pb-1 min-h-[44px] text-lb-subtext active:scale-[0.98] transition"
              aria-label="Çıkış yap"
            >
              <span
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-lb-accent/40 shrink-0 ${
                  profile?.side === 'left'
                    ? 'bg-lb-accent text-lb-page'
                    : profile?.side === 'right'
                      ? 'bg-lb-accent2 text-white'
                      : 'bg-lb-muted text-lb-text'
                }`}
              >
                {profile?.displayName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? '?'}
              </span>
              <span className="font-hero-sub text-[10px] leading-tight">Profil</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
