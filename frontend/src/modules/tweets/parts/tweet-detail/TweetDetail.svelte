<script lang="ts">
  import { useTweetDetail } from './tweet-detail.components';
  import { LABELS } from '@shared/constants';
  import { formatDateTime } from '@shared/utils/format';
  import Progress from '@components/atoms/progress/Progress.svelte';
  import {
    cardClass, headerClass, authorClass, usernameClass, dateClass,
    contentClass, mediaClass, mediaImgClass, sectionClass, sectionTitleClass,
    badgeClass, locationClass, linkClass, loadingClass, errorClass,
    labelBadgeColor,
  } from './tweet-detail.components';

  let { tweetId }: { tweetId: string } = $props();
  const { tweet, loading } = useTweetDetail(tweetId);
</script>

{#if loading}
  <p class={loadingClass}>Memuat detail tweet...</p>
{:else if !tweet}
  <p class={errorClass}>Tweet tidak ditemukan.</p>
{:else}
  <div class={cardClass}>
    <div class={headerClass}>
      <div>
        <span class={authorClass}>{tweet.authorUsername}</span>
                <span class={usernameClass}>@{tweet.author}</span>
              </div>
              <span class={dateClass}>
                {formatDateTime(tweet.createdAt.seconds)}
              </span>
    </div>

    <p class={contentClass}>{tweet.paraphrasedText || tweet.text}</p>

        {#if tweet.mediaUrls && tweet.mediaUrls.length > 0}
          <div class={mediaClass}>
            {#each tweet.mediaUrls as url}
          <img src={url} alt="Media tweet" class={mediaImgClass} />
        {/each}
      </div>
    {/if}

    {#if tweet.classification}
      <div class={sectionClass}>
        <h4 class={sectionTitleClass}>Klasifikasi</h4>
        <div class={mediaClass}>
          <Progress value={Math.round(tweet.classification.text.confidence * 100)} />
          {#if tweet.classification.image.label}
            <span class="{badgeClass} {labelBadgeColor(tweet.classification.image.label, LABELS)}">
              Gambar: {tweet.classification.image.label}
            </span>
          {/if}
        </div>
      </div>
    {/if}

    {#if tweet.location}
      <div class={sectionClass}>
        <h4 class={sectionTitleClass}>Lokasi</h4>
        <p class={locationClass}>{tweet.location.address}</p>
        <p class={locationClass}>{tweet.location.lat}, {tweet.location.lon}</p>
      </div>
    {/if}

    <div class={sectionClass}>
      <a
        href="https://twitter.com/{tweet.authorUsername}/status/{tweet.tweetId}"
        target="_blank"
        rel="noopener noreferrer"
        class={linkClass}
      >
        Lihat di Twitter →
      </a>
    </div>
  </div>
{/if}