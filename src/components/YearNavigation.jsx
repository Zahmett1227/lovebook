import { MIN_YEAR } from '../config/appConfig';
import { logout } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { USER_PROFILES } from '../config/appConfig';

export default function YearNavigation({ year, onPrev, onNext, disabled }) {
  const { user } = useAuth();
  const profile = user ? USER_PROFILES[user.email] : null;

  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-lb-border bg-lb-canvas/95 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-2 min-w-[72px]">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-md ring-2 ring-lb-accent/40 ${
            profile?.side === 'left'
              ? 'bg-lb-accent text-lb-page'
              : profile?.side === 'right'
                ? 'bg-lb-accent2 text-white'
                : 'bg-lb-muted text-lb-text'
          }`}
        >
          {profile?.displayName?.[0] ?? '?'}
        </div>
        <span className="text-sm text-lb-subtext hidden sm:block font-medium max-w-[100px] truncate">
          {profile?.displayName}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={disabled || year <= MIN_YEAR}
          className="w-11 h-11 min-h-[44px] rounded-full flex items-center justify-center text-xl text-lb-accent hover:bg-lb-elevated border border-transparent hover:border-lb-border active:scale-[0.98] disabled:opacity-25 disabled:cursor-not-allowed transition-all select-none"
          aria-label="Önceki yıl"
        >
          ‹
        </button>

        <div className="relative flex flex-col items-center px-2">
          <span className="font-hero-title text-2xl sm:text-3xl text-lb-text min-w-[4.5ch] text-center leading-none tracking-tight">
            {year}
          </span>
          <span className="text-[9px] text-lb-subtext uppercase tracking-[0.2em] mt-1 select-none">
            {disabled ? 'geçiş…' : 'yıl'}
          </span>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={disabled}
          className="w-11 h-11 min-h-[44px] rounded-full flex items-center justify-center text-xl text-lb-accent hover:bg-lb-elevated border border-transparent hover:border-lb-border active:scale-[0.98] disabled:opacity-25 disabled:cursor-not-allowed transition-all select-none"
          aria-label="Sonraki yıl"
        >
          ›
        </button>
      </div>

      <div className="flex items-center min-w-[72px] justify-end">
        <button
          type="button"
          onClick={logout}
          className="text-xs text-lb-subtext hover:text-lb-accent rounded-full border border-transparent hover:border-lb-border px-3 min-h-[44px] transition-colors active:scale-[0.98]"
        >
          Çıkış
        </button>
      </div>
    </div>
  );
}
