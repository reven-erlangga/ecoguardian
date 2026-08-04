<script lang="ts">
  import NotifPanel from '$modules/notifications/parts/notif-panel/NotifPanel.svelte';
  let { navigate }: { navigate: (href: string) => void } = $props();
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-heading">Notifikasi</h1>
    <p class="text-muted-foreground">Pemberitahuan dan peringatan lingkungan</p>
  </div>
  <NotifPanel />
</div>
