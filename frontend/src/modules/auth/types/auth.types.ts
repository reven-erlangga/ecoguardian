import type { User } from '@shared/types/user';

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface ValidateTokenResponse {
  userId: string;
  role: string;
  email: string;
  username: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}