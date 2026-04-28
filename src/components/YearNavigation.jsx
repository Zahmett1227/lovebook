import { START_YEAR } from '../config/appConfig';
import { logout } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { USER_PROFILES } from '../config/appConfig';

export default function YearNavigation({ year, onPrev, onNext, disabled }) {
  const { user } = useAuth();
  const profile = user ? USER_PROFILES[user.email] : null;

  return (
    <div className="flex items-center justify-between px-3 sm:px-5 py-3 border-b border-[#cbe3d5] bg-[#eef9f2]/90 backdrop-blur">
      {/* User avatar + name */}
      <div className="flex items-center gap-2 min-w-[72px]">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-sm ${
            profile?.side === 'left' ? 'bg-amber-600' : 'bg-rose-400'
          }`}
        >
          {profile?.displayName?.[0] ?? '?'}
        </div>
        <span className="text-sm text-[#275740] hidden sm:block font-medium">
          {profile?.displayName}
        </span>
      </div>

      {/* Year navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          disabled={disabled || year <= START_YEAR}
          className="w-11 h-11 min-h-[44px] rounded-full flex items-center justify-center text-lg text-[#2f6b51] hover:bg-[#ddefe3] active:scale-[0.98] disabled:opacity-25 disabled:cursor-not-allowed transition-all select-none"
          aria-label="Önceki yıl"
        >
          ‹
        </button>

        <div className="relative flex flex-col items-center">
          <span className="font-display text-2xl font-semibold text-[#174330] min-w-[4ch] text-center leading-none">
            {year}
          </span>
          <span className="text-[9px] text-[#69a186] uppercase tracking-widest mt-0.5 select-none">
            {disabled ? 'sayfa çevriliyor…' : 'yıl'}
          </span>
        </div>

        <button
          onClick={onNext}
          disabled={disabled}
          className="w-11 h-11 min-h-[44px] rounded-full flex items-center justify-center text-lg text-[#2f6b51] hover:bg-[#ddefe3] active:scale-[0.98] disabled:opacity-25 disabled:cursor-not-allowed transition-all select-none"
          aria-label="Sonraki yıl"
        >
          ›
        </button>
      </div>

      {/* Logout */}
      <div className="flex items-center min-w-[72px] justify-end">
        <button
          onClick={logout}
          className="text-xs text-[#679980] hover:text-[#1f6b4b] transition-colors px-3 min-h-[44px] rounded-full hover:bg-[#ddefe3] active:scale-[0.98]"
        >
          Çıkış
        </button>
      </div>
    </div>
  );
}
