import { describe, it, expect } from 'vitest';
import { formatRegisterError } from './register-form.formatter';

describe('register-form.formatter', () => {
  it('maps "already registered" to friendly message', () => {
    expect(formatRegisterError(new Error('Email already registered'))).toMatch(/sudah terdaftar/i);
  });

  it('maps ALREADY_EXISTS code', () => {
    expect(formatRegisterError(new Error('ALREADY_EXISTS'))).toMatch(/sudah terdaftar/i);
  });

  it('falls back to generic', () => {
    expect(formatRegisterError(new Error('Random failure'))).toMatch(/Gagal mendaftar/i);
  });

  it('handles non-Error input', () => {
    expect(formatRegisterError('ALREADY_EXISTS')).toMatch(/sudah terdaftar/i);
    expect(formatRegisterError(undefined)).toMatch(/Gagal mendaftar/i);
  });
});