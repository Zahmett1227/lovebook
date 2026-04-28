import MonthCalendar from './MonthCalendar';

const LEFT_MONTHS  = [1, 2, 3, 4, 5, 6];
const RIGHT_MONTHS = [7, 8, 9, 10, 11, 12];

export default function YearPage({ year, datesWithContent, selectedDate, onSelectDate }) {
  const calendarProps = { year, datesWithContent, selectedDate, onSelectDate };

  return (
    <>
      {/* ── Mobile / tablet: single column ── */}
      <div className="lg:hidden px-4 pb-6 pt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
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
              'linear-gradient(to bottom, #fdfaf5 0%, #faf6ef 100%)',
          }}
        >
          {/* Subtle horizontal line rules (page texture) */}
          <PageLines />
          {LEFT_MONTHS.map((month) => (
            <MonthCalendar key={month} month={month} {...calendarProps} />
          ))}

          {/* Page number */}
          <div className="absolute bottom-2 left-6 text-[10px] text-[#c9a98a] font-display italic select-none">
            {year}
          </div>
        </div>

        {/* Spine */}
        <div className="relative w-10 flex-shrink-0">
          {/* Centre crease */}
          <div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px"
            style={{ background: '#c9a98a', opacity: 0.5 }}
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
              'linear-gradient(to bottom, #fdfaf5 0%, #faf6ef 100%)',
          }}
        >
          <PageLines />
          {RIGHT_MONTHS.map((month) => (
            <MonthCalendar key={month} month={month} {...calendarProps} />
          ))}

          {/* Page number */}
          <div className="absolute bottom-2 right-6 text-[10px] text-[#c9a98a] font-display italic select-none">
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
          'repeating-linear-gradient(to bottom, transparent, transparent 31px, rgba(180,150,120,0.08) 32px)',
        backgroundSize: '100% 32px',
      }}
    />
  );
}
