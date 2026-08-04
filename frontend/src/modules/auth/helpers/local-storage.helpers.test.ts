import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getLocal, setLocal, parseToken } from './local-storage.helpers';

describe('local-storage.helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getLocal', () => {
    it('returns null when key missing', () => {
      expect(getLocal('missing')).toBeNull();
    });

    it('returns stored value', () => {
      localStorage.setItem('foo', 'bar');
      expect(getLocal('foo')).toBe('bar');
    });

    it('returns null on server (no localStorage)', () => {
      const original = globalThis.localStorage;
      // @ts-expect-error test SSR scenario
      delete globalThis.localStorage;
      expect(getLocal('foo')).toBeNull();
      globalThis.localStorage = original;
    });
  });

  describe('setLocal', () => {
    it('stores value', () => {
      setLocal('foo', 'bar');
      expect(localStorage.getItem('foo')).toBe('bar');
    });

    it('removes key when val is null', () => {
      localStorage.setItem('foo', 'bar');
      setLocal('foo', null);
      expect(localStorage.getItem('foo')).toBeNull();
    });

    it('no-op on server', () => {
      const original = globalThis.localStorage;
      // @ts-expect-error test SSR scenario
      delete globalThis.localStorage;
      expect(() => setLocal('foo', 'bar')).not.toThrow();
      globalThis.localStorage = original;
    });
  });

  describe('parseToken', () => {
    it('parses JWT payload', () => {
      // jwt: header.payload.signature
      const payload = { exp: 9999999999 };
      const token = `aaa.${btoa(JSON.stringify(payload))}.bbb`;
      expect(parseToken(token)).toEqual(payload);
    });

    it('returns null on invalid JWT', () => {
      expect(parseToken('not-a-jwt')).toBeNull();
    });

    it('returns null on invalid base64', () => {
      expect(parseToken('aaa.!!!.bbb')).toBeNull();
    });

    it('returns null on invalid JSON', () => {
      const token = `aaa.${btoa('not-json')}.bbb`;
      expect(parseToken(token)).toBeNull();
    });
  });
});