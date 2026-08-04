<script lang="ts">
  import { authStore } from '$modules/auth/stores/auth.stores';
  import { navigate } from '@shared/utils/navigate';
  import UserIcon from 'phosphor-svelte/lib/UserIcon';
    import SettingsIcon from 'phosphor-svelte/lib/GearIcon';
    import LogOutIcon from 'phosphor-svelte/lib/SignOutIcon';
    import ChevronsUpDownIcon from 'phosphor-svelte/lib/CaretUpDownIcon';

  let open = $state(false);

  function toggle() { open = !open; }
  function close() { open = false; }

  function handleLogout() {
    close();
    authStore.actions.logout();
  }

  function handleEditProfile() {
    close();
    navigate('/settings');
  }
</script>

<div class="relative">
  <button onclick={toggle}
    class="flex w-full items-center gap-2 overflow-hidden rounded-base p-2 text-sm font-base transition-colors hover:bg-main hover:text-main-foreground data-[state=open]:bg-main data-[state=open]:text-main-foreground {open ? 'bg-main text-main-foreground' : ''}">
    <div class="flex size-6 items-center justify-center rounded-base bg-secondary-background border-2 border-border">
      <span class="text-xs font-heading">{authStore.session.data.user?.username?.charAt(0)?.toUpperCase() || '?'}</span>
    </div>
    <div class="grid flex-1 text-left text-sm leading-tight">
      <span class="truncate font-heading">{authStore.session.data.user?.username || 'User'}</span>
      <span class="truncate text-xs text-muted-foreground">{authStore.session.data.user?.email || ''}</span>
    </div>
    <ChevronsUpDownIcon class="size-4 shrink-0 ml-auto text-sidebar-foreground/50" />
  </button>

  {#if open}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="fixed inset-0 z-40" onclick={close} role="presentation"></div>
    <div class="absolute bottom-full left-0 mb-1 z-50 min-w-[200px] overflow-hidden rounded-base border-2 border-border bg-main p-1 font-base text-main-foreground shadow-shadow">
      <div class="px-2 py-1.5 text-sm font-heading border-b-2 border-border mb-1">{authStore.session.data.user?.username || 'Akun'}</div>

      <button onclick={close} class="relative gap-2 flex cursor-default select-none items-center rounded-base border-2 border-transparent bg-main px-2 py-1.5 text-sm font-base w-full outline-hidden transition-colors hover:border-border">
        <UserIcon class="size-4 shrink-0" /> <span>Profil</span>
      </button>

      <button onclick={handleEditProfile} class="relative gap-2 flex cursor-default select-none items-center rounded-base border-2 border-transparent bg-main px-2 py-1.5 text-sm font-base w-full outline-hidden transition-colors hover:border-border">
        <SettingsIcon class="size-4 shrink-0" /> <span>Edit Profil</span>
      </button>

      <div class="-mx-1 my-1 h-0.5 bg-border"></div>

      <button onclick={handleLogout} class="relative gap-2 flex cursor-default select-none items-center rounded-base border-2 border-transparent bg-main px-2 py-1.5 text-sm font-base w-full outline-hidden transition-colors hover:border-border">
        <LogOutIcon class="size-4 shrink-0" /> <span>Logout</span>
      </button>
    </div>
  {/if}
</div>
