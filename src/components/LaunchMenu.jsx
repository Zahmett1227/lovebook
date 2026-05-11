import { useState, useMemo } from 'react';
import { INITIAL_YEAR, RELATIONSHIP_START_DATE } from '../config/appConfig';
import { MEMORY_TAGS } from '../config/memoryTags';
import { daysTogetherCount } from '../utils/dateUtils';

export default function LaunchMenu({
  onAddToday,
  onAddDifferentDate,
  onReviewByDate,
  onReviewByMood,
  onRandomMemory,
  randomLoading = false,
}) {
  const [showReviewOptions, setShowReviewOptions] = useState(false);

  const dayCount = useMemo(
    () => daysTogetherCount(RELATIONSHIP_START_DATE),
    []
  );
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

      <div className="rounded-2xl border border-lb-accent/20 bg-lb-accent/[0.08] p-4 flex items-center gap-4 mb-4">
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
        <button
          type="button"
          onClick={onAddToday}
          className="w-full lb-btn-primary min-h-[56px] text-lg italic font-display active:scale-[0.98]"
        >
          Bugüne anı ekle
        </button>

        <button
          type="button"
          onClick={onAddDifferentDate}
          className="w-full lb-btn-ghost font-hero-sub text-sm sm:text-base active:scale-[0.98]"
        >
          Farklı bir güne anı ekle
        </button>

        <button
          type="button"
          onClick={() => setShowReviewOptions((prev) => !prev)}
          aria-expanded={showReviewOptions}
          className="w-full lb-btn-ghost font-hero-sub text-sm sm:text-base flex items-center justify-between active:scale-[0.98]"
        >
          <span>Anıları incele</span>
          <span className="text-lb-subtext text-xs font-normal">{showReviewOptions ? '▲' : '▼'}</span>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            showReviewOptions ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="rounded-2xl border border-lb-border bg-lb-canvas/90 p-3 space-y-2 shadow-inner">
            <p className="text-[10px] uppercase tracking-widest text-lb-subtext px-1 font-hero-sub">
              İnceleme modu
            </p>
            <SubMenuButton onClick={onReviewByDate}>Tarihe göre</SubMenuButton>
            <SubMenuButton onClick={onReviewByMood}>Mooda göre</SubMenuButton>
          </div>
        </div>
      </div>
    </div>
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

function SubMenuButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-lb-border bg-lb-elevated text-lb-text text-sm px-4 py-3 min-h-[48px] transition text-left hover:border-lb-accent/35 hover:bg-lb-muted/40 active:scale-[0.99] font-hero-sub"
    >
      {children}
    </button>
  );
}
