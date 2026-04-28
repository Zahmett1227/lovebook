import MonthCalendar from './MonthCalendar';

const LEFT_MONTHS  = [1, 2, 3, 4, 5, 6];
const RIGHT_MONTHS = [7, 8, 9, 10, 11, 12];

export default function YearPage({ year, datesWithContent, selectedDate, onSelectDate }) {
  const calendarProps = { year, datesWithContent, selectedDate, onSelectDate };

  return (
    <>
      <div className="px-4 sm:px-6 pt-4 pb-2">
        <div className="rounded-3xl border border-white/70 bg-gradient-to-br from-[#f4fcf7] via-[#e0f5eb] to-[#d9edf7] px-4 py-4 shadow-sm relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#f4c6c6]/35 blur-xl" />
          <div className="absolute -bottom-10 -left-8 w-28 h-28 rounded-full bg-[#b9d7ff]/30 blur-xl" />
          <p className="font-hero-sub text-xs uppercase tracking-[0.2em] text-[#4f8f74] relative text-center">Bizim Günlüğümüz</p>
          <h2 className="font-hero-title text-3xl sm:text-[2.1rem] font-extrabold text-[#0f4f37] leading-tight mt-1 text-center">{year}</h2>
          <p className="font-hero-sub text-sm sm:text-[15px] text-[#2d7c59] mt-1 relative text-center">Bugün yeni bir anı ekleyelim mi?</p>
        </div>
      </div>

      {/* ── Mobile / tablet: single column ── */}
      <div className="lg:hidden px-4 pb-6 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[...LEFT_MONTHS, ...RIGHT_MONTHS].map((month) => (
          <MonthCalendar key={month} month={month} {...calendarProps} />
        ))}
      </div>

      {/* ── Desktop: open-book two-page layout ── */}
      <div className="hidden lg:flex pb-6 pt-4">

        {/* Left page — Jan–Jun */}
        <div
          className="flex-1 grid grid-cols-3 gap-3 px-6 pb-4 relative"
          style={{
            background:
              'linear-gradient(to bottom, #f8fdf9 0%, #f0f9f3 100%)',
          }}
        >
          {/* Subtle horizontal line rules (page texture) */}
          <PageLines />
          {LEFT_MONTHS.map((month) => (
            <MonthCalendar key={month} month={month} {...calendarProps} />
          ))}

          {/* Page number */}
          <div className="absolute bottom-2 left-6 text-[10px] text-[#6ea487] font-display italic select-none">
            {year}
          </div>
        </div>

        {/* Spine */}
        <div className="relative w-10 flex-shrink-0">
          {/* Centre crease */}
          <div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px"
            style={{ background: '#6ea487', opacity: 0.5 }}
          />
          {/* Gradient shadow left of spine */}
          <div
            className="absolute inset-y-0 right-1/2"
            style={{
              width: 20,
              background:
                'linear-gradient(to left, rgba(0,0,0,0.06), transparent)',
            }}
          />
          {/* Gradient shadow right of spine */}
          <div
            className="absolute inset-y-0 left-1/2"
            style={{
              width: 20,
              background:
                'linear-gradient(to right, rgba(0,0,0,0.06), transparent)',
            }}
          />
        </div>

        {/* Right page — Jul–Dec */}
        <div
          className="flex-1 grid grid-cols-3 gap-3 px-6 pb-4 relative"
          style={{
            background:
              'linear-gradient(to bottom, #f8fdf9 0%, #f0f9f3 100%)',
          }}
        >
          <PageLines />
          {RIGHT_MONTHS.map((month) => (
            <MonthCalendar key={month} month={month} {...calendarProps} />
          ))}

          {/* Page number */}
          <div className="absolute bottom-2 right-6 text-[10px] text-[#6ea487] font-display italic select-none">
            {year}
          </div>
        </div>
      </div>
    </>
  );
}

/* Subtle ruled-paper lines behind each page */
function PageLines() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, transparent, transparent 31px, rgba(58,111,84,0.10) 32px)',
        backgroundSize: '100% 32px',
      }}
    />
  );
}
