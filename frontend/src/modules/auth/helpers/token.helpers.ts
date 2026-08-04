// ponytail: token lifecycle — refresh timer, set/clear token + localStorage
import { refreshToken } from '../services/auth.service';
import { setLocal, parseToken } from './local-storage.helpers';
import type { StateData } from '@shared/types/state.types';
import type { User } from '@shared/types/user';

let _refreshTimer: ReturnType<typeof setTimeout> | null = null;

export function setToken(
  token: string | null,
  refresh: string | null,
  state: StateData<{ user: User | null; token: string | null; refreshToken: string | null; userCount: number }>,
) {
  state.data.token = token;
  state.data.refreshToken = refresh;
  setLocal('token', token);
  setLocal('refresh_token', refresh);
  if (_refreshTimer) clearTimeout(_refreshTimer);
  _refreshTimer = null;
  if (!token) return;
  const payload = parseToken(token);
  if (!payload?.exp) return;
  const ms = Math.max(0, payload.exp * 1000 - Date.now() - 5 * 60 * 1000);
  _refreshTimer = setTimeout(async () => {
    const rt = state.data.refreshToken;
    if (rt) {
      try {
        const r = await refreshToken(rt);
        setToken(r.token, r.refreshToken, state);
      } catch {
        clearSession(state);
      }
    }
  }, ms);
}

export function clearSession(
  state: StateData<{ user: User | null; token: string | null; refreshToken: string | null; userCount: number }>,
) {
  state.data.user = null;
  setToken(null, null, state);
}
