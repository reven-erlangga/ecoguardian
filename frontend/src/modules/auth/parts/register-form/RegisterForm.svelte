<script lang="ts">
  import { authStore } from '../../stores/auth.stores';
  import { navigate } from '@shared/utils/navigate';
  import Button from '@components/atoms/button/Button.svelte';
  import Input from '@components/atoms/input/Input.svelte';
  import Label from '@components/atoms/label/Label.svelte';
  import Alert from '@components/atoms/alert/Alert.svelte';
  import { validateAll } from './register-form.validations';
  import { formatRegisterError } from './register-form.formatter';

  let email = $state('');
  let username = $state('');
  let password = $state('');
  let error = $state('');
  let fieldErrors = $state<{ email?: string; username?: string; password?: string }>({});
  let loading = $state(false);
  let errorKey = $state(0);

  async function submit(e: Event) {
    e.preventDefault();
    const data = { email, username, password };
    const errs = validateAll(data);
    fieldErrors = errs;
    if (errs.email || errs.username || errs.password) return;

    loading = true;
    error = '';
    try {
      await authStore.actions.register(email, username, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      error = formatRegisterError(err);
      errorKey++;
    } finally {
      loading = false;
    }
  }
</script>

<form onsubmit={(e) => { e.preventDefault(); submit(e); return false; }} class="space-y-4">
  <div class="space-y-1">
    <Label for="reg-email">Email</Label>
    <Input type="email" bind:value={email} placeholder="email@example.com" error={fieldErrors.email} />
  </div>
  <div class="space-y-1">
    <Label for="reg-username">Username</Label>
    <Input type="text" bind:value={username} placeholder="username" error={fieldErrors.username} />
  </div>
  <div class="space-y-1">
    <Label for="reg-password">Password</Label>
    <Input type="password" bind:value={password} placeholder="••••••" error={fieldErrors.password} />
  </div>
  {#key errorKey}
    {#if error}
      <Alert
        variant="destructive"
        title="Gagal Daftar"
        description={error}
        duration={5000}
        onDismiss={() => error = ''}
      />
    {/if}
  {/key}
  <Button variant="destructive" type="submit" {loading} class="w-full bg-green-600 text-white hover:bg-green-700">
    {#if loading}Loading...{:else}Daftar{/if}
  </Button>
</form>
