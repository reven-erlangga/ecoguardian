<script lang="ts">
  import BlockchainView from '$modules/blockchain/parts/blockchain-page/BlockchainPage.svelte';
  let { navigate: _navigate }: { navigate: (href: string) => void } = $props();
</script>

<BlockchainView />
