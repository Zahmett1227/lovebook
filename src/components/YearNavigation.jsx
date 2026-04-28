import { START_YEAR } from '../config/appConfig';
import { logout } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { USER_PROFILES } from '../config/appConfig';

export default function YearNavigation({ year, onPrev, onNext, disabled }) {
  const { user } = useAuth();
  const profile = user ? USER_PROFILES[user.email] : null;

  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8d5c0] bg-[#f9f3ea]">
      {/* User avatar + name */}
      <div className="flex items-center gap-2 min-w-[80px]">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-sm ${
            profile?.side === 'left' ? 'bg-amber-600' : 'bg-rose-400'
          }`}
        >
          {profile?.displayName?.[0] ?? '?'}
        </div>
        <span className="text-sm text-[#6b5040] hidden sm:block font-medium">
          {profile?.displayName}
        </span>
      </div>

      {/* Year navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          disabled={disabled || year <= START_YEAR}
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg text-[#8a6a5a] hover:bg-[#e8d5c0] disabled:opacity-25 disabled:cursor-not-allowed transition-all select-none"
          aria-label="Önceki yıl"
        >
          ‹
        </button>

        <div className="relative flex flex-col items-center">
          <span className="font-display text-2xl font-semibold text-[#3d2b1f] min-w-[4ch] text-center leading-none">
            {year}
          </span>
          <span className="text-[9px] text-[#c9a98a] uppercase tracking-widest mt-0.5 select-none">
            {disabled ? 'sayfa çevriliyor…' : 'yıl'}
          </span>
        </div>

        <button
          onClick={onNext}
          disabled={disabled}
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg text-[#8a6a5a] hover:bg-[#e8d5c0] disabled:opacity-25 disabled:cursor-not-allowed transition-all select-none"
          aria-label="Sonraki yıl"
        >
          ›
        </button>
      </div>

      {/* Logout */}
      <div className="flex items-center min-w-[80px] justify-end">
        <button
          onClick={logout}
          className="text-xs text-[#b09080] hover:text-[#8a5e3c] transition-colors px-2 py-1 rounded hover:bg-[#f0e4d6]"
        >
          Çıkış
        </button>
      </div>
    </div>
  );
}
