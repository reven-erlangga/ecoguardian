import { ISSUE_SETUP_URL, CLASSIFICATION_SETUP_URL } from '$shared/constants';

export interface ClusteringSettings {
  eps_km: number;
  min_pts: number;
  source?: string;
  updated_at?: number;
}

export interface RetrainSample {
  label: string;
  url: string;
}

export interface RetrainStatus {
  status: 'idle' | 'running' | 'done' | 'error';
  started_at?: number | null;
  finished_at?: number | null;
  error?: string | null;
  samples_downloaded?: number;
  total_images?: number;
  epochs?: number;
  batch_size?: number;
  accuracy?: number | null;
}

export interface DatasetStats {
  labels: Record<string, number>;
  total: number;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

// ─── Clustering settings (issue-service) ─────────────────

export function getClusteringSettings(): Promise<ClusteringSettings> {
  return request<ClusteringSettings>(`${ISSUE_SETUP_URL}/setup/clustering`);
}

export function saveClusteringSettings(s: ClusteringSettings): Promise<ClusteringSettings> {
  return request<ClusteringSettings>(`${ISSUE_SETUP_URL}/setup/clustering`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eps_km: s.eps_km, min_pts: s.min_pts }),
  });
}

// ─── Retrain model (classification-service) ──────────────

export function startRetrain(
  epochs: number,
  batchSize: number,
  samples: RetrainSample[],
): Promise<{ status: string; error?: string }> {
  return request<{ status: string; error?: string }>(
    `${CLASSIFICATION_SETUP_URL}/setup/retrain`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ epochs, batch_size: batchSize, samples }),
    },
  );
}

export function getRetrainStatus(): Promise<RetrainStatus> {
  return request<RetrainStatus>(`${CLASSIFICATION_SETUP_URL}/setup/retrain/status`);
}

export function getDatasetStats(): Promise<DatasetStats> {
  return request<DatasetStats>(`${CLASSIFICATION_SETUP_URL}/setup/dataset/stats`);
}
