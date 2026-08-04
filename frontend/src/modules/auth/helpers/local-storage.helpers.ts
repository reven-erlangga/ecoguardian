// ponytail: localStorage helpers — SSR-safe, pure functions

export function getLocal(key: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(key);
}

export function setLocal(key: string, val: string | null) {
  if (typeof localStorage === 'undefined') return;
  if (val) localStorage.setItem(key, val);
  else localStorage.removeItem(key);
}

export function parseToken(token: string): { exp: number } | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}
