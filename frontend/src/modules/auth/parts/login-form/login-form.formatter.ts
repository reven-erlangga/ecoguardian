// ponytail: pure function format GraphQL error → user-friendly

export function formatLoginError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err || '');
  if (msg.includes('Invalid email or password') || msg.includes('UNAUTHENTICATED')) {
    return 'Email atau password salah.';
  }
  if (msg.includes('not found')) {
    return 'Akun tidak ditemukan.';
  }
  return 'Terjadi kesalahan. Silakan coba lagi.';
}
