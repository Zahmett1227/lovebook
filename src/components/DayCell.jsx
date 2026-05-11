import { isToday } from '../utils/dateUtils';
import { memo } from 'react';

const WEEKDAY_TONES = [
  'bg-[#fffaf8]',
  'bg-[#fff7f4]',
  'bg-[#fff9f6]',
  'bg-[#fff8f5]',
  'bg-[#fffbf8]',
  'bg-[#fff6f2]',
  'bg-[#fff8f6]',
];

function DayCell({ dateKey, day, hasContent, isSelected, onClick, emojis = [], weekdaySlot = 0 }) {
  if (!dateKey) {
    return <div className="aspect-square" />;
  }

  const today = isToday(dateKey);
  const toneClass = WEEKDAY_TONES[weekdaySlot] ?? WEEKDAY_TONES[0];

  return (
    <button
      onClick={() => onClick(dateKey)}
      className={`
        day-cell h-11 min-h-[44px] rounded-[0.95rem] border text-sm font-medium relative flex flex-col items-center justify-center gap-0.5
        transition-all duration-150 select-none active:scale-[0.98] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]
        ${isSelected
          ? 'bg-[#8f5f5f] border-[#8f5f5f] text-white shadow-md ring-2 ring-[#e7c9c1]'
          : today
          ? 'bg-[#fcece6] border-[#ce9a8f] text-[#8f5f5f] font-semibold ring-1 ring-[#d8a89c]'
          : `${toneClass} border-[#ead8d1] text-[#6b4848] hover:bg-[#f9ede8] hover:border-[#cfaaa1]`
        }
      `}
    >
      <span className={`${isSelected ? 'font-semibold' : 'font-medium'}`}>{day}</span>
      {emojis.length > 0 ? (
        <div className="mt-0.5 flex items-center justify-center gap-0.5 text-[10px] leading-none max-w-full overflow-hidden">
          {emojis.map((emoji, index) => (
            <span key={`${dateKey}-${emoji}-${index}`}>{emoji}</span>
          ))}
        </div>
      ) : hasContent && !isSelected && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#8f5f5f] opacity-80" />
      )}
      {emojis.length === 0 && hasContent && isSelected && (
        <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
      )}
    </button>
  );
}

export default memo(DayCell);
