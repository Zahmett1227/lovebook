import { useState } from 'react';

export default function LaunchMenu({
  onAddToday,
  onAddDifferentDate,
  onReviewByDate,
  onReviewByMood,
}) {
  const [showReviewOptions, setShowReviewOptions] = useState(false);

  return (
    <div className="px-4 sm:px-6 py-6">
      <div className="max-w-2xl mx-auto rounded-[1.8rem] border border-[#ead4ce] bg-gradient-to-br from-[#fff9f8] via-[#fbeee8] to-[#f8e7df] p-5 sm:p-7 shadow-editorial">
        <p className="font-hero-sub text-[11px] uppercase tracking-[0.24em] text-[#a0726c] text-center">
          Hoş geldin
        </p>
        <h2 className="font-hero-title text-3xl sm:text-4xl text-[#5a3738] text-center mt-2">
          Ne yapmak istersin?
        </h2>
        <p className="font-hero-sub text-sm text-[#8f5f5f] text-center mt-2">
          Bir seçim yap, seni ilgili ekrana götürelim.
        </p>

        <div className="mt-6 space-y-3">
          <MenuButton onClick={onAddToday}>
            BUGÜNE BİR ANI EKLE
          </MenuButton>

          <MenuButton onClick={onAddDifferentDate}>
            FARKLI BİR GÜNE ANI EKLE
          </MenuButton>

          <MenuButton onClick={() => setShowReviewOptions((prev) => !prev)}>
            ANILARI İNCELE
          </MenuButton>

          {showReviewOptions && (
            <div className="rounded-2xl border border-[#e7d3cb] bg-[#fffaf8] p-3 space-y-2">
              <SubMenuButton onClick={onReviewByDate}>
                Tarihe göre
              </SubMenuButton>
              <SubMenuButton onClick={onReviewByMood}>
                Mooda göre
              </SubMenuButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-[#ddbcb3] bg-white/85 hover:bg-[#fff6f3] text-[#6f4548] font-hero-sub text-sm sm:text-[15px] tracking-wide px-4 py-4 min-h-[52px] transition active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

function SubMenuButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-[#ead8d1] bg-white hover:bg-[#f8ece7] text-[#7a4f4f] text-sm px-3 py-2.5 min-h-[44px] transition active:scale-[0.98]"
    >
      {children}
    </button>
  );
}
