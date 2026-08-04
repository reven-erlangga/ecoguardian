import { describe, it, expect } from 'vitest';
import { formatLoginError } from './login-form.formatter';

describe('login-form.formatter', () => {
  it('maps UNAUTHENTICATED to friendly message', () => {
    expect(formatLoginError(new Error('UNAUTHENTICATED'))).toMatch(/Email atau password salah/i);
  });

  it('maps "Invalid email or password"', () => {
    expect(formatLoginError(new Error('Invalid email or password'))).toMatch(/Email atau password salah/i);
  });

  it('maps "not found" to Akun tidak ditemukan', () => {
    expect(formatLoginError(new Error('User not found'))).toMatch(/tidak ditemukan/i);
  });

  it('falls back to generic message', () => {
    expect(formatLoginError(new Error('Something weird'))).toMatch(/Terjadi kesalahan/i);
  });

  it('handles non-Error input', () => {
    expect(formatLoginError('UNAUTHENTICATED')).toMatch(/Email atau password salah/i);
    expect(formatLoginError(null)).toMatch(/Terjadi kesalahan/i);
  });
});