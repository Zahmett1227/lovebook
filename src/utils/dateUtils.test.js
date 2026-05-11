import { describe, it, expect } from 'vitest';
import { normalizeDateKey, formatDateDisplay, formatDateKey, isToday } from './dateUtils';

describe('normalizeDateKey', () => {
  it('accepts valid ISO-like date', () => {
    expect(normalizeDateKey('2026-05-11')).toBe('2026-05-11');
    expect(normalizeDateKey('2026-5-9')).toBe('2026-05-09');
  });

  it('rejects invalid shapes', () => {
    expect(normalizeDateKey('')).toBeNull();
    expect(normalizeDateKey('2026/05/11')).toBeNull();
    expect(normalizeDateKey(null)).toBeNull();
    expect(normalizeDateKey('2026-13-01')).toBeNull();
  });
});

describe('formatDateDisplay', () => {
  it('formats known date in Turkish', () => {
    expect(formatDateDisplay('2026-01-15')).toMatch(/15/);
    expect(formatDateDisplay('2026-01-15')).toMatch(/2026/);
  });

  it('handles invalid', () => {
    expect(formatDateDisplay('bad')).toBe('Geçersiz tarih');
  });
});

describe('formatDateKey', () => {
  it('pads month and day', () => {
    expect(formatDateKey(2025, 3, 7)).toBe('2025-03-07');
  });
});

describe('isToday', () => {
  it('matches todayKey for current calendar day', () => {
    const now = new Date();
    const key = formatDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
    expect(isToday(key)).toBe(true);
    expect(isToday('1900-01-01')).toBe(false);
  });
});
