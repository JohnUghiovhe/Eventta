import axios from 'axios';
import { isTokenExpired } from '../utils/token';
import { SYSTEM_MESSAGES } from '../utils/systemMessages';

// Use the Vite proxy in development, full URL in production
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? '/api' : SYSTEM_MESSAGES.apiBaseUrl);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const PUBLIC_AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
];

const isPublicAuthEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return PUBLIC_AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Check if token exists and is not expired
    if (token) {
      if (isTokenExpired(token)) {
        // Token is expired, remove it
        console.warn('Token is expired, clearing auth');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login if on a protected route
        if (!isPublicAuthEndpoint(config.url)) {
          window.location.href = '/login';
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url,
      error: error.message
    });
    
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isPublicVerify = requestUrl.includes('/payments/verify-public');
      const isAuthEndpoint = isPublicAuthEndpoint(requestUrl);

      if (!isPublicVerify && !isAuthEndpoint) {
        console.warn('Unauthorized access, clearing auth and redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
