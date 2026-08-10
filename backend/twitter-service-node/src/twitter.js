import { config } from './config.js';
import { getDb } from './mongo.js';

const SETTINGS_ID = 'twitter_oauth2';

// Token cache — diinisialisasi dari env, lalu diupdate dari DB & disimpan ke DB.
export const oauth2 = {
  accessToken: config.oauth2.accessToken,
  refreshToken: config.oauth2.refreshToken,
  clientId: config.oauth2.clientId,
  clientSecret: config.oauth2.clientSecret,
};

let lastRefresh = 0;

// ─── Persist token ke MongoDB (collection settings, _id twitter_oauth2) ───

export async function loadTokenFromDb() {
  try {
    const doc = await getDb().collection('settings').findOne({ _id: SETTINGS_ID });
    if (doc && doc.access_token && doc.refresh_token) {
      oauth2.accessToken = doc.access_token;
      oauth2.refreshToken = doc.refresh_token;
      if (doc.client_id) oauth2.clientId = doc.client_id;
      if (doc.client_secret) oauth2.clientSecret = doc.client_secret;
      console.log('📦 OAuth2 token dimuat dari MongoDB');
      return true;
    }
  } catch (e) {
    console.warn('⚠️ loadTokenFromDb:', e.message);
  }
  return false;
}

export async function saveTokenToDb() {
  try {
    await getDb().collection('settings').replaceOne(
      { _id: SETTINGS_ID },
      {
        _id: SETTINGS_ID,
        access_token: oauth2.accessToken,
        refresh_token: oauth2.refreshToken,
        client_id: oauth2.clientId,
        client_secret: oauth2.clientSecret,
        updated_at: Date.now(),
      },
      { upsert: true }
    );
    console.log('💾 OAuth2 token disimpan ke MongoDB');
  } catch (e) {
    console.warn('⚠️ saveTokenToDb:', e.message);
  }
}

// ─── Refresh ───

export async function refreshAccessToken() {
  const body = new URLSearchParams();
  body.append('grant_type', 'refresh_token');
  body.append('refresh_token', oauth2.refreshToken);
  body.append('client_id', oauth2.clientId);
  if (oauth2.clientSecret) body.append('client_secret', oauth2.clientSecret);

  const res = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`OAuth2 refresh failed: ${JSON.stringify(data)}`);
  oauth2.accessToken = data.access_token;
  if (data.refresh_token) oauth2.refreshToken = data.refresh_token;
  lastRefresh = Date.now();
  // Simpan token baru ke MongoDB (refresh token ganti tiap refresh)
  await saveTokenToDb();
  console.log('✅ OAuth2 token refreshed (disimpan ke DB)');
  return oauth2.accessToken;
}

export async function ensureFreshToken() {
  if (!oauth2.accessToken) throw new Error('No OAuth2 access token');
  // JANGAN refresh di startup/awal — biar refresh token (one-time use) tidak habis.
  // Cukup refresh saat request dapat 401/403 (lihat postReply / searchMentions).
  return oauth2.accessToken;
}

// ─── Post reply ───

export async function postReply(text, inReplyToTweetId) {
  let token = await ensureFreshToken();
  let attempts = 0;
  while (attempts < 2) {
    const res = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, reply: { in_reply_to_tweet_id: inReplyToTweetId } }),
    });
    const data = await res.json();
    if (res.status === 401 || res.status === 403) {
      attempts++;
      if (attempts >= 2) return { ok: false, error: JSON.stringify(data), status: res.status };
      console.warn(`⚠️ post_reply ${res.status}, refreshing token…`);
      try { token = await refreshAccessToken(); } catch (e) { return { ok: false, error: e.message }; }
      continue;
    }
    if (res.ok) return { ok: true, id: data.data?.id, status: res.status };
    return { ok: false, error: JSON.stringify(data), status: res.status };
  }
  return { ok: false, error: 'max attempts' };
}

export async function searchMentions(handle, rule) {
  const query = `@${handle.replace('@', '')} ${rule} -is:retweet`;
  const fields = 'tweet.fields=referenced_tweets,attachments,conversation_id,created_at';
  const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=20&${fields}`;
  let token = oauth2.accessToken;
  let res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  let data = await res.json();
  if (res.status === 401 || res.status === 403) {
    console.warn(`⚠️ search ${res.status}, refreshing token…`);
    try {
      token = await refreshAccessToken();
      res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      data = await res.json();
    } catch (e) {
      throw new Error(`search refresh failed: ${e.message}`);
    }
  }
  if (!res.ok) throw new Error(JSON.stringify(data));
  return (data.data || []).map((t) => {
    const replied = (t.referenced_tweets || []).find((r) => r.type === 'replied_to');
    return {
      id: t.id,
      text: t.text,
      inReplyTo: replied ? replied.id : null,
      conversationId: t.conversation_id || null,
      hasMedia: !!(t.attachments && t.attachments.media_keys && t.attachments.media_keys.length > 0),
    };
  });
}
