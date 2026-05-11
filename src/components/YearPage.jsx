import MonthCalendar from './MonthCalendar';
import { MEMORY_TAGS } from '../config/memoryTags';

const LEFT_MONTHS  = [1, 2, 3, 4, 5, 6];
const RIGHT_MONTHS = [7, 8, 9, 10, 11, 12];

export default function YearPage({
  year,
  datesWithContent,
  selectedDate,
  onSelectDate,
  entriesByDate,
  activeTagFilter = 'all',
  onTagFilterChange,
  calendarLoadError = null,
  onRetryCalendar,
}) {
  const calendarProps = { year, datesWithContent, selectedDate, onSelectDate, entriesByDate };

  return (
    <>
      {calendarLoadError && (
        <div className="px-4 sm:px-6 pt-3">
          <div
            role="alert"
            className="rounded-2xl border border-[#e7b8b0] bg-[#fff0ed] px-3 py-2.5 text-xs sm:text-sm text-[#6b3a38] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <span>{calendarLoadError}</span>
            {onRetryCalendar && (
              <button
                type="button"
                onClick={onRetryCalendar}
                className="shrink-0 rounded-xl border border-[#ddbcb3] bg-white px-3 py-1.5 text-xs font-medium text-[#6f4548] active:scale-[0.98]"
              >
                Tekrar dene
              </button>
            )}
          </div>
        </div>
      )}
      <div className="px-4 sm:px-6 pt-4 pb-2">
        <div className="rounded-[1.8rem] border border-[#ead4ce] bg-gradient-to-br from-[#fff9f8] via-[#fbeee8] to-[#f8e7df] px-4 py-5 shadow-editorial relative overflow-hidden">
          <div className="absolute -top-10 -right-6 w-24 h-24 rounded-full bg-[#efc1c7]/35 blur-2xl" />
          <div className="absolute -bottom-12 -left-10 w-28 h-28 rounded-full bg-[#e8c7a9]/30 blur-2xl" />
          <p className="font-hero-sub text-[10px] uppercase tracking-[0.28em] text-[#a0726c] relative text-center">
            Bizim Günlüğümüz
          </p>
          <h2 className="font-hero-title text-[2.15rem] sm:text-[2.45rem] font-semibold text-[#5a3738] leading-none mt-2 text-center">
            {year}
          </h2>
          <p className="font-hero-sub text-sm sm:text-[15px] text-[#8f5f5f] mt-2 relative text-center">
            Yeni bir sayfa, yeni bir hatıra.
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-1">
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1.5">
          <FilterChip
            active={activeTagFilter === 'all'}
            onClick={() => onTagFilterChange?.('all')}
            label="Tümü"
          />
          {MEMORY_TAGS.map((tag) => (
            <FilterChip
              key={tag.id}
              active={activeTagFilter === tag.id}
              onClick={() => onTagFilterChange?.(tag.id)}
              label={`${tag.emoji} ${tag.label}`}
            />
          ))}
        </div>
      </div>

      {/* ── Mobile / tablet: single column ── */}
      <div className="lg:hidden px-4 pb-6 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...LEFT_MONTHS, ...RIGHT_MONTHS].map((month) => (
          <MonthCalendar key={month} month={month} {...calendarProps} />
        ))}
      </div>

      {/* ── Desktop: open-book two-page layout ── */}
      <div className="hidden lg:flex pb-6 pt-4">

        {/* Left page — Jan–Jun */}
        <div
          className="flex-1 grid grid-cols-3 gap-4 px-6 pb-4 relative rounded-l-[1.6rem] border border-[#ead8d1]"
          style={{
            background:
              'linear-gradient(to bottom, #fff9f8 0%, #f8ebe3 100%)',
          }}
        >
          {/* Subtle horizontal line rules (page texture) */}
          <PageLines />
          {LEFT_MONTHS.map((month) => (
            <MonthCalendar key={month} month={month} {...calendarProps} />
          ))}

          {/* Page number */}
          <div className="absolute bottom-2 left-6 text-[10px] text-[#b3877f] font-display italic select-none">
            {year}
          </div>
        </div>

        {/* Spine */}
        <div className="relative w-10 flex-shrink-0">
          {/* Centre crease */}
          <div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px"
            style={{ background: '#c79e95', opacity: 0.5 }}
          />
          {/* Gradient shadow left of spine */}
          <div
            className="absolute inset-y-0 right-1/2"
            style={{
              width: 20,
              background:
                'linear-gradient(to left, rgba(72,32,32,0.09), transparent)',
            }}
          />
          {/* Gradient shadow right of spine */}
          <div
            className="absolute inset-y-0 left-1/2"
            style={{
              width: 20,
              background:
                'linear-gradient(to right, rgba(72,32,32,0.09), transparent)',
            }}
          />
        </div>

        {/* Right page — Jul–Dec */}
        <div
          className="flex-1 grid grid-cols-3 gap-4 px-6 pb-4 relative rounded-r-[1.6rem] border border-[#ead8d1]"
          style={{
            background:
              'linear-gradient(to bottom, #fff9f8 0%, #f8ebe3 100%)',
          }}
        >
          <PageLines />
          {RIGHT_MONTHS.map((month) => (
            <MonthCalendar key={month} month={month} {...calendarProps} />
          ))}

          {/* Page number */}
          <div className="absolute bottom-2 right-6 text-[10px] text-[#b3877f] font-display italic select-none">
            {year}
          </div>
        </div>
      </div>
    </>
  );
}

function FilterChip({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`font-hero-sub text-xs whitespace-nowrap rounded-full border px-3.5 min-h-[36px] transition active:scale-[0.98] ${
        active
          ? 'bg-[#8f5f5f] border-[#8f5f5f] text-white shadow-sm'
          : 'bg-[#fffaf8] border-[#e7d3cb] text-[#7a4f4f] hover:bg-[#f8ece7]'
      }`}
    >
      {label}
    </button>
  );
}

/* Subtle ruled-paper lines behind each page */
function PageLines() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, transparent, transparent 31px, rgba(152,102,96,0.10) 32px)',
        backgroundSize: '100% 32px',
      }}
    />
  );
}
