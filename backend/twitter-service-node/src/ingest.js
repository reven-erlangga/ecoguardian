import { getDb } from './mongo.js';
import { postReply } from './twitter.js';
import { publishTweetIngested } from './rabbitmq.js';
import {
  createClassificationClient, createNlpClient, createBlockchainClient, createAssetClient,
} from './clients.js';
import crypto from 'crypto';

// ─── Downstream clients (lazy) ────────────────────────────

let classifyClient = null;
let nlpClient = null;
let blockchainClient = null;
let assetClient = null;

function getClassify() {
  if (!classifyClient) classifyClient = createClassificationClient();
  return classifyClient;
}
function getNlp() {
  if (!nlpClient) nlpClient = createNlpClient();
  return nlpClient;
}
function getBlockchain() {
  if (!blockchainClient) blockchainClient = createBlockchainClient();
  return blockchainClient;
}
function getAsset() {
  if (!assetClient) assetClient = createAssetClient();
  return assetClient;
}

// ─── Repository helpers (TweetDoc schema, cocok dengan Rust) ───

export async function findTweetByTweetId(tweetId) {
  return getDb().collection('tweets').findOne({ tweet_id: tweetId });
}

export async function insertTweet(doc) {
  const res = await getDb().collection('tweets').insertOne({ ...doc, _id: doc.id || undefined });
  return doc.id || res.insertedId.toString();
}

export async function createIssue(issue) {
  await getDb().collection('issues').insertOne({ ...issue, _id: issue.id || undefined });
}

export async function findMentionProcessed(tweetId) {
  return getDb().collection('processed_mentions').findOne({ tweet_id: tweetId });
}

export async function markMentionProcessed(tweetId) {
  await getDb().collection('processed_mentions').insertOne({ tweet_id: tweetId, processed_at: Date.now() });
}

export async function findTweetByConversation(conversationId) {
  // Cari tweet utama dalam thread (yang bukan reply / root mention)
  return getDb().collection('tweets').findOne({ conversation_id: conversationId, parent_tweet_id: null });
}

// ─── Validation ───────────────────────────────────────────

export function validateTweet(mediaUrls, hasLocation) {
  const missing = [];
  if (!mediaUrls || mediaUrls.length === 0) missing.push('media');
  if (!hasLocation) missing.push('location');
  return missing;
}

function fallbackReply(field) {
  if (field === 'media') return 'Mohon sertakan gambar untuk membantu klasifikasi.';
  if (field === 'location') return 'Mohon sertakan lokasi spesifik (alamat/koordinat).';
  return `Data '${field}' diperlukan.`;
}

// Deteksi lokasi sederhana dari teks (pola lokasi Indonesia)
export function detectLocation(text = '') {
  const s = text.toLowerCase();
  const patterns = [
    /di\s+([a-z0-9 .-]{3,})/,
    /daerah\s+([a-z0-9 .-]{3,})/,
    /dekat\s+([a-z0-9 .-]{3,})/,
    /jalan\s+([a-z0-9 .-]{3,})/,
    /jl\.?\s+([a-z0-9 .-]{3,})/,
    /kecamatan\s+([a-z0-9 .-]{3,})/,
    /kelurahan\s+([a-z0-9 .-]{3,})/,
    /kota\s+([a-z0-9 .-]{3,})/,
  ];
  return patterns.some((p) => p.test(s));
}

export function generateReplyMessage(missingFields) {
  return missingFields.map(fallbackReply).join(' ');
}

// Generate natural reply via NLP (fallback ke pesan statis bila NLP down)
export async function generateReplyMessages({ tweetText, missingFields, label, confidence }) {
  try {
    const msg = await getNlp().generateReply(tweetText, missingFields, label, confidence);
    if (msg) return msg;
  } catch (e) {
    console.warn(`⚠️ NLP GenerateReply failed: ${e.message}, using fallback`);
  }
  return generateReplyMessage(missingFields);
}

// ─── Geocode via NLP (fallback ke heuristik) ──────────────

async function geocodeAddress(address) {
  try {
    const geo = await getNlp().geocode(address);
    return { address, lat: geo.lat, lon: geo.lon, display_name: geo.displayName };
  } catch (e) {
    console.warn(`⚠️ Geocode failed for "${address}": ${e.message}`);
    return null;
  }
}

// ─── Classify media: download → upload asset → classify ──

async function guessFormat(url) {
  const ext = (url.split('.').pop() || 'jpg').toLowerCase();
  if (ext === 'png') return 'png';
  if (ext === 'gif') return 'gif';
  if (ext === 'webp' || ext === 'avif') return 'webp';
  return 'jpeg';
}

async function classifyMedia(mediaUrls) {
  if (!mediaUrls || mediaUrls.length === 0) throw new Error('media_urls is empty');

  const downloaded = [];
  const assetUrls = [];

  for (const url of mediaUrls) {
    const resp = await fetch(url);
    const buf = Buffer.from(await resp.arrayBuffer());
    const fmt = await guessFormat(url);

    // Upload ke asset service; fallback ke content-hash URL pada kegagalan
    let assetUrl = '';
    try {
      assetUrl = await getAsset().upload(buf, 'twitter-image.jpg', fmt);
    } catch (e) {
      console.warn(`⚠️ Asset upload failed: ${e.message}, using hash fallback`);
    }
    if (!assetUrl) {
      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      assetUrl = `hash:${hash}`;
    }

    downloaded.push({ image_data: buf, image_format: fmt });
    assetUrls.push(assetUrl);
  }

  // Kirim SEMUA gambar sekaligus untuk multi-image classification (majority vote)
  const result = await getClassify().classifyImages(downloaded);

  return {
    label: result.label,
    confidence: result.confidence,
    candidates: result.candidates || [],
    assetUrl: assetUrls[0] || '',
  };
}

// ─── Issue creation ───────────────────────────────────────

async function createIssueFromText(tweetId, textClass, location, paraphrased) {
  // Hanya buat issue bila confidence cukup
  if (textClass.confidence < 0.5) return;

  const issue = {
    id: crypto.randomUUID(),
    tweet_id: tweetId,
    type: textClass.label,
    confidence: textClass.confidence,
    status: 'open',
    location: location ? { lat: location.lat, lon: location.lon, address: location.address } : null,
    paraphrased_text: paraphrased,
    resolution: null,
    image_hashes: [],
    created_at: Math.floor(Date.now() / 1000),
    resolved_at: null,
  };
  try {
    await createIssue(issue);
  } catch (e) {
    console.warn(`⚠️ Failed to create issue from text for ${tweetId}: ${e.message}`);
  }
}

async function createIssueFromImage(tweetId, result, location, paraphrased) {
  const issue = {
    id: crypto.randomUUID(),
    tweet_id: tweetId,
    type: result.label,
    confidence: result.confidence,
    status: 'open',
    location: location ? { lat: location.lat, lon: location.lon, address: location.address } : null,
    paraphrased_text: paraphrased,
    resolution: null,
    image_hashes: result.assetUrl ? [result.assetUrl] : [],
    created_at: Math.floor(Date.now() / 1000),
    resolved_at: null,
  };
  try {
    await createIssue(issue);
  } catch (e) {
    console.warn(`⚠️ Failed to create issue for tweet ${tweetId}: ${e.message}`);
  }
}

// ─── Blockchain recording ─────────────────────────────────

async function recordOnBlockchain(tweetId, result, location) {
  try {
    await getBlockchain().recordClassification({
      tweetId,
      label: result.label,
      confidence: result.confidence,
      imageUrl: result.assetUrl,
      lat: location?.lat || 0,
      lon: location?.lon || 0,
      address: location?.address || '',
    });
  } catch (e) {
    console.warn(`⚠️ Blockchain recording failed for tweet ${tweetId}: ${e.message}`);
  }
}

// ─── Classify + update (async) ───────────────────────────

async function classifyAndUpdate(id, tweetId, mediaUrls, textClass, location, paraphrased) {
  const result = await classifyMedia(mediaUrls);

  const classification = {
    text: textClass,
    image: { label: result.label, confidence: result.confidence },
  };
  await getDb().collection('tweets').updateOne(
    { _id: id },
    { $set: { classification } }
  );

  await recordOnBlockchain(tweetId, result, location);
  await createIssueFromImage(tweetId, result, location, paraphrased);
}

// ─── Merge data dari parent tweet (reply chain) ──────────

async function mergeParentData(parentTweetId, mediaUrls, location) {
  if (!parentTweetId) return { mediaUrls, location };
  const parent = await findTweetByTweetId(parentTweetId).catch(() => null);
  if (!parent) return { mediaUrls, location };

  // Warisi media dari parent bila child kosong
  let m = mediaUrls;
  let loc = location;
  if (m.length === 0 && parent.media_urls && parent.media_urls.length > 0) m = parent.media_urls;
  if (!loc && parent.location) loc = parent.location;
  return { mediaUrls: m, location: loc };
}

// ─── Ingest tweet: full pipeline (mirror Rust ingest/service.rs) ───

export async function ingestTweet({ tweetId, text, author, authorUsername, mediaUrls = [], metadata = {}, parentTweetId = '', conversationId = null }) {
  const now = new Date();

  // Handle parent-child chain
  const { mediaUrls: mergedMedia, location: inheritedLoc } = await mergeParentData(parentTweetId, mediaUrls, null);
  let media = mergedMedia;
  let location = inheritedLoc;

  // Step 1: NLP AnalyzeText
  let textClass = { label: '', confidence: 0 };
  let extractedAddress = '';
  let paraphrasedText = text;
  try {
    const r = await getNlp().analyzeText(text);
    textClass = { label: r.label, confidence: r.confidence };
    extractedAddress = r.extractedAddress;
    if (r.paraphrasedText) paraphrasedText = r.paraphrasedText;
  } catch (e) {
    console.warn(`⚠️ NLP AnalyzeText failed: ${e.message}`);
  }

  // Step 2: Geocode jika ada alamat ter-ekstrak
  if (!location && extractedAddress) {
    location = await geocodeAddress(extractedAddress);
  }

  // Fallback lokasi via heuristik teks (jaga kompatibilitas)
  if (!location && detectLocation(text)) {
    location = null; // hanya flag, tanpa koordinat
  }

  // Validation
  const missingFields = validateTweet(media, !!location);
  const hasImages = media.length > 0;
  const hasLocation = !!location;
  const validationStatus = missingFields.length === 0 ? ['ok'] : missingFields.map((f) => `needs_${f}`);

  // Generate reply via NLP (best-effort)
  const validation = missingFields.length === 0
    ? []
    : [{
        field: missingFields.join(','),
        message: await generateReplyMessages({
          tweetText: text, missingFields, label: textClass.label, confidence: textClass.confidence,
        }),
        severity: missingFields.includes('media') ? 'error' : 'warning',
      }];

  // Post auto-reply (jika kurang lokasi/gambar)
  if (validation.length > 0) {
    const replyText = validation.map((v) => v.message).join(' ');
    const result = await postReply(replyText, tweetId);
    if (result.ok) console.log(`✅ Auto-reply posted to ${tweetId}: ${result.id}`);
    else console.warn(`⚠️ Auto-reply failed for ${tweetId}: ${result.error}`);
  } else {
    // Lengkap dari awal
    const thanks = 'Terima kasih! Laporan kamu lengkap (gambar + lokasi). Kami akan segera memproses. 🙏';
    const result = await postReply(thanks, tweetId);
    if (result.ok) console.log(`✅ Ucapan terima kasih terkirim ke ${tweetId}: ${result.id}`);
    else console.warn(`⚠️ Ucapan terima kasih gagal untuk ${tweetId}: ${result.error}`);
  }

  const doc = {
    id: crypto.randomUUID(),
    tweet_id: tweetId,
    paraphrased_text: paraphrasedText,
    text: text,
    author: author || '',
    author_username: authorUsername || '',
    media_urls: media,
    location,
    classification: null,
    created_at: now,
    metadata: metadata || {},
    parent_tweet_id: parentTweetId || null,
    conversation_id: conversationId || tweetId,
    has_images: hasImages,
    has_location: hasLocation,
    validation_status: validationStatus,
  };

  const id = await insertTweet(doc);

  // Create issue dari NLP text classification (always)
  await createIssueFromText(tweetId, textClass, location, paraphrasedText);

  // Step 3: Jika tweet punya media, klasifikasi gambar async.
  // Watcher memakai placeholder '__media__' (tanpa URL nyata) — lewati klasifikasi.
  const realMedia = media.filter((u) => u.startsWith('http'));
  if (realMedia.length > 0) {
    const textClassClone = textClass;
    const locClone = location;
    const paraphClone = paraphrasedText;
    setTimeout(() => {
      classifyAndUpdate(id, tweetId, realMedia, textClassClone, locClone, paraphClone)
        .catch((e) => console.warn(`⚠️ Image classification failed for tweet ${id}: ${e.message}`));
    }, 0);
  }

  // Step 4: Publish event (best-effort)
  await publishTweetIngested({ id, tweet_id: tweetId });

  return { id, validation };
}

// ─── Proses reply/update ke tweet yang sudah ada ──────────
// Ketika ada reply dengan media/lokasi ke thread yang pending, update status tweet utama.
export async function processReplyUpdate({ tweetId, text, inReplyTo, conversationId, hasMedia }) {
  // Cari tweet utama thread
  let root = await findTweetByConversation(conversationId);
  if (!root && inReplyTo) {
    root = await findTweetByTweetId(inReplyTo);
  }
  if (!root) return { handled: false };

  const updated = { ...root };
  if (hasMedia) {
    updated.has_images = true;
    await getDb().collection('tweets').updateOne(
      { tweet_id: root.tweet_id },
      { $set: { has_images: true, media_urls: updated.media_urls || [] } }
    );
  }
  if (detectLocation(text)) {
    updated.has_location = true;
    await getDb().collection('tweets').updateOne(
      { tweet_id: root.tweet_id },
      { $set: { has_location: true } }
    );
  }
  await revalidateAndReply(updated, root.tweet_id);
  await markMentionProcessed(tweetId); // jangan proses reply ini berulang
  return { handled: true, rootTweetId: root.tweet_id };
}

// Update status validasi tweet: cek ulang missing (media/lokasi)
async function revalidateAndReply(tweetDoc, tweetId) {
  const hasMedia = tweetDoc.has_images;
  const hasLocation = tweetDoc.has_location;
  const missing = validateTweet(hasMedia ? ['x'] : [], hasLocation);
  if (missing.length === 0) {
    await getDb().collection('tweets').updateOne(
      { tweet_id: tweetId },
      { $set: { validation_status: ['ok'], has_images: hasMedia, has_location: hasLocation } }
    );
    console.log(`✅ Tweet ${tweetId} valid (media+location lengkap)`);
    const thanks = 'Terima kasih! Laporan kamu lengkap (gambar + lokasi). Kami akan segera memproses. 🙏';
    const result = await postReply(thanks, tweetId);
    if (result.ok) console.log(`✅ Ucapan terima kasih terkirim ke ${tweetId}: ${result.id}`);
    else console.warn(`⚠️ Ucapan terima kasih gagal untuk ${tweetId}: ${result.error}`);
    return;
  }
  const msg = generateReplyMessage(missing);
  await getDb().collection('tweets').updateOne(
    { tweet_id: tweetId },
    { $set: { validation_status: missing.map((f) => `needs_${f}`), has_images: hasMedia, has_location: hasLocation } }
  );
  const result = await postReply(msg, tweetId);
  if (result.ok) console.log(`✅ Auto-reply (update) to ${tweetId}: ${result.id}`);
  else console.warn(`⚠️ Auto-reply (update) failed for ${tweetId}: ${result.error}`);
}
