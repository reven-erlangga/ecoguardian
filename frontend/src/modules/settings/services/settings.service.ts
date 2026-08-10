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

export interface OAuth2TokenPayload {
  access_token: string;
  refresh_token: string;
  client_id: string;
  client_secret: string;
}

export async function saveOAuth2Token(payload: OAuth2TokenPayload): Promise<void> {
  const res = await fetch(`${TWITTER_SERVICE_URL}/settings/oauth2`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Failed to save OAuth2 token');
  }
}

export interface TokenTestResult {
  valid: boolean;
  username?: string;
  status?: number;
  detail?: string;
  error?: string;
}

export async function testOAuth2Token(): Promise<TokenTestResult> {
  const res = await fetch(`${TWITTER_SERVICE_URL}/settings/oauth2/test`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    return { valid: false, detail: err.error ?? res.statusText };
  }
  return res.json();
}
