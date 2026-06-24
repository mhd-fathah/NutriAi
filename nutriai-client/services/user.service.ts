import { api } from './api';

export const userService = {
  async completeOnboarding(onboardingData: {
    age: number;
    gender: 'male' | 'female';
    height: number;
    weight: number;
    activityLevel: string;
  }) {
    const res = await api.post('/users/onboarding', onboardingData);
    return res.data;
  },

  async getProfile() {
    const res = await api.get('/users/profile');
    return res.data;
  },

  async updateProfile(profileData: any) {
    const res = await api.put('/users/profile', profileData);
    return res.data;
  },
};
