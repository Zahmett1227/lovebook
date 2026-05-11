import { describe, it, expect } from 'vitest';
import { getErrorMessage, firestoreUserMessage, storageUserMessage } from './errorUtils';

describe('getErrorMessage', () => {
  it('reads Error.message', () => {
    expect(getErrorMessage(new Error('x'))).toBe('x');
  });

  it('returns string as-is', () => {
    expect(getErrorMessage('  hi  ')).toBe('  hi  ');
  });

  it('uses fallback for empty', () => {
    expect(getErrorMessage({}, 'fallback')).toBe('fallback');
  });
});

describe('firestoreUserMessage', () => {
  it('maps network-ish errors', () => {
    const msg = firestoreUserMessage(new Error('Failed to fetch'));
    expect(msg).toMatch(/İnternet|bağlantı|sunucu/i);
  });

  it('maps permission errors', () => {
    const msg = firestoreUserMessage(new Error('Missing or insufficient permissions'));
    expect(msg).toMatch(/erişim|izni|Oturum/i);
  });

  it('maps index errors', () => {
    const msg = firestoreUserMessage(new Error('The query requires an index'));
    expect(msg).toMatch(/yapılandır|yönetici/i);
  });

  it('uses generic for unknown', () => {
    const msg = firestoreUserMessage(new Error('Something weird'));
    expect(msg).toMatch(/yüklenemedi|yenile/i);
  });
});

describe('storageUserMessage', () => {
  it('maps unauthorized', () => {
    const err = { code: 'storage/unauthorized', message: 'nope' };
    expect(storageUserMessage(err)).toMatch(/Depolama izni|Storage/i);
  });

  it('maps unauthenticated', () => {
    expect(storageUserMessage({ code: 'storage/unauthenticated' })).toMatch(/Oturum/i);
  });
});
