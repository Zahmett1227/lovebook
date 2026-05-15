import { isToday } from '../utils/dateUtils';
import { memo } from 'react';

const INTENSITY_RING = {
  0: '',
  1: 'ring-1 ring-lb-accent/20',
  2: 'ring-1 ring-lb-accent/45',
  3: 'ring-2 ring-lb-accent/65',
  4: 'ring-2 ring-lb-accent shadow-[0_0_10px_rgba(227,176,92,0.3)]',
};

// Day 1 → hsl(0) red/coral … Day 31 → hsl(300) purple/violet — full warm rainbow
function getDayHsl(day) {
  const hue = Math.round(((day - 1) / 30) * 300);
  return { hue, color: `hsl(${hue},65%,72%)`, bg: `hsla(${hue},65%,72%,0.10)` };
}

function DayCell({
  dateKey,
  day,
  hasContent,
  isSelected,
  onClick,
  emojis = [],
  weekdaySlot = 0,
  intensity = 0,
}) {
  if (!dateKey) {
    return <div className="aspect-square" />;
  }

  const today = isToday(dateKey);
  const safeIntensity = Math.min(Math.max(Number(intensity) || 0, 0), 4);
  const intensityClass = !isSelected && !today ? INTENSITY_RING[safeIntensity] ?? '' : '';
  const { color: dayColor, bg: dayBg } = getDayHsl(day);

  const normalStyle = !isSelected && !today
    ? { color: dayColor, backgroundColor: dayBg }
    : {};

  return (
    <button
      type="button"
      onClick={() => onClick(dateKey)}
      style={normalStyle}
      className={`
        day-cell h-11 min-h-[44px] rounded-[0.95rem] border text-sm font-medium relative flex flex-col items-center justify-center gap-0.5
        transition-all duration-150 select-none active:scale-[0.98]
        shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
        ${isSelected
          ? 'bg-lb-accent border-lb-accent text-lb-page font-semibold shadow-[0_0_24px_rgba(227,176,92,0.4)] ring-2 ring-lb-accent/40'
          : today
          ? 'bg-lb-accent/12 border-lb-accent/50 text-lb-accent font-semibold ring-1 ring-lb-accent/25'
          : `border-lb-border/60 hover:border-lb-accent/35 ${intensityClass}`
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
        <span className="w-1.5 h-1.5 rounded-full bg-lb-accent opacity-90 shadow-[0_0_6px_rgba(227,176,92,0.7)]" />
      )}
      {emojis.length === 0 && hasContent && isSelected && (
        <span className="w-1.5 h-1.5 rounded-full bg-lb-page opacity-90" />
      )}
    </button>
  );
}

export default memo(DayCell);
