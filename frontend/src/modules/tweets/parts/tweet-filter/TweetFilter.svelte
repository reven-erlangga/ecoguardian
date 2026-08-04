<script lang="ts">
  import { LABELS } from '@shared/constants';
  import { applyTweetFilter } from './tweet-filter.components';
  import {
    containerClass, rowClass, fieldClass, fieldLabelClass,
    inputClass, selectClass, buttonGroupClass, applyButtonClass, resetButtonClass,
  } from './tweet-filter.components';

  let keyword = $state('');
  let classificationLabel = $state('');
  let author = $state('');
  const labels = LABELS;

  function apply() {
    applyTweetFilter({ keyword, classificationLabel, author });
  }

  function reset() {
    keyword = '';
    classificationLabel = '';
    author = '';
    apply();
  }
</script>

<div class={containerClass}>
  <div class={rowClass}>
    <div class={fieldClass}>
      <label for="filter-keyword" class={fieldLabelClass}>Kata Kunci</label>
      <input id="filter-keyword" type="text" bind:value={keyword} placeholder="Cari tweet..." class={inputClass} />
    </div>
    <div class="w-[180px]">
      <label for="filter-label" class={fieldLabelClass}>Klasifikasi</label>
      <select id="filter-label" bind:value={classificationLabel} class={selectClass}>
        <option value="">Semua</option>
        {#each labels as l}
          <option value={l.value}>{l.label}</option>
        {/each}
      </select>
    </div>
    <div class="flex-1 min-w-[150px]">
      <label for="filter-author" class={fieldLabelClass}>Penulis</label>
      <input id="filter-author" type="text" bind:value={author} placeholder="Username..." class={inputClass} />
    </div>
    <div class={buttonGroupClass}>
      <button onclick={apply} class={applyButtonClass}>🔍 Filter</button>
      <button onclick={reset} class={resetButtonClass}>✕ Reset</button>
    </div>
  </div>
</div>