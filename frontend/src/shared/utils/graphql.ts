import { Client, cacheExchange, fetchExchange } from '@urql/core';

function getToken(): string | null {
  if (typeof localStorage !== 'undefined') return localStorage.getItem('token');
  return null;
}

export const client = new Client({
  url: 'http://localhost:4000/graphql',
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => ({
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
  }),
});
