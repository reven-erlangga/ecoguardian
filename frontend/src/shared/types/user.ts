export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at: { seconds: number };
  updated_at?: { seconds: number };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ValidateTokenResponse {
  user_id: string;
  role: string;
}
