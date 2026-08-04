<script lang="ts">
  import LoginForm from '$modules/auth/parts/login-form/LoginForm.svelte';
  let { navigate }: { navigate: (href: string) => void } = $props();
</script>

<h2 class="text-2xl font-heading mb-6">Masuk</h2>
<LoginForm {navigate} />
