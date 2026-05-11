import { memo, useMemo } from 'react';
import { buildMonthGrid } from '../utils/calendarUtils';
import { MONTH_NAMES, WEEKDAY_NAMES } from '../utils/dateUtils';
import { getMemoryTagEmoji, normalizeMemoryTagId } from '../config/memoryTags';
import DayCell from './DayCell';

const MONTH_PALETTE = [
  'from-lb-elevated/90 to-lb-canvas',
  'from-lb-muted/40 to-lb-surface',
  'from-lb-elevated to-lb-canvas/95',
  'from-lb-surface to-lb-muted/30',
];

function MonthCalendar({ year, month, datesWithContent, selectedDate, onSelectDate, entriesByDate }) {
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const safeDatesWithContent = datesWithContent instanceof Set ? datesWithContent : new Set();
  const paletteClass = MONTH_PALETTE[(month - 1) % MONTH_PALETTE.length];
  const emojisByDate = useMemo(() => {
    const source = entriesByDate && typeof entriesByDate === 'object' ? entriesByDate : {};
    return Object.entries(source).reduce((acc, [dateKey, entries]) => {
      acc[dateKey] = getDayEmojis(entries ?? []);
      return acc;
    }, {});
  }, [entriesByDate]);

  return (
    <div
      className={`bg-gradient-to-br ${paletteClass} rounded-[1.2rem] border border-lb-border p-3.5 flex flex-col gap-2 shadow-editorial ring-1 ring-white/[0.03] transition-shadow duration-300 hover:shadow-[0_8px_32px_rgba(227,176,92,0.08)]`}
    >
      <h3 className="font-display text-center text-base font-semibold text-lb-text mb-1 tracking-[0.05em]">
        {MONTH_NAMES[month - 1]}
      </h3>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_NAMES.map((w) => (
          <div key={w} className="text-center text-[9px] text-lb-subtext font-semibold uppercase tracking-[0.14em]">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
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
            />
          ) : (
            <div
              key={`empty-${i}`}
              className="h-11 min-h-[44px] rounded-[0.95rem] border border-dashed border-lb-border/40 bg-lb-canvas/30"
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
