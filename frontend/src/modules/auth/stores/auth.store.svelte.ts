import { client } from '@shared/utils/graphql';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '../graphql/mutations';
import type { User } from '@shared/types/user';

let _user = $state<User | null>(null);
let _token = $state<string | null>(typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);

export const authStore = {
  get user() { return _user; },
  get token() { return _token; },
  get isLoggedIn() { return !!_token; },
  setUser(u: User | null) { _user = u; },
  setToken(t: string | null) {
    _token = t;
    if (t) localStorage.setItem('token', t);
    else localStorage.removeItem('token');
  },
  async login(email: string, password: string) {
    const r = await client.mutation(LOGIN_MUTATION, { input: { email, password } }).toPromise();
    if (r.error) throw new Error(r.error.message);
    const d = r.data?.user_UserService_Login;
    this.setUser(d.user); this.setToken(d.token);
    return d;
  },
  async register(email: string, username: string, password: string) {
    const r = await client.mutation(REGISTER_MUTATION, { input: { email, username, password } }).toPromise();
    if (r.error) throw new Error(r.error.message);
    const d = r.data?.user_UserService_Register;
    this.setUser(d.user); this.setToken(d.token);
    return d;
  },
  logout() {
    this.setUser(null); this.setToken(null);
    window.location.href = '/login';
  },
};
