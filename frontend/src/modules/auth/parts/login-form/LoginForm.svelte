<script lang="ts">
  import { authStore } from '../../stores/auth.stores';
  import { navigate } from '@shared/utils/navigate';
  import Button from '@components/atoms/button/Button.svelte';
  import Input from '@components/atoms/input/Input.svelte';
  import Label from '@components/atoms/label/Label.svelte';
  import Alert from '@components/atoms/alert/Alert.svelte';
  import { validateAll } from './login-form.validations';
  import { formatLoginError } from './login-form.formatter';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let fieldErrors = $state<{ email?: string; password?: string }>({});
  let loading = $state(false);
  let errorKey = $state(0);

  async function submit(e: Event) {
    e.preventDefault();
    const data = { email, password };
    const errs = validateAll(data);
    fieldErrors = errs;
    if (errs.email || errs.password) return;

    loading = true;
    error = '';
    try {
      await authStore.actions.login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      error = formatLoginError(err);
      errorKey++;
    } finally {
      loading = false;
    }
  }
</script>

<form onsubmit={(e) => { e.preventDefault(); submit(e); return false; }} class="space-y-4">
  <div class="space-y-1">
    <Label for="email">Email</Label>
    <Input type="email" bind:value={email} placeholder="email@example.com" error={fieldErrors.email} />
  </div>
  <div class="space-y-1">
    <Label for="password">Password</Label>
    <Input type="password" bind:value={password} placeholder="••••••" error={fieldErrors.password} />
  </div>
  {#key errorKey}
    {#if error}
      <Alert
        variant="destructive"
        title="Gagal Masuk"
        description={error}
        duration={5000}
        onDismiss={() => error = ''}
      />
    {/if}
  {/key}
  <Button type="submit" {loading} class="w-full">
    {#if loading}Loading...{:else}Masuk{/if}
  </Button>
</form>
