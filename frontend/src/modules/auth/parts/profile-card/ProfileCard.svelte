<script lang="ts">
  import { authStore } from '../../stores/auth.stores';
  import { userStore } from '../../stores/user.stores';
  import { validateProfileEmail, validateProfileUsername } from './profile-card.validations';
  import {
    displayCardClass, editCardClass, inputClass,
    saveButtonClass, cancelButtonClass, editButtonClass,
    skeletonClass, skeletonLineClass, skeletonLineShortClass, errorClass,
  } from './profile-card.components';

  let editing = $state(false);
  let editEmail = $state('');
  let editUsername = $state('');
  let editError = $state('');
  let editLoading = $state(false);

  function startEdit() {
    const u = authStore.session.data.user;
    if (!u) return;
    editEmail = u.email;
    editUsername = u.username;
    editError = '';
    editing = true;
  }

  async function saveEdit() {
    const emailErr = validateProfileEmail(editEmail);
    const usernameErr = validateProfileUsername(editUsername);
    if (emailErr || usernameErr) {
      editError = [emailErr, usernameErr].filter(Boolean).join(' ');
      return;
    }
    editLoading = true;
    editError = '';
    try {
      await userStore.actions.updateProfile(editEmail, editUsername);
      editing = false;
    } catch (err: any) {
      editError = err.message || 'Gagal menyimpan profil.';
    } finally {
      editLoading = false;
    }
  }

  function cancelEdit() {
    editing = false;
    editError = '';
  }

  const user = $derived(authStore.session.data.user);
</script>

{#if editing}
  <div class={editCardClass}>
    <input type="email" bind:value={editEmail} placeholder="Email" class={inputClass} />
    <input type="text" bind:value={editUsername} placeholder="Username" class={inputClass} />
    {#if editError}
      <p class={errorClass}>{editError}</p>
    {/if}
    <div class="flex gap-2">
      <button onclick={saveEdit} disabled={editLoading} class={saveButtonClass}>
        {editLoading ? 'Menyimpan...' : 'Simpan'}
      </button>
      <button onclick={cancelEdit} class={cancelButtonClass}>Batal</button>
    </div>
  </div>
{:else if user}
  <div class={displayCardClass}>
    <p class="font-heading text-sm truncate">{user.username}</p>
    <p class="text-xs text-muted-foreground truncate">{user.email}</p>
    <p class="text-xs text-muted-foreground capitalize">role: {user.role}</p>
    <button onclick={startEdit} class={editButtonClass}>Edit Profil</button>
  </div>
{:else if authStore.session.data.token}
  <div class={skeletonClass}>
    <div class={skeletonLineClass}></div>
    <div class={skeletonLineShortClass}></div>
  </div>
{/if}
