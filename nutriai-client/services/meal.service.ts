import { api } from './api';

export const mealService = {
  async analyzeMeal(mealType: string, imageBase64: string, mimeType?: string) {
    const res = await api.post('/meals/analyze', { mealType, imageBase64, mimeType });
    return res.data;
  },

  async createMeal(mealData: any) {
    const res = await api.post('/meals', mealData);
    return res.data;
  },

  async getMealsPaginated(limit: number = 10, page: number = 1) {
    const res = await api.get('/meals', { params: { limit, page } });
    return res.data;
  },

  async getMealsHistory(range: 'daily' | 'weekly' | 'monthly') {
    const res = await api.get('/meals/history', { params: { range } });
    return res.data;
  },

  async getMealById(id: string) {
    const res = await api.get(`/meals/${id}`);
    return res.data;
  },
};
