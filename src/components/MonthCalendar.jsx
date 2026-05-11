import { memo, useMemo } from 'react';
import { buildMonthGrid } from '../utils/calendarUtils';
import { MONTH_NAMES, WEEKDAY_NAMES } from '../utils/dateUtils';
import { getMemoryTagEmoji, normalizeMemoryTagId } from '../config/memoryTags';
import DayCell from './DayCell';

/** Ay bazlı sabit gradientler — yalnızca lb-* paleti */
const MONTH_GRADIENTS = [
  'from-lb-canvas via-lb-surface to-lb-muted/90',
  'from-lb-muted/50 via-lb-surface to-lb-canvas',
  'from-lb-surface via-lb-canvas to-lb-muted/70',
  'from-lb-elevated via-lb-muted/40 to-lb-canvas',
  'from-lb-canvas via-lb-elevated to-lb-surface',
  'from-lb-muted/60 via-lb-surface to-lb-canvas',
  'from-lb-surface via-lb-canvas to-lb-elevated',
  'from-lb-canvas via-lb-muted/50 to-lb-surface',
  'from-lb-elevated/90 via-lb-canvas to-lb-muted/50',
  'from-lb-muted/40 via-lb-elevated to-lb-canvas',
  'from-lb-surface via-lb-muted/60 to-lb-canvas',
  'from-lb-canvas via-lb-elevated/80 to-lb-muted/70',
];

const MONTH_TITLE_COLORS = [
  'text-lb-accent',
  'text-lb-accent2',
  'text-lb-text',
  'text-lb-accent',
  'text-lb-accent2',
  'text-lb-accent',
  'text-lb-accent2',
  'text-lb-text',
  'text-lb-accent',
  'text-lb-accent2',
  'text-lb-accent',
  'text-lb-subtext',
];

function MonthCalendar({ year, month, datesWithContent, selectedDate, onSelectDate, entriesByDate }) {
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const safeDatesWithContent = datesWithContent instanceof Set ? datesWithContent : new Set();
  const gradientClass = MONTH_GRADIENTS[month - 1] ?? MONTH_GRADIENTS[0];
  const titleColorClass = MONTH_TITLE_COLORS[month - 1] ?? 'text-lb-text';

  const emojisByDate = useMemo(() => {
    const source = entriesByDate && typeof entriesByDate === 'object' ? entriesByDate : {};
    return Object.entries(source).reduce((acc, [dateKey, entries]) => {
      acc[dateKey] = getDayEmojis(entries ?? []);
      return acc;
    }, {});
  }, [entriesByDate]);

  const intensityByDate = useMemo(() => {
    const source = entriesByDate && typeof entriesByDate === 'object' ? entriesByDate : {};
    return Object.entries(source).reduce((acc, [dateKey, entries]) => {
      const n = Array.isArray(entries) ? entries.length : 0;
      acc[dateKey] = Math.min(n, 4);
      return acc;
    }, {});
  }, [entriesByDate]);

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${gradientClass} rounded-[1.2rem] border border-lb-border/60 p-3.5 flex flex-col gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-white/[0.06] transition-shadow duration-300 hover:shadow-[0_8px_32px_rgba(227,176,92,0.08)]`}
    >
      <div className="month-card-grain absolute inset-0 pointer-events-none rounded-[1.2rem]" aria-hidden />

      <h3
        className={`relative font-display text-center text-[1.05rem] font-semibold mb-1 tracking-[0.05em] ${titleColorClass}`}
      >
        {MONTH_NAMES[month - 1]}
      </h3>

      <div className="relative grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_NAMES.map((w) => (
          <div
            key={w}
            className="text-center text-[9px] text-lb-subtext/70 font-semibold uppercase tracking-[0.14em]"
          >
            {w}
          </div>
        ))}
      </div>

      <div className="relative grid grid-cols-7 gap-1.5">
        {cells.map((cell, i) =>
          cell ? (
            <DayCell
              key={cell.dateKey}
              dateKey={cell.dateKey}
              day={cell.day}
              hasContent={safeDatesWithContent.has(cell.dateKey)}
              isSelected={selectedDate === cell.dateKey}
              onClick={onSelectDate}
              emojis={emojisByDate[cell.dateKey] ?? []}
              weekdaySlot={i % 7}
              intensity={intensityByDate[cell.dateKey] ?? 0}
            />
          ) : (
            <div
              key={`empty-${i}`}
              className="h-11 min-h-[44px] rounded-[0.95rem] border border-dashed border-lb-border/25 bg-lb-page/10"
            />
          )
        )}
      </div>
    </div>
  );
}

function getDayEmojis(entries) {
  const uniqueTags = [...new Set(
    entries
      .map((entry) => normalizeMemoryTagId(entry.tag || entry.mood || null))
      .filter(Boolean)
  )];

  return uniqueTags.map(getMemoryTagEmoji).slice(0, 3);
}

export default memo(MonthCalendar);
