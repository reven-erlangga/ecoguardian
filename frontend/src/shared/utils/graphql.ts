import { Client, cacheExchange, fetchExchange, mapExchange } from '@urql/core';
import { navigate } from '$shared/utils/navigate';

function getToken(): string | null {
  if (typeof localStorage !== 'undefined') return localStorage.getItem('token');
  return null;
}

function getRefreshToken(): string | null {
  if (typeof localStorage !== 'undefined') return localStorage.getItem('refresh_token');
  return null;
}

// ponytail: 10s timeout — gak ada infinite hang
function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 10000);
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(id));
}

export const client = new Client({
  url: 'http://localhost:4000/graphql',
  fetch: fetchWithTimeout,
  exchanges: [
    cacheExchange,
    mapExchange({
      onError(error) {
        const msg = error.message ?? '';
        if (msg.includes('Unauthenticated') || msg.includes('UNAUTHENTICATED')) {
          const rt = getRefreshToken();
          if (rt) {
            import('$modules/auth/services/auth.service').then(async ({ refreshToken }) => {
              try {
                const r = await refreshToken(rt);
                localStorage.setItem('token', r.token);
                localStorage.setItem('refresh_token', r.refreshToken);
                window.location.reload();
              } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                navigate('/login');
              }
            });
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            navigate('/login');
          }
        }
      },
    }),
    fetchExchange,
  ],
  fetchOptions: () => ({
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
  }),
});
