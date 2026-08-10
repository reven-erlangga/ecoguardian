import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { ingestTweet } from './ingest.js';
import { oauth2, saveTokenToDb } from './twitter.js';
import { createClassificationClient } from './clients.js';

async function guessFormat(url) {
  const ext = (url.split('.').pop() || 'jpg').toLowerCase();
  if (ext === 'png') return 'png';
  if (ext === 'gif') return 'gif';
  if (ext === 'webp' || ext === 'avif') return 'webp';
  return 'jpeg';
}

export function startHttp(port) {
  const app = new Hono();

  // CORS — biar frontend (localhost:4321) bisa panggil API ini
  app.use('*', cors());

  app.get('/health', (c) => c.json({ status: 'ok' }));

  app.post('/ingest', async (c) => {
    try {
      const body = await c.req.json();
      const { id, validation } = await ingestTweet({
        tweetId: body.tweet_id,
        text: body.text,
        author: body.author,
        authorUsername: body.author_username,
        mediaUrls: body.media_urls || [],
        metadata: body.metadata || {},
        parentTweetId: body.parent_tweet_id || '',
      });
      return c.json({ id, tweet_id: body.tweet_id, status: 'ingested', validation });
    } catch (e) {
      return c.json({ error: String(e.message || e) }, 500);
    }
  });

  // Classify satu gambar dari URL (mirror Rust /trigger-classify)
  app.post('/trigger-classify', async (c) => {
    try {
      const body = await c.req.json();
      const imageUrl = (body.media_urls || [])[0];
      if (!imageUrl) return c.json({ error: 'media_urls is empty — provide at least one image URL' }, 400);

      const resp = await fetch(imageUrl);
      const buf = Buffer.from(await resp.arrayBuffer());
      const fmt = await guessFormat(imageUrl);

      const client = createClassificationClient();
      const result = await client.classifyImages([{ image_data: buf, image_format: fmt }]);
      return c.json({
        label: result.label,
        confidence: result.confidence,
        candidates: result.candidates || [],
        tweet_id: body.tweet_id || '',
      });
    } catch (e) {
      return c.json({ error: String(e.message || e) }, 500);
    }
  });

  // Simpan/cek kredensial (OAuth1) — kini dikonfigurasi via env var
  app.get('/settings/twitter', (c) => {
    const apiKey = process.env.TWITTER_CONSUMER_KEY;
    const apiSecret = process.env.TWITTER_CONSUMER_SECRET;
    return c.json({ configured: !!(apiKey && apiSecret) });
  });

  app.post('/settings/twitter', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const apiKey = process.env.TWITTER_CONSUMER_KEY;
    const apiSecret = process.env.TWITTER_CONSUMER_SECRET;
    if (body.api_key !== (apiKey || '') || body.api_secret !== (apiSecret || '')) {
      return c.json({
        error: 'Kredensial Twitter tidak lagi disimpan via UI. Set TWITTER_CONSUMER_KEY dan TWITTER_CONSUMER_SECRET di environment service, lalu restart.',
      }, 400);
    }
    return c.json({ status: 'configured-via-env' });
  });

  // Endpoint untuk seed/update token OAuth2 ke DB (dipanggil manual sekali)
  app.post('/settings/oauth2', async (c) => {
    try {
      const body = await c.req.json();
      if (body.access_token) oauth2.accessToken = body.access_token;
      if (body.refresh_token) oauth2.refreshToken = body.refresh_token;
      if (body.client_id) oauth2.clientId = body.client_id;
      if (body.client_secret) oauth2.clientSecret = body.client_secret;
      await saveTokenToDb();
      return c.json({ ok: true });
    } catch (e) {
      return c.json({ error: String(e.message || e) }, 500);
    }
  });

  // Test apakah access token masih valid (users/me)
  app.get('/settings/oauth2/test', async (c) => {
    try {
      const res = await fetch('https://api.twitter.com/2/users/me', {
        headers: { Authorization: `Bearer ${oauth2.accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        return c.json({ valid: true, username: data.data?.username || 'ok', status: res.status });
      }
      return c.json({ valid: false, status: res.status, detail: (await res.json()).detail || 'invalid' });
    } catch (e) {
      return c.json({ valid: false, error: String(e.message || e) }, 500);
    }
  });

  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`✅ HTTP (Hono) listening on ${info.port}`);
  });
}
