export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: { seconds: number };
  updatedAt?: { seconds: number };
}

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