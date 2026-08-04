// ponytail: pure function validasi login form
import type { LoginFormData, LoginFormErrors } from './login-form.types';

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email tidak boleh kosong.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Format email tidak valid.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password tidak boleh kosong.';
  if (password.length < 6) return 'Password minimal 6 karakter.';
  return null;
}

export function validateAll(data: LoginFormData): LoginFormErrors {
  const errors: LoginFormErrors = {};
  const emailErr = validateEmail(data.email);
  const passwordErr = validatePassword(data.password);
  if (emailErr) errors.email = emailErr;
  if (passwordErr) errors.password = passwordErr;
  return errors;
}
