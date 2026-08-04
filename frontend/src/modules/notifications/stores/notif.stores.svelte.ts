import { fetchNotifications, markRead as markReadSvc, markAllRead as markAllReadSvc } from '../services/notif.service';
import type { Notification } from '@shared/types/notification';
import type { StateData } from '@shared/types/state.types';

const state = $state<StateData<{
  notifs: Notification[];
  total: number;
}>>({
  meta: { loading: false, message: '' },
  data: { notifs: [], total: 0 },
});

export const notifStore = {
  // --- State objects ---
  state,

  // --- Actions ---
  actions: {
    async fetch(page = 1, perPage = 20) {
      state.meta = { loading: true, message: '' };
      try {
        const r = await fetchNotifications(page, perPage);
        state.data.notifs = r.notifs;
        state.data.total = r.total;
        state.meta = { loading: false, message: '' };
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Gagal memuat notifikasi.';
        state.meta = { loading: false, message: msg };
        throw e;
      }
    },

    async markRead(id: string) {
      try {
        const ok = await markReadSvc(id);
        if (ok) {
          const idx = state.data.notifs.findIndex((n) => n.id === id);
          if (idx !== -1) state.data.notifs[idx] = { ...state.data.notifs[idx], status: 'read' };
        }
        return ok;
      } catch (e) {
        state.meta = { ...state.meta, message: 'Gagal tandai dibaca.' };
        throw e;
      }
    },

    async markAllRead() {
      try {
        const ok = await markAllReadSvc();
        if (ok) {
          state.data.notifs = state.data.notifs.map((n) => ({ ...n, status: 'read' }));
        }
        return ok;
      } catch (e) {
        state.meta = { ...state.meta, message: 'Gagal tandai semua dibaca.' };
        throw e;
      }
    },
  },
};