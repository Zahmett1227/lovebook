import { isToday } from '../utils/dateUtils';

export default function DayCell({ dateKey, day, hasContent, isSelected, onClick, emojis = [] }) {
  if (!dateKey) {
    return <div className="aspect-square" />;
  }

  const today = isToday(dateKey);

  return (
    <button
      onClick={() => onClick(dateKey)}
      className={`
        day-cell h-11 min-h-[44px] rounded-xl text-sm font-medium relative flex flex-col items-center justify-center gap-0.5
        transition-all duration-150 select-none active:scale-[0.98]
        ${isSelected
          ? 'bg-[#1f6b4b] text-white shadow-md ring-2 ring-[#9dceb5]'
          : today
          ? 'bg-[#def0e6] text-[#1f6b4b] font-semibold ring-1 ring-[#7bb395]'
          : 'text-[#275740] hover:bg-[#edf8f2]'
        }
      `}
    >
      <span>{day}</span>
      {emojis.length > 0 ? (
        <div className="mt-0.5 flex items-center justify-center gap-0.5 text-[11px] leading-none max-w-full overflow-hidden">
          {emojis.map((emoji, index) => (
            <span key={`${dateKey}-${emoji}-${index}`}>{emoji}</span>
          ))}
        </div>
      ) : hasContent && !isSelected && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#1f6b4b] opacity-80" />
      )}
      {emojis.length === 0 && hasContent && isSelected && (
        <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
      )}
    </button>
  );
}
