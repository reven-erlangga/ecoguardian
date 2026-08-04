// ponytail: pure function validasi untuk edit profile

export function validateProfileEmail(email: string): string | null {
  if (!email.trim()) return 'Email tidak boleh kosong.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Format email tidak valid.';
  return null;
}

export function validateProfileUsername(username: string): string | null {
  if (!username.trim()) return 'Username tidak boleh kosong.';
  if (username.length < 3) return 'Username minimal 3 karakter.';
  if (username.length > 50) return 'Username maksimal 50 karakter.';
  return null;
}
