import { describe, it, expect } from 'vitest';
import { validateProfileEmail, validateProfileUsername } from './profile-card.validations';

describe('profile-card.validations', () => {
  describe('validateProfileEmail', () => {
    it('rejects empty', () => {
      expect(validateProfileEmail('')).toMatch(/kosong/i);
    });

    it('rejects invalid format', () => {
      expect(validateProfileEmail('bad')).toMatch(/format/i);
    });

    it('accepts valid', () => {
      expect(validateProfileEmail('user@example.com')).toBeNull();
    });
  });

  describe('validateProfileUsername', () => {
    it('rejects empty', () => {
      expect(validateProfileUsername('')).toMatch(/kosong/i);
    });

    it('rejects too short', () => {
      expect(validateProfileUsername('ab')).toMatch(/minimal/i);
    });

    it('rejects too long', () => {
      expect(validateProfileUsername('x'.repeat(51))).toMatch(/maksimal/i);
    });

    it('accepts valid', () => {
      expect(validateProfileUsername('alice')).toBeNull();
    });
  });
});