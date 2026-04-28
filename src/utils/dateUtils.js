import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export function formatDateDisplay(dateStr) {
  const date = parseISO(dateStr);
  return format(date, 'd MMMM yyyy', { locale: tr });
}

export function formatDateKey(year, month, day) {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function todayKey() {
  const now = new Date();
  return formatDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function isToday(dateStr) {
  return dateStr === todayKey();
}

export const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

export const WEEKDAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
