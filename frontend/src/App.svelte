<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { authStore } from '$modules/auth/stores/auth.stores';
  import { userStore } from '$modules/auth/stores/user.stores';
  import Sidebar from '@components/templates/sidebar/Sidebar.svelte';
  import Footer from '@components/templates/footer/Footer.svelte';
  import Toast from '@components/atoms/toast/Toast.svelte';

  // Page components
  import DashboardPage from './routes/DashboardPage.svelte';
  import IssuesPage from './routes/IssuesPage.svelte';
  import IssueDetailPage from './routes/IssueDetailPage.svelte';
  import BlockchainPage from './routes/BlockchainPage.svelte';
  import NotificationsPage from './routes/NotificationsPage.svelte';
  import TweetsPage from './routes/TweetsPage.svelte';
  import SimulasiPage from './routes/SimulasiPage.svelte';
  import SettingsPage from './routes/SettingsPage.svelte';
  import LoginPage from './routes/LoginPage.svelte';
  import RegisterPage from './routes/RegisterPage.svelte';

  let path: string = $state('/');
  let ready: boolean = $state(false);

  // ponytail: pola auth (login/register) = no sidebar + centered
  const isAuthPage = $derived(path === '/login' || path === '/register');

  function sync() {
    path = window.location.pathname as string;
  }

  function navigate(href: string) {
    if (path === href) return;
    history.pushState(null, '', href);
    sync();
  }

  onMount(async () => {
    sync();
    window.addEventListener('popstate', sync);
    try { await authStore.actions.rehydrate(); } catch {}
    ready = true;
    try { await userStore.actions.checkFirstUser(); } catch {}
  });

  onDestroy(() => {
    window.removeEventListener('popstate', sync);
  });
</script>

{#if ready}
  <Toast />
  {#if isAuthPage}
    <!-- Auth layout: centered card, no sidebar -->
    <div class="min-h-screen flex items-center justify-center bg-yellow-100 p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-heading border-2 border-border rounded-base inline-block px-6 py-3 bg-yellow-300 shadow-shadow">Ecoguard</h1>
        </div>
        <div class="border-2 border-border rounded-base shadow-shadow bg-card p-6">
          {#if path === '/login'}
            <LoginPage {navigate} />
          {:else}
            <RegisterPage {navigate} />
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <div class="flex h-screen overflow-hidden">
      <Sidebar currentPath={path} />
      <main class="flex-1 overflow-y-auto p-8 flex flex-col">
        {#if path === '/dashboard' || path === '/'}
          <DashboardPage {navigate} />
        {:else if path === '/issues'}
          <IssuesPage {navigate} />
        {:else if path.startsWith('/issues/')}
          <IssueDetailPage issueId={path.split('/').pop()!} {navigate} />
        {:else if path === '/blockchain'}
          <BlockchainPage {navigate} />
        {:else if path === '/notifications'}
          <NotificationsPage {navigate} />
        {:else if path === '/tweets'}
          <TweetsPage {navigate} />
        {:else if path === '/simulasi'}
          <SimulasiPage {navigate} />
        {:else if path === '/settings'}
          <SettingsPage {navigate} />
        {/if}
        <div class="mt-auto">
          <Footer />
        </div>
      </main>
    </div>
  {/if}
{/if}
