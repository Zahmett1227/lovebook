import { isToday } from '../utils/dateUtils';
import { memo } from 'react';

const WEEKDAY_TONES = [
  'bg-lb-elevated/70',
  'bg-lb-elevated/55',
  'bg-lb-elevated/80',
  'bg-lb-elevated/60',
  'bg-lb-elevated/75',
  'bg-lb-elevated/50',
  'bg-lb-elevated/65',
];

function DayCell({ dateKey, day, hasContent, isSelected, onClick, emojis = [], weekdaySlot = 0 }) {
  if (!dateKey) {
    return <div className="aspect-square" />;
  }

  const today = isToday(dateKey);
  const toneClass = WEEKDAY_TONES[weekdaySlot] ?? WEEKDAY_TONES[0];

  return (
    <button
      type="button"
      onClick={() => onClick(dateKey)}
      className={`
        day-cell h-11 min-h-[44px] rounded-[0.95rem] border text-sm font-medium relative flex flex-col items-center justify-center gap-0.5
        transition-all duration-150 select-none active:scale-[0.98]
        shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
        ${isSelected
          ? 'bg-lb-accent border-lb-accent text-lb-page shadow-glow ring-2 ring-lb-accent/35'
          : today
          ? 'bg-lb-accent/12 border-lb-accent/50 text-lb-accent font-semibold ring-1 ring-lb-accent/25'
          : `${toneClass} border-lb-border text-lb-text hover:border-lb-accent/35 hover:bg-lb-muted/60`
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
