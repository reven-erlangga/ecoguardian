import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@shared/utils/graphql', () => ({
  client: {
    mutation: vi.fn(),
  },
}));

import { client } from '@shared/utils/graphql';
import { login, register, refreshToken, logout, updateUser, validateToken } from './auth.service';

describe('auth.service', () => {
  const mockMutation = client.mutation as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('returns camelCased user+token on success', async () => {
      mockMutation.mockReturnValue({
        toPromise: () => Promise.resolve({
          error: null,
          data: {
            user_UserService_Login: {
              user: { id: '1', email: 'a@b.c', created_at: { seconds: 0 } },
              token: 't',
              refresh_token: 'rt',
            },
          },
        }),
      });

      const r = await login('a@b.c', 'pw');
      expect(r.token).toBe('t');
      expect(r.refreshToken).toBe('rt');
      expect(r.user.id).toBe('1');
    });

    it('throws on error', async () => {
      mockMutation.mockReturnValue({
        toPromise: () => Promise.resolve({ error: { message: 'Invalid' } }),
      });

      await expect(login('a@b.c', 'pw')).rejects.toThrow('Invalid');
    });
  });

  describe('register', () => {
    it('returns camelCased on success', async () => {
      mockMutation.mockReturnValue({
        toPromise: () => Promise.resolve({
          error: null,
          data: {
            user_UserService_Register: {
              user: { id: '1', email: 'a@b.c' },
              token: 't',
              refresh_token: 'rt',
            },
          },
        }),
      });

      const r = await register('a@b.c', 'u', 'pw');
      expect(r.token).toBe('t');
      expect(r.refreshToken).toBe('rt');
    });
  });

  describe('refreshToken', () => {
    it('returns camelCased new token pair', async () => {
      mockMutation.mockReturnValue({
        toPromise: () => Promise.resolve({
          error: null,
          data: { user_AuthService_RefreshToken: { token: 'new-t', refresh_token: 'new-rt' } },
        }),
      });

      const r = await refreshToken('old-rt');
      expect(r.token).toBe('new-t');
      expect(r.refreshToken).toBe('new-rt');
    });
  });

  describe('logout', () => {
    it('calls API without error', async () => {
      mockMutation.mockReturnValue({
        toPromise: () => Promise.resolve({ error: null, data: null }),
      });

      await expect(logout('rt')).resolves.toBeUndefined();
    });
  });

  describe('updateUser', () => {
    it('returns camelCased updated user', async () => {
      mockMutation.mockReturnValue({
        toPromise: () => Promise.resolve({
          error: null,
          data: { user_UserService_UpdateUser: { id: '1', email: 'new@b.c', username: 'newu', created_at: { seconds: 0 } } },
        }),
      });

      const r = await updateUser('1', 'new@b.c', 'newu');
      expect(r.email).toBe('new@b.c');
      expect(r.createdAt.seconds).toBe(0);
    });
  });

  describe('validateToken', () => {
    it('returns camelCased user details', async () => {
      mockMutation.mockReturnValue({
        toPromise: () => Promise.resolve({
          error: null,
          data: { user_AuthService_ValidateToken: { user_id: '1', role: 'admin', email: 'a@b.c', username: 'u' } },
        }),
      });

      const r = await validateToken('t');
      expect(r.userId).toBe('1');
      expect(r.email).toBe('a@b.c');
    });
  });
});