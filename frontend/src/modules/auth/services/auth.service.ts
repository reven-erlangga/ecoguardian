import { client } from '@shared/utils/graphql';
import { camelizeKeys } from '@shared/utils/camelize';
import {
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  REFRESH_TOKEN_MUTATION,
  LOGOUT_MUTATION,
  UPDATE_USER_MUTATION,
  VALIDATE_TOKEN_MUTATION,
} from '../graphql/mutations';
import { USER_COUNT } from '../graphql/queries';
import type { AuthResponse, RefreshTokenResponse, ValidateTokenResponse } from '../types/auth.types';
import type { User } from '@shared/types/user';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const r = await client.mutation(LOGIN_MUTATION, { input: { email, password } }).toPromise();
  if (r.error) throw new Error(r.error.message);
  return camelizeKeys(r.data?.user_UserService_Login);
}

export async function register(email: string, username: string, password: string): Promise<AuthResponse> {
  const r = await client.mutation(REGISTER_MUTATION, { input: { email, username, password } }).toPromise();
  if (r.error) throw new Error(r.error.message);
  return camelizeKeys(r.data?.user_UserService_Register);
}

export async function refreshToken(refresh_token: string): Promise<RefreshTokenResponse> {
  const r = await client.mutation(REFRESH_TOKEN_MUTATION, { input: { refresh_token } }).toPromise();
  if (r.error) throw new Error(r.error.message);
  return camelizeKeys(r.data?.user_AuthService_RefreshToken);
}

export async function logout(refresh_token: string): Promise<void> {
  await client.mutation(LOGOUT_MUTATION, { input: { refresh_token } }).toPromise();
}

export async function updateUser(id: string, email: string, username: string): Promise<User> {
  const r = await client.mutation(UPDATE_USER_MUTATION, { input: { id, email, username } }).toPromise();
  if (r.error) throw new Error(r.error.message);
  return camelizeKeys(r.data?.user_UserService_UpdateUser);
}

export async function validateToken(token: string): Promise<ValidateTokenResponse> {
  const r = await client.mutation(VALIDATE_TOKEN_MUTATION, { input: { token } }).toPromise();
  if (r.error) throw new Error(r.error.message);
  return camelizeKeys(r.data?.user_AuthService_ValidateToken);
}

export async function checkUserCount(): Promise<number> {
  const r = await client.query(USER_COUNT, {}).toPromise();
  if (r.error) return -1;
  return r.data?.user_UserService_GetUserCount?.count ?? -1;
}