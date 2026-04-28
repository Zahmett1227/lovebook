import { getDaysInMonth, getDay } from 'date-fns';

// Returns an array of { day, dateKey } | null for each cell in a Mon-start grid
export function buildMonthGrid(year, month) {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1, 1));
  // getDay: 0=Sun..6=Sat; convert to Mon-start: Mon=0..Sun=6
  const firstDayRaw = getDay(new Date(year, month - 1, 1));
  const offset = (firstDayRaw + 6) % 7;

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const m = String(month).padStart(2, '0');
    const day = String(d).padStart(2, '0');
    cells.push({ day: d, dateKey: `${year}-${m}-${day}` });
  }
  // Pad to full rows of 7
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
