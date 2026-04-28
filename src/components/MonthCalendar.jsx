import { buildMonthGrid } from '../utils/calendarUtils';
import { MONTH_NAMES, WEEKDAY_NAMES } from '../utils/dateUtils';
import DayCell from './DayCell';

export default function MonthCalendar({ year, month, datesWithContent, selectedDate, onSelectDate }) {
  const cells = buildMonthGrid(year, month);

  return (
    <div className="bg-white rounded-xl border border-[#e8d5c0] p-3 flex flex-col gap-1">
      {/* Month name */}
      <h3 className="font-display text-center text-sm font-semibold text-[#6b5040] mb-1">
        {MONTH_NAMES[month - 1]}
      </h3>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
        {WEEKDAY_NAMES.map((w) => (
          <div key={w} className="text-center text-[10px] text-[#b09080] font-medium">
            {w}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell, i) =>
          cell ? (
            <DayCell
              key={cell.dateKey}
              dateKey={cell.dateKey}
              day={cell.day}
              hasContent={datesWithContent.has(cell.dateKey)}
              isSelected={selectedDate === cell.dateKey}
              onClick={onSelectDate}
            />
          ) : (
            <div key={`empty-${i}`} className="aspect-square" />
          )
        )}
      </div>
    </div>
  );
}
