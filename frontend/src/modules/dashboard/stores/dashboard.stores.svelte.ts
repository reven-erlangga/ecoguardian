import { fetchDashboardStats } from '../services/dashboard.service';
import type { DashboardStats } from '../types';
import type { StateData } from '@shared/types/state.types';

const state = $state<StateData<{ stats: DashboardStats }>>({
  meta: { loading: false, message: '' },
  data: {
    stats: {
      totalTweets: 0,
      totalIssues: 0,
      openIssues: 0,
      resolvedIssues: 0,
      unreadNotifications: 0,
      blockchainBlocks: 0,
      blockchainVerified: false,
      issuesByType: {},
      recentTweets: [],
      recentIssues: [],
    },
  },
});

export const dashboardStore = {
  // --- State objects ---
  state,

  // --- Actions ---
  actions: {
    async fetch() {
      state.meta = { loading: true, message: '' };
      try {
        state.data.stats = await fetchDashboardStats();
        state.meta = { loading: false, message: '' };
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Gagal memuat dashboard.';
        state.meta = { loading: false, message: msg };
        throw e;
      }
    },
  },
};