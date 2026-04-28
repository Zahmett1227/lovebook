import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export function normalizeDateKey(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  const normalized = `${year}-${String(Number(month)).padStart(2, '0')}-${String(Number(day)).padStart(2, '0')}`;
  const date = parseISO(normalized);
  return Number.isNaN(date.getTime()) ? null : normalized;
}

export function formatDateDisplay(dateStr) {
  const normalized = normalizeDateKey(dateStr);
  if (!normalized) return 'Geçersiz tarih';
  const date = parseISO(normalized);
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
