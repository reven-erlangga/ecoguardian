import { searchMentions } from './twitter.js';
import {
  ingestTweet, processReplyUpdate, findMentionProcessed, markMentionProcessed,
} from './ingest.js';
import { config } from './config.js';

export function startWatcher() {
  console.log(`🔁 Twitter watcher aktif: @${config.handle} ${config.mentionRule}`);
  const interval = setInterval(async () => {
    try {
      const mentions = await searchMentions(config.handle, config.mentionRule);
      let processed = 0;
      for (const m of mentions) {
        if (await findMentionProcessed(m.id)) continue;

        if (m.inReplyTo) {
          // Ini reply ke thread yang sudah ada — proses sebagai update (media/lokasi).
          const { handled } = await processReplyUpdate({
            tweetId: m.id,
            text: m.text,
            inReplyTo: m.inReplyTo,
            conversationId: m.conversationId,
            hasMedia: m.hasMedia,
          });
          if (handled) { processed++; continue; }
        }

        // Mention baru (root thread)
        await ingestTweet({
          tweetId: m.id,
          text: m.text,
          author: '',
          authorUsername: '',
          mediaUrls: m.hasMedia ? ['__media__'] : [],
          parentTweetId: '',
          conversationId: m.conversationId || m.id,
        });
        await markMentionProcessed(m.id);
        processed++;
      }
      if (processed > 0) console.log(`🔁 Watcher: ${processed} tweet/reply diproses`);
    } catch (e) {
      console.warn(`⚠️ Watcher error: ${e.message || e}`);
    }
  }, 30 * 1000);
  return interval;
}
