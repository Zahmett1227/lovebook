import { buildMonthGrid } from '../utils/calendarUtils';
import { MONTH_NAMES, WEEKDAY_NAMES } from '../utils/dateUtils';
import { getMemoryTagEmoji, normalizeMemoryTagId } from '../config/memoryTags';
import DayCell from './DayCell';

const MONTH_PALETTE = [
  'from-[#e8f7ef] to-[#eff9ff]',
  'from-[#ebf4ff] to-[#eef9f2]',
  'from-[#f1fce9] to-[#eef9f2]',
  'from-[#fff1e8] to-[#eef9f2]',
];

export default function MonthCalendar({ year, month, datesWithContent, selectedDate, onSelectDate, entriesByDate }) {
  const cells = buildMonthGrid(year, month);
  const paletteClass = MONTH_PALETTE[(month - 1) % MONTH_PALETTE.length];

  return (
    <div className={`bg-gradient-to-br ${paletteClass} backdrop-blur rounded-2xl border border-[#cbe3d5] p-3 flex flex-col gap-1.5 shadow-sm`}>
      {/* Month name */}
      <h3 className="font-display text-center text-sm font-semibold text-[#26553f] mb-1">
        {MONTH_NAMES[month - 1]}
      </h3>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_NAMES.map((w) => (
          <div key={w} className="text-center text-[10px] text-[#6f9d86] font-medium">
            {w}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) =>
          cell ? (
            <DayCell
              key={cell.dateKey}
              dateKey={cell.dateKey}
              day={cell.day}
              hasContent={datesWithContent.has(cell.dateKey)}
              isSelected={selectedDate === cell.dateKey}
              onClick={onSelectDate}
              emojis={getDayEmojis(entriesByDate?.[cell.dateKey] ?? [])}
            />
          ) : (
            <div key={`empty-${i}`} className="h-11 min-h-[44px]" />
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
