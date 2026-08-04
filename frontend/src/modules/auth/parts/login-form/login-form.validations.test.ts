import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validateAll } from './login-form.validations';

describe('login-form.validations', () => {
  describe('validateEmail', () => {
    it('rejects empty', () => {
      expect(validateEmail('')).toMatch(/kosong/i);
    });

    it('rejects whitespace only', () => {
      expect(validateEmail('   ')).toMatch(/kosong/i);
    });

    it('rejects invalid format', () => {
      expect(validateEmail('not-an-email')).toMatch(/format/i);
      expect(validateEmail('a@b')).toMatch(/format/i);
      expect(validateEmail('@b.c')).toMatch(/format/i);
    });

    it('accepts valid email', () => {
      expect(validateEmail('user@example.com')).toBeNull();
      expect(validateEmail('a.b+c@x.io')).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('rejects empty', () => {
      expect(validatePassword('')).toMatch(/kosong/i);
    });

    it('rejects too short', () => {
      expect(validatePassword('12345')).toMatch(/minimal/i);
    });

    it('accepts valid password', () => {
      expect(validatePassword('123456')).toBeNull();
      expect(validatePassword('long-secure-password')).toBeNull();
    });
  });

  describe('validateAll', () => {
    it('returns empty errors for valid data', () => {
      expect(validateAll({ email: 'a@b.c', password: '123456' })).toEqual({});
    });

    it('returns both errors for invalid data', () => {
      const errors = validateAll({ email: '', password: '' });
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
    });

    it('returns only email error', () => {
      const errors = validateAll({ email: 'bad', password: '123456' });
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeUndefined();
    });
  });
});