// ponytail: navigasi SPA — trigger popstate biar App.svelte re-route
// Dipake oleh LoginForm, RegisterForm, UserDropdown, checkFirstUser, logout
export function navigate(href: string): void {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === href) return;
  history.pushState(null, '', href);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
