import { updateUser, checkUserCount } from '../services/auth.service';
import { navigate } from '@shared/utils/navigate';
import type { StateData } from '@shared/types/state.types';
import { authStore } from './auth.stores';

// --- User state ---
const state = $state<StateData<{ userCount: number }>>({
  meta: { loading: false, message: '' },
  data: { userCount: -1 },
});

export const userStore = {
  state,

  actions: {
    async checkFirstUser() {
      try {
        const count = await checkUserCount();
        authStore.session.data.userCount = count;
        state.data.userCount = count;
      } catch { /* ignore */ }
      if (typeof window === 'undefined') return;
      const path = window.location.pathname;
      if (authStore.session.data.userCount === 0 && !path.startsWith('/register')) {
        navigate('/register');
      } else if (authStore.session.data.userCount > 0 && !authStore.session.data.token && !path.startsWith('/login') && !path.startsWith('/register')) {
        navigate('/login');
      }
    },

    async updateProfile(email: string, username: string) {
      if (!authStore.session.data.user) throw new Error('Not logged in');
      authStore.session.meta = { loading: true, message: '' };
      try {
        const u = await updateUser(authStore.session.data.user.id, email, username);
        authStore.session.data.user = { ...authStore.session.data.user, ...u };
        authStore.session.meta = { loading: false, message: '' };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal update profil';
        authStore.session.meta = { loading: false, message: msg };
        throw err;
      }
    },
  },
};