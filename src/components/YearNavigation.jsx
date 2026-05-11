import { MIN_YEAR } from '../config/appConfig';
import { logout } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { USER_PROFILES } from '../config/appConfig';

export default function YearNavigation({ year, onPrev, onNext, disabled }) {
  const { user } = useAuth();
  const profile = user ? USER_PROFILES[user.email] : null;

  return (
    <div className="flex items-center justify-between px-3 sm:px-5 py-3 border-b border-lb-border bg-lb-canvas/95 backdrop-blur-md">
      <div className="flex items-center gap-2 min-w-[72px]">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-lb-page shadow-md ring-2 ring-lb-accent/30 ${
            profile?.side === 'left' ? 'bg-lb-accent' : 'bg-lb-accent2'
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
          <span className="font-display text-2xl sm:text-3xl font-semibold text-lb-text min-w-[4.5ch] text-center leading-none tracking-tight">
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
          className="text-xs text-lb-subtext hover:text-lb-accent transition-colors px-3 min-h-[44px] rounded-full hover:bg-lb-elevated border border-transparent hover:border-lb-border active:scale-[0.98]"
        >
          Çıkış
        </button>
      </div>
    </div>
  );
}
