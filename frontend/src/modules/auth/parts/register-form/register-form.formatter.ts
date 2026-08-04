// ponytail: pure function format GraphQL error → user-friendly

export function formatRegisterError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err || '');
  if (msg.includes('already registered') || msg.includes('ALREADY_EXISTS')) {
    return 'Email sudah terdaftar.';
  }
  return 'Gagal mendaftar. Silakan coba lagi.';
}
