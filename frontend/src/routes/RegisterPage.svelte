<script lang="ts">
  import RegisterForm from '$modules/auth/parts/register-form/RegisterForm.svelte';
  let { navigate }: { navigate: (href: string) => void } = $props();
</script>

<h2 class="text-2xl font-heading mb-6">Buat Akun</h2>
<RegisterForm {navigate} />
