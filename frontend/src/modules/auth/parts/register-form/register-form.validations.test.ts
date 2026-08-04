import { describe, it, expect } from 'vitest';
import { validateEmail, validateUsername, validatePassword, validateAll } from './register-form.validations';

describe('register-form.validations', () => {
  describe('validateEmail', () => {
    it('rejects empty', () => {
      expect(validateEmail('')).toMatch(/kosong/i);
    });

    it('rejects invalid format', () => {
      expect(validateEmail('bad')).toMatch(/format/i);
    });

    it('accepts valid email', () => {
      expect(validateEmail('user@example.com')).toBeNull();
    });
  });

  describe('validateUsername', () => {
    it('rejects empty', () => {
      expect(validateUsername('')).toMatch(/kosong/i);
    });

    it('rejects too short', () => {
      expect(validateUsername('ab')).toMatch(/minimal/i);
    });

    it('rejects too long', () => {
      expect(validateUsername('x'.repeat(51))).toMatch(/maksimal/i);
    });

    it('accepts valid username', () => {
      expect(validateUsername('alice')).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('rejects empty', () => {
      expect(validatePassword('')).toMatch(/kosong/i);
    });

    it('rejects too short', () => {
      expect(validatePassword('123')).toMatch(/minimal/i);
    });

    it('accepts valid password', () => {
      expect(validatePassword('123456')).toBeNull();
    });
  });

  describe('validateAll', () => {
    it('returns empty for valid', () => {
      expect(validateAll({ email: 'a@b.c', username: 'alice', password: '123456' })).toEqual({});
    });

    it('returns all errors for empty form', () => {
      const errors = validateAll({ email: '', username: '', password: '' });
      expect(errors.email).toBeDefined();
      expect(errors.username).toBeDefined();
      expect(errors.password).toBeDefined();
    });
  });
});