import { api } from './api';

export const authService = {
  async register(name: string, email: string, password: string) {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },

  async login(email: string, password: any) {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  async googleLogin(token: string) {
    const res = await api.post('/auth/google', { token });
    return res.data;
  },

  async getProfile() {
    const res = await api.get('/auth/profile');
    return res.data;
  },
};
