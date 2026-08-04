// ponytail: pure function validasi register form
import type { RegisterFormData, RegisterFormErrors } from './register-form.types';

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email tidak boleh kosong.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Format email tidak valid.';
  return null;
}

export function validateUsername(username: string): string | null {
  if (!username.trim()) return 'Username tidak boleh kosong.';
  if (username.length < 3) return 'Username minimal 3 karakter.';
  if (username.length > 50) return 'Username maksimal 50 karakter.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password tidak boleh kosong.';
  if (password.length < 6) return 'Password minimal 6 karakter.';
  return null;
}

export function validateAll(data: RegisterFormData): RegisterFormErrors {
  const errors: RegisterFormErrors = {};
  const emailErr = validateEmail(data.email);
  const usernameErr = validateUsername(data.username);
  const passwordErr = validatePassword(data.password);
  if (emailErr) errors.email = emailErr;
  if (usernameErr) errors.username = usernameErr;
  if (passwordErr) errors.password = passwordErr;
  return errors;
}
