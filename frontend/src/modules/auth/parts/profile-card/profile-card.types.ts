import type { Snippet } from 'svelte';
import type { User } from '@shared/types/user';

export interface ProfileCardState {
  editing: boolean;
  editEmail: string;
  editUsername: string;
  editError: string;
  editLoading: boolean;
}

export interface ProfileCardErrors {
  email?: string;
  username?: string;
}

export interface ProfileCardProps {
  user: User | null;
  token: string | null;
  children?: Snippet;
}
