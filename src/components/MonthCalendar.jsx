import { memo, useMemo } from 'react';
import { buildMonthGrid } from '../utils/calendarUtils';
import { MONTH_NAMES, WEEKDAY_NAMES } from '../utils/dateUtils';
import { getMemoryTagEmoji, normalizeMemoryTagId } from '../config/memoryTags';
import DayCell from './DayCell';

const MONTH_PALETTE = [
  'from-[#fff9f7] to-[#f9ece5]',
  'from-[#fff8f5] to-[#f4ebe3]',
  'from-[#fffaf8] to-[#f8ede8]',
  'from-[#fff7f3] to-[#f3e6de]',
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
    <div className={`bg-gradient-to-br ${paletteClass} backdrop-blur rounded-[1.25rem] border border-[#e8d7d0] p-3.5 flex flex-col gap-2 shadow-editorial`}>
      {/* Month name */}
      <h3 className="font-display text-center text-[1.05rem] font-semibold text-[#6d4346] mb-1 tracking-[0.02em]">
        {MONTH_NAMES[month - 1]}
      </h3>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_NAMES.map((w) => (
          <div key={w} className="text-center text-[10px] text-[#a17872] font-semibold uppercase tracking-[0.08em]">
            {w}
          </div>
        ))}
      </div>

      {/* Day cells */}
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
            <div key={`empty-${i}`} className="h-11 min-h-[44px] rounded-[0.95rem] border border-dashed border-[#ead8d1] bg-[#fff9f7]/60" />
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
