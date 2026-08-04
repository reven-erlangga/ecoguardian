import { login as loginApi, register as registerApi, refreshToken, logout as logoutApi, validateToken } from '../services/auth.service';
import { navigate } from '@shared/utils/navigate';
import type { User } from '@shared/types/user';
import type { StateData } from '@shared/types/state.types';
import { getLocal } from '../helpers/local-storage.helpers';
import { setToken, clearSession } from '../helpers/token.helpers';

// --- Session state ---
const state = $state<StateData<{
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  userCount: number;
}>>({
  meta: { loading: false, message: '' },
  data: {
    user: null,
    token: getLocal('token'),
    refreshToken: getLocal('refresh_token'),
    userCount: -1,
  },
});

// --- Login form state ---
const loginForm = $state<StateData<null, { email: string; password: string }>>({
  meta: { loading: false, message: '' },
  data: null,
  params: { email: '', password: '' },
});

// --- Register form state ---
const registerForm = $state<StateData<null, { email: string; username: string; password: string }>>({
  meta: { loading: false, message: '' },
  data: null,
  params: { email: '', username: '', password: '' },
});

export const authStore = {
  // --- State objects ---
  session: state,
  login: loginForm,
  register: registerForm,

  // --- Actions ---
  actions: {
    async login(email: string, password: string) {
      loginForm.meta = { loading: true, message: '' };
      loginForm.params = { email, password };
      try {
        const d = await loginApi(email, password);
        state.data.user = d.user;
        setToken(d.token, d.refreshToken, state);
        loginForm.meta = { loading: false, message: '' };
        return d;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan.';
        loginForm.meta = { loading: false, message: msg };
        throw err;
      }
    },

    async register(email: string, username: string, password: string) {
      registerForm.meta = { loading: true, message: '' };
      registerForm.params = { email, username, password };
      try {
        const d = await registerApi(email, username, password);
        state.data.user = d.user;
        setToken(d.token, d.refreshToken, state);
        registerForm.meta = { loading: false, message: '' };
        return d;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan.';
        registerForm.meta = { loading: false, message: msg };
        throw err;
      }
    },

    async rehydrate() {
      state.meta = { loading: true, message: '' };
      const tok = getLocal('token');
      state.data.token = tok;
      const rt = getLocal('refresh_token');
      state.data.refreshToken = rt;
      if (!tok) { state.meta = { loading: false, message: '' }; return; }
      try {
        const v = await validateToken(tok);
        state.data.user = {
          id: v.userId,
          email: v.email,
          username: v.username,
          role: v.role,
          createdAt: { seconds: 0 },
        };
      } catch {
        if (rt) {
          try {
            const r = await refreshToken(rt);
            setToken(r.token, r.refreshToken, state);
            const v = await validateToken(r.token);
            state.data.user = {
              id: v.userId,
              email: v.email,
              username: v.username,
              role: v.role,
              createdAt: { seconds: 0 },
            };
            state.meta = { loading: false, message: '' };
            return;
          } catch { /* fall through */ }
        }
        clearSession(state);
      }
      state.meta = { loading: false, message: '' };
    },

    async logout() {
      if (state.data.refreshToken) {
        try { await logoutApi(state.data.refreshToken); } catch { /* ignore */ }
      }
      clearSession(state);
      navigate('/login');
    },
  },
};