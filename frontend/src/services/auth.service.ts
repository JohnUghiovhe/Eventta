import api from './api';
import { ApiResponse, User } from '../types';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterResponse {
  user: User;
  token: string;
}

export const authService = {
  async register(data: RegisterData): Promise<ApiResponse<RegisterResponse>> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setAuthData(token: string, user: User) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
};
