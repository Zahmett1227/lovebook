import { isToday } from '../utils/dateUtils';

export default function DayCell({ dateKey, day, hasContent, isSelected, onClick }) {
  if (!dateKey) {
    return <div className="aspect-square" />;
  }

  const today = isToday(dateKey);

  return (
    <button
      onClick={() => onClick(dateKey)}
      className={`
        day-cell aspect-square rounded-lg text-xs font-medium relative flex flex-col items-center justify-center gap-0.5
        transition-all duration-150 select-none
        ${isSelected
          ? 'bg-[#a0704a] text-white shadow-md'
          : today
          ? 'bg-[#f0e4d6] text-[#a0704a] font-semibold ring-1 ring-[#c9a98a]'
          : 'text-[#5c3d2a] hover:bg-[#f5ead8]'
        }
      `}
    >
      <span>{day}</span>
      {hasContent && !isSelected && (
        <span className="w-1 h-1 rounded-full bg-[#a0704a] opacity-70" />
      )}
      {hasContent && isSelected && (
        <span className="w-1 h-1 rounded-full bg-white opacity-80" />
      )}
    </button>
  );
}
