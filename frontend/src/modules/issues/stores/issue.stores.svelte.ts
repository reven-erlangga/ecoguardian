import { listIssues, listClusters, resolveIssue, fetchStats } from '../services/issue.service';
import type { Issue, Cluster } from '../types';
import type { StateData } from '@shared/types/state.types';

// --- List state ---
const list = $state<StateData<{
  issues: Issue[];
  total: number;
  statusFilter: 'all' | 'open' | 'resolved';
  searchQuery: string;
  clusters: Cluster[];
}>>({
  meta: { loading: false, message: '' },
  data: {
    issues: [],
    total: 0,
    statusFilter: 'all',
    searchQuery: '',
    clusters: [],
  },
});

// --- Stats state ---
const stats = $state<StateData<{
  resolvedCount: number;
  openCount: number;
}>>({
  meta: { loading: false, message: '' },
  data: {
    resolvedCount: 0,
    openCount: 0,
  },
});

// --- Resolve state ---
const resolve = $state<StateData<null, { issueId: string; notes: string; imageHashes: string[] }>>({
  meta: { loading: false, message: '' },
  data: null,
  params: { issueId: '', notes: '', imageHashes: [] },
});

let _pollTimer: ReturnType<typeof setInterval> | null = null;

export const issueStore = {
  list,
  stats,
  resolve,

  actions: {
    async fetch(page = 1, perPage = 5) {
      list.meta = { loading: true, message: '' };
      try {
        const result = await listIssues(page, perPage, list.data.statusFilter, list.data.searchQuery || undefined);
        list.data.issues = result.issues;
        list.data.total = result.total;
        list.meta = { loading: false, message: '' };
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Gagal memuat data issue.';
        list.meta = { loading: false, message: msg };
        console.error('Failed to fetch issues', e);
      }
    },

    setStatusFilter(filter: 'all' | 'open' | 'resolved') {
      list.data.statusFilter = filter;
      issueStore.actions.fetch(1, 5);
    },

    setSearchQuery(q: string) {
      list.data.searchQuery = q;
      issueStore.actions.fetch(1, 5);
    },

    async fetchClusters() {
      list.meta = { loading: true, message: '' };
      try {
        list.data.clusters = await listClusters();
        list.meta = { loading: false, message: '' };
      } catch (e) {
        list.meta = { loading: false, message: 'Gagal memuat cluster.' };
        console.error('Failed to fetch clusters', e);
      }
    },

    async fetchStats() {
      stats.meta = { loading: true, message: '' };
      try {
        const result = await fetchStats();
        stats.data.resolvedCount = result.resolved;
        stats.data.openCount = result.open;
        stats.meta = { loading: false, message: '' };
      } catch (e) {
        stats.meta = { loading: false, message: 'Gagal memuat statistik.' };
        console.error('Failed to fetch stats', e);
      }
    },

    async resolve(id: string, notes: string, imageHashes: string[]) {
      resolve.meta = { loading: true, message: '' };
      resolve.params = { issueId: id, notes, imageHashes };
      try {
        const success = await resolveIssue(id, notes, imageHashes);
        if (success) {
          await issueStore.actions.fetch();
        }
        resolve.meta = { loading: false, message: '' };
        return success;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Gagal resolve issue.';
        resolve.meta = { loading: false, message: msg };
        console.error('Failed to resolve issue', e);
        throw e;
      }
    },

    startPolling(page = 1, perPage = 5) {
      issueStore.actions.stopPolling();
      _pollTimer = setInterval(() => issueStore.actions.fetch(page, perPage), 30_000);
    },

    stopPolling() {
      if (_pollTimer) clearInterval(_pollTimer);
      _pollTimer = null;
    },
  },
};