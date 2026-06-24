import { api } from './api';

export const analyticsService = {
  async getDashboardData() {
    const res = await api.get('/analytics/dashboard');
    return res.data;
  },
};
