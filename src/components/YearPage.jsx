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
            className="rounded-2xl border border-lb-danger/40 bg-lb-danger/10 px-3 py-2.5 text-xs sm:text-sm text-lb-text flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <span>{calendarLoadError}</span>
            {onRetryCalendar && (
              <button
                type="button"
                onClick={onRetryCalendar}
                className="shrink-0 rounded-xl border border-lb-border bg-lb-elevated px-3 py-1.5 text-xs font-medium text-lb-accent active:scale-[0.98]"
              >
                Tekrar dene
              </button>
            )}
          </div>
        </div>
      )}
      <div className="px-4 sm:px-6 pt-4 pb-2">
        <div className="rounded-[1.8rem] border border-lb-border bg-gradient-to-b from-lb-elevated via-lb-surface to-lb-canvas px-4 py-6 sm:py-8 shadow-editorial relative overflow-hidden ring-1 ring-lb-accent/10">
          <div className="absolute -top-16 -right-10 w-40 h-40 rounded-full bg-lb-accent/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-12 w-44 h-44 rounded-full bg-lb-accent2/10 blur-3xl pointer-events-none" />
          <p className="font-hero-sub text-[10px] uppercase tracking-[0.32em] text-lb-accent relative text-center">
            Bizim günlüğümüz
          </p>
          <h2 className="font-hero-title text-[2.2rem] sm:text-[2.75rem] font-semibold text-lb-text leading-none mt-3 text-center">
            {year}
          </h2>
          <p className="font-hero-sub text-sm sm:text-[15px] text-lb-subtext mt-3 relative text-center max-w-md mx-auto">
            Her kare bir hatıra — takvim senin storyboard’un.
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

      <div className="lg:hidden px-4 pb-6 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...LEFT_MONTHS, ...RIGHT_MONTHS].map((month) => (
          <MonthCalendar key={month} month={month} {...calendarProps} />
        ))}
      </div>

      <div className="hidden lg:flex pb-6 pt-4">
        <div
          className="flex-1 grid grid-cols-3 gap-4 px-6 pb-4 relative rounded-l-[1.5rem] border border-lb-border bg-lb-canvas/80"
        >
          <PageLines />
          {LEFT_MONTHS.map((month) => (
            <MonthCalendar key={month} month={month} {...calendarProps} />
          ))}
          <div className="absolute bottom-2 left-6 text-[10px] text-lb-subtext font-display italic select-none">
            {year}
          </div>
        </div>

        <div className="relative w-10 flex-shrink-0 book-spine border-y border-lb-border" />

        <div
          className="flex-1 grid grid-cols-3 gap-4 px-6 pb-4 relative rounded-r-[1.5rem] border border-lb-border bg-lb-canvas/80"
        >
          <PageLines />
          {RIGHT_MONTHS.map((month) => (
            <MonthCalendar key={month} month={month} {...calendarProps} />
          ))}
          <div className="absolute bottom-2 right-6 text-[10px] text-lb-subtext font-display italic select-none">
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
      type="button"
      onClick={onClick}
      className={`font-hero-sub text-xs whitespace-nowrap rounded-full border px-3.5 min-h-[38px] transition active:scale-[0.98] ${
        active
          ? 'bg-lb-accent border-lb-accent text-lb-page shadow-glow'
          : 'bg-lb-elevated border-lb-border text-lb-subtext hover:text-lb-text hover:border-lb-accent/35'
      }`}
    >
      {label}
    </button>
  );
}

function PageLines() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.35]"
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, transparent, transparent 31px, rgba(157,148,168,0.12) 32px)',
        backgroundSize: '100% 32px',
      }}
    />
  );
}
