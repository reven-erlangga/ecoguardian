import { TWITTER_SERVICE_URL } from '$shared/constants';

export interface TwitterCredentials {
  api_key: string;
  api_secret: string;
  bearer_token?: string;
}

export interface CredentialsStatus {
  configured: boolean;
}

export async function saveTwitterCredentials(creds: TwitterCredentials): Promise<void> {
  const res = await fetch(`${TWITTER_SERVICE_URL}/settings/twitter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(creds),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Failed to save credentials');
  }
}

export async function getTwitterCredentialsStatus(): Promise<CredentialsStatus> {
  const res = await fetch(`${TWITTER_SERVICE_URL}/settings/twitter`);
  if (!res.ok) return { configured: false };
  return res.json();
}
