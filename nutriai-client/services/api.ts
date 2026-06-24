import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Request Interceptor to dynamically attach the JWT token
api.interceptors.request.use(
  async (config) => {
    let token: string | null = null;

    if (typeof window === 'undefined') {
      // Running on server side (Server Components, Route Handlers, Server Actions)
      try {
        // Dynamically import auth to avoid bundling issues
        const { auth } = await import('@/lib/auth/auth');
        const session = await auth();
        if (session && (session as any).accessToken) {
          token = (session as any).accessToken;
        }
      } catch (err) {
        console.error('Error fetching session on server side', err);
      }
    } else {
      // Running on client side
      const session = await getSession();
      if (session && (session as any).accessToken) {
        token = (session as any).accessToken;
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Axios Response Interceptor to standardize response format and handle errors
api.interceptors.response.use(
  (response) => {
    // If the response is already in the backend's standard success format
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response;
    }
    return {
      ...response,
      data: {
        success: true,
        data: response.data,
      },
    };
  },
  (error) => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === 'object') {
        errorMessage = data.error || data.message || errorMessage;
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return Promise.reject({
      success: false,
      error: errorMessage,
      status: error.response?.status,
    });
  },
);
