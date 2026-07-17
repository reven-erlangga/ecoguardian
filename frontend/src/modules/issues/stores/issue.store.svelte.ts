import { listIssues, listClusters, resolveIssue } from '../services/issue.service';
import type { Issue, Cluster } from '../types';

let _issues = $state<Issue[]>([]);
let _total = $state(0);
let _clusters = $state<Cluster[]>([]);
let _loading = $state(false);
let _resolving = $state(false);

export const issueStore = {
  get issues() { return _issues; },
  get total() { return _total; },
  get clusters() { return _clusters; },
  get loading() { return _loading; },
  get resolving() { return _resolving; },

  async fetch(page = 1, perPage = 50) {
    _loading = true;
    try {
      const result = await listIssues(page, perPage);
      _issues = result.issues;
      _total = result.total;
    } catch (e) {
      console.error('Failed to fetch issues', e);
    } finally {
      _loading = false;
    }
  },

  async fetchClusters() {
    _loading = true;
    try {
      _clusters = await listClusters();
    } catch (e) {
      console.error('Failed to fetch clusters', e);
    } finally {
      _loading = false;
    }
  },

  async resolve(id: string, notes: string, imageHash: string) {
    _resolving = true;
    try {
      const success = await resolveIssue(id, notes, imageHash);
      if (success) {
        // Refetch to get updated data
        await this.fetch();
      }
    } catch (e) {
      console.error('Failed to resolve issue', e);
      throw e;
    } finally {
      _resolving = false;
    }
  },
};
