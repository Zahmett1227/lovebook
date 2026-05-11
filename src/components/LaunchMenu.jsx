import { useState } from 'react';

export default function LaunchMenu({
  onAddToday,
  onAddDifferentDate,
  onReviewByDate,
  onReviewByMood,
}) {
  const [showReviewOptions, setShowReviewOptions] = useState(false);

  return (
    <div className="px-4 sm:px-6 py-6 md:py-10">
      <div className="max-w-2xl mx-auto relative">
        <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-lb-accent/20 via-transparent to-lb-accent2/15 blur-xl pointer-events-none" />
        <div className="relative rounded-[1.85rem] border border-lb-border bg-gradient-to-b from-lb-elevated via-lb-surface to-lb-canvas p-6 sm:p-10 shadow-editorial overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/5 h-px bg-gradient-to-r from-transparent via-lb-accent/50 to-transparent" />
          <p className="font-hero-sub text-[11px] uppercase tracking-[0.32em] text-lb-accent text-center">
            Hoş geldin
          </p>
          <h2 className="font-hero-title text-3xl sm:text-5xl text-lb-text text-center mt-4 leading-tight">
            Bugün hangi sahneyi
            <span className="block text-lb-accent/95 italic font-medium mt-1">birlikte yazalım?</span>
          </h2>
          <p className="font-hero-sub text-sm text-lb-subtext text-center mt-4 max-w-md mx-auto">
            Aşağıdan birini seç — LoveBook seni doğru ekrana götürsün.
          </p>

          <div className="mt-10 space-y-3">
            <MenuButton onClick={onAddToday} emphasis>
              Bugüne anı ekle
            </MenuButton>

            <MenuButton onClick={onAddDifferentDate}>
              Farklı bir güne anı ekle
            </MenuButton>

            <MenuButton onClick={() => setShowReviewOptions((prev) => !prev)} aria-expanded={showReviewOptions}>
              Anıları incele
              <span className="ml-2 text-lb-subtext text-xs font-normal">
                {showReviewOptions ? '▲' : '▼'}
              </span>
            </MenuButton>

            <div
              className={`overflow-hidden transition-all duration-300 ease-out ${
                showReviewOptions ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="rounded-2xl border border-lb-border bg-lb-canvas/90 p-3 space-y-2 shadow-inner">
                <p className="text-[10px] uppercase tracking-widest text-lb-subtext px-1">İnceleme modu</p>
                <SubMenuButton onClick={onReviewByDate}>Tarihe göre</SubMenuButton>
                <SubMenuButton onClick={onReviewByMood}>Mooda göre</SubMenuButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuButton({ onClick, children, emphasis = false, 'aria-expanded': ariaExpanded }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={ariaExpanded}
      className={`w-full rounded-2xl font-hero-sub text-sm sm:text-base tracking-wide px-5 py-4 min-h-[54px] transition active:scale-[0.98] text-left flex items-center justify-between ${
        emphasis
          ? 'border border-lb-accent/60 bg-lb-accent text-lb-page font-semibold shadow-glow hover:bg-lb-accent/90'
          : 'border border-lb-border bg-lb-elevated/90 text-lb-text hover:border-lb-accent/40 hover:bg-lb-muted/50'
      }`}
    >
      <span>{children}</span>
      {!emphasis && <span className="text-lb-accent text-lg opacity-80">→</span>}
    </button>
  );
}

function SubMenuButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-lb-border bg-lb-elevated text-lb-text text-sm px-4 py-3 min-h-[48px] transition text-left hover:border-lb-accent/35 hover:bg-lb-muted/40 active:scale-[0.99]"
    >
      {children}
    </button>
  );
}
