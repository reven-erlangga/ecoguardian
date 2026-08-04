export interface RegisterFormData {
  email: string;
  username: string;
  password: string;
}

export interface RegisterFormErrors {
  email?: string;
  username?: string;
  password?: string;
  general?: string;
}
