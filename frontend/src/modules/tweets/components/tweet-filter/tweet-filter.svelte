<script lang="ts">
  import { LABELS } from '@shared/constants';

  let keyword = $state('');
  let classificationLabel = $state('');
  let author = $state('');
  const labels = LABELS;

  function apply() {
    // Dispatch custom event or use callback
    window.location.href = `/tweets?keyword=${encodeURIComponent(keyword)}&label=${classificationLabel}&author=${encodeURIComponent(author)}`;
  }

  function reset() {
    keyword = '';
    classificationLabel = '';
    author = '';
    window.location.href = '/tweets';
  }
</script>

<div class="neo-border bg-white neo-shadow p-4">
  <div class="flex flex-wrap gap-3">
    <div class="flex-1 min-w-[200px]">
      <label for="filter-keyword" class="block text-xs font-bold text-gray-600 mb-1">Kata Kunci</label>
      <input id="filter-keyword" type="text" bind:value={keyword} placeholder="Cari tweet..."
        class="neo-border w-full bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
    <div class="w-[180px]">
      <label for="filter-label" class="block text-xs font-bold text-gray-600 mb-1">Klasifikasi</label>
      <select id="filter-label" bind:value={classificationLabel}
        class="neo-border w-full bg-white px-3 py-2 text-sm focus:outline-none">
        <option value="">Semua</option>
        {#each labels as l}
          <option value={l.value}>{l.label}</option>
        {/each}
      </select>
    </div>
    <div class="flex-1 min-w-[150px]">
      <label for="filter-author" class="block text-xs font-bold text-gray-600 mb-1">Penulis</label>
      <input id="filter-author" type="text" bind:value={author} placeholder="Username..."
        class="neo-border w-full bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
    <div class="flex items-end gap-2">
      <button onclick={apply}
        class="neo-border neo-shadow bg-blue-600 text-white px-4 py-2 font-bold text-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
        🔍 Filter
      </button>
      <button onclick={reset}
        class="neo-border bg-white text-black px-4 py-2 font-bold text-sm hover:bg-gray-100 transition-all">
        ✕ Reset
      </button>
    </div>
  </div>
</div>
