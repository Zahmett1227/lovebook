import { useMemo, useState } from 'react';
import {
  ALLOWED_USERS,
  INITIAL_YEAR,
  RELATIONSHIP_START_DATE,
  USER_PROFILES,
  generateCoupleId,
} from '../config/appConfig';
import { MEMORY_TAGS } from '../config/memoryTags';
import { daysTogetherCount } from '../utils/dateUtils';
import { useCoupleProfile } from '../hooks/useCoupleProfile';

export default function LaunchMenu({
  onAddToday,
  onAddDifferentDate,
  onReviewByDate,
  onReviewByMood,
  onRandomMemory,
  randomLoading = false,
  entries = [],
}) {
  const [showReviewOptions, setShowReviewOptions] = useState(false);

  const coupleId = useMemo(() => generateCoupleId(ALLOWED_USERS[0], ALLOWED_USERS[1]), []);
  const { profile } = useCoupleProfile(coupleId);

  const leftEmail = useMemo(() => ALLOWED_USERS.find((e) => USER_PROFILES[e]?.side === 'left'), []);
  const rightEmail = useMemo(() => ALLOWED_USERS.find((e) => USER_PROFILES[e]?.side === 'right'), []);
  const leftProfile = USER_PROFILES[leftEmail];
  const rightProfile = USER_PROFILES[rightEmail];

  const safeEntries = Array.isArray(entries) ? entries : [];
  const leftCount = safeEntries.filter((e) => e.userEmail === leftEmail).length;
  const rightCount = safeEntries.filter((e) => e.userEmail === rightEmail).length;
  const total = safeEntries.length || 1;
  const leftPct = Math.round((leftCount / total) * 100);
  const rightPct = Math.round((rightCount / total) * 100);

  const dayCount = useMemo(() => daysTogetherCount(RELATIONSHIP_START_DATE), []);
  const streakFillPercent = Math.min(100, (dayCount / 365) * 100);

  return (
    <div className="px-4 sm:px-6 py-6 stagger">
      <div className="relative rounded-[1.85rem] border border-lb-border bg-gradient-to-b from-lb-elevated via-lb-surface to-lb-canvas p-6 sm:p-10 overflow-hidden grain-overlay mb-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/5 h-px bg-gradient-to-r from-transparent via-lb-accent/50 to-transparent" />

        <div className="absolute -top-16 -right-10 w-40 h-40 rounded-full bg-lb-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-12 w-44 h-44 rounded-full bg-lb-accent2/10 blur-3xl pointer-events-none" />

        <p className="font-hero-sub text-[10px] uppercase tracking-[0.32em] text-lb-accent text-center relative">
          Hoş geldin
        </p>
        <h2 className="font-hero-title text-[2.4rem] sm:text-5xl text-lb-text text-center mt-4 leading-tight relative">
          Bugün hangi sahneyi
          <span className="block text-lb-accent italic font-medium mt-1">birlikte yazalım?</span>
        </h2>
        <p className="font-hero-sub text-sm text-lb-subtext text-center mt-4 max-w-md mx-auto relative">
          Aşağıdan birini seç — Lovebook seni doğru ekrana götürsün.
        </p>

        <div className="relative flex flex-wrap justify-center gap-2 mt-6">
          <StatChip value={String(dayCount)} label="gün" />
          <StatChip value={String(INITIAL_YEAR)} label="yıl günlüğü" />
          <StatChip value={String(MEMORY_TAGS.length)} label="mood" />
        </div>

        {typeof onRandomMemory === 'function' && (
          <div className="relative flex justify-center mt-4">
            <button
              type="button"
              onClick={() => void onRandomMemory()}
              disabled={randomLoading}
              className="text-xs font-hero-sub text-lb-accent border border-lb-accent/35 bg-lb-accent/10 rounded-full px-4 min-h-[44px] hover:bg-lb-accent/20 transition active:scale-[0.98] disabled:opacity-50"
            >
              {randomLoading ? 'Açılıyor…' : 'Rastgele anı'}
            </button>
          </div>
        )}

        <div className="relative flex justify-center gap-3 mt-6">
          {['🎬', '📷', '💌'].map((emoji) => (
            <div
              key={emoji}
              className="w-14 h-16 sm:w-16 sm:h-[4.25rem] flex items-center justify-center border border-lb-border bg-lb-elevated/40 rounded-xl text-xl sm:text-2xl animate-pulse"
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[1.25rem] border border-lb-border bg-gradient-to-br from-lb-elevated to-lb-surface p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] mb-4 max-w-2xl mx-auto">
        <p className="font-hero-sub text-[10px] uppercase tracking-[0.2em] text-lb-subtext mb-4">
          Bu yılki katkılar
        </p>

        {[
          {
            prof: leftProfile,
            photoUrl: profile?.leftUserPhotoUrl,
            count: leftCount,
            pct: leftPct,
            side: 'left',
          },
          {
            prof: rightProfile,
            photoUrl: profile?.rightUserPhotoUrl,
            count: rightCount,
            pct: rightPct,
            side: 'right',
          },
        ].map(({ prof, photoUrl, count, pct, side }) => (
          <div key={side} className="mb-3 last:mb-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ring-1 ${
                    side === 'left' ? 'ring-lb-accent/40' : 'ring-lb-accent2/40'
                  }`}
                >
                  {photoUrl ? (
                    <img src={photoUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center text-[10px] font-bold ${
                        side === 'left' ? 'bg-lb-accent text-lb-page' : 'bg-lb-accent2 text-white'
                      }`}
                    >
                      {prof?.displayName?.[0]}
                    </div>
                  )}
                </div>
                <span className="font-hero-sub text-xs text-lb-text">{prof?.displayName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-sm text-lb-accent">{count}</span>
                <span className="font-hero-sub text-[10px] text-lb-subtext">anı</span>
                <span className="font-hero-sub text-[10px] text-lb-subtext/50 ml-1">%{pct}</span>
              </div>
            </div>

            <div className="h-1.5 rounded-full bg-lb-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  side === 'left'
                    ? 'bg-gradient-to-r from-lb-accent to-amber-300'
                    : 'bg-gradient-to-r from-lb-accent2 to-pink-400'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ))}

        <div className="mt-4 pt-3 border-t border-lb-border/60 flex items-center justify-between">
          <span className="font-hero-sub text-[10px] text-lb-subtext">Toplam bu yıl</span>
          <span className="font-display text-base text-lb-text">{safeEntries.length} anı</span>
        </div>
      </div>

      <div className="rounded-2xl border border-lb-accent/20 bg-lb-accent/[0.08] p-4 flex items-center gap-4 mb-4 max-w-2xl mx-auto">
        <span className="text-3xl shrink-0" aria-hidden>
          🔥
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-hero-title text-2xl text-lb-accent leading-none">{dayCount}</div>
          <div className="font-hero-sub text-xs text-lb-subtext mt-1 uppercase tracking-wide">
            gün birlikte
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-lb-muted overflow-hidden">
            <div
              className="h-full bg-lb-accent transition-all duration-500"
              style={{ width: `${streakFillPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 max-w-2xl mx-auto">
        <MenuButton onClick={onAddToday} emphasis icon="✦" sublabel="Bugünün anısını ekle">
          Bugüne anı ekle
        </MenuButton>

        <MenuButton onClick={onAddDifferentDate} icon="🗓" sublabel="Geçmiş bir güne git">
          Farklı bir güne anı ekle
        </MenuButton>

        <MenuButton
          onClick={() => setShowReviewOptions((p) => !p)}
          icon="📖"
          sublabel="Tüm anılarını incele"
          aria-expanded={showReviewOptions}
        >
          Anıları incele
          <span className="ml-2 text-lb-subtext text-xs font-normal">
            {showReviewOptions ? '▲' : '▼'}
          </span>
        </MenuButton>

        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            showReviewOptions ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="rounded-2xl border border-lb-border bg-lb-canvas/60 p-2.5 space-y-2">
            <SubMenuButton onClick={onReviewByDate} icon="📅">
              Tarihe göre
            </SubMenuButton>
            <SubMenuButton onClick={onReviewByMood} icon="🎯">
              Mooda göre
            </SubMenuButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuButton({
  onClick,
  children,
  emphasis = false,
  icon,
  sublabel,
  'aria-expanded': ariaExpanded,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={ariaExpanded}
      className={`
        w-full rounded-[1.25rem] px-5 py-4 min-h-[64px]
        flex items-center gap-4
        border transition active:scale-[0.98] text-left
        relative overflow-hidden
        ${
          emphasis
            ? `bg-gradient-to-r from-lb-accent to-amber-400
               border-lb-accent/50 text-lb-page
               shadow-[0_8px_32px_rgba(227,176,92,0.35)]`
            : `bg-gradient-to-br from-lb-elevated to-lb-surface
               border-lb-border text-lb-text
               hover:border-lb-accent/35
               shadow-[0_4px_16px_rgba(0,0,0,0.25)]`
        }
      `}
    >
      {icon && (
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
            emphasis ? 'bg-lb-page/20' : 'bg-lb-muted/60 border border-lb-border'
          }`}
        >
          {icon}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div
          className={`font-display text-[15px] font-semibold leading-tight ${
            emphasis ? 'text-lb-page' : 'text-lb-text'
          }`}
        >
          {children}
        </div>
        {sublabel && (
          <p
            className={`font-hero-sub text-[11px] mt-0.5 ${
              emphasis ? 'text-lb-page/60' : 'text-lb-subtext'
            }`}
          >
            {sublabel}
          </p>
        )}
      </div>

      <span className={`text-lg flex-shrink-0 ${emphasis ? 'text-lb-page/70' : 'text-lb-accent'}`}>→</span>

      {emphasis && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
      )}
    </button>
  );
}

function SubMenuButton({ onClick, children, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[1rem] border border-lb-border bg-lb-canvas/80 text-lb-text px-4 py-3.5 min-h-[52px] flex items-center gap-3 hover:border-lb-accent/35 hover:bg-lb-elevated/60 active:scale-[0.98] transition text-left shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
    >
      {icon && <span className="text-base w-7 text-center flex-shrink-0">{icon}</span>}
      <span className="font-hero-sub text-sm">{children}</span>
      <span className="ml-auto text-lb-accent text-sm">›</span>
    </button>
  );
}

function StatChip({ value, label }) {
  return (
    <div className="bg-lb-muted/60 border border-lb-border rounded-2xl px-4 py-2 text-center min-w-[5.5rem]">
      <div className="font-hero-title text-xl text-lb-accent leading-none">{value}</div>
      <div className="font-hero-sub text-[10px] text-lb-subtext uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}
