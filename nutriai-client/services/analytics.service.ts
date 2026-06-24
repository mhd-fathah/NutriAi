import { api } from './api';

export const analyticsService = {
  async getDashboardData() {
    const res = await api.get('/analytics/dashboard-overview');
    return res.data;
  },
  async getDashboardOverview() {
    const res = await api.get('/analytics/dashboard-overview');
    return res.data;
  },
};
