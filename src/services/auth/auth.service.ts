import { storageService } from '../storage';
import { apiService } from '../api';
import { AuthState, User, ThirdwebVerifyRequest, LoginRequest, AuthResponse } from '@/types';
import { sanitizeObject } from '@/utils/sanitization';

class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly refreshTokenKey = 'auth_refresh_token';
  private readonly userKey = 'auth_user';

  setAuth(token: string, refreshToken: string, user: User): void {
    const sanitizedUser = sanitizeObject(user);
    storageService.setItem(this.tokenKey, token);
    storageService.setItem(this.refreshTokenKey, refreshToken);
    storageService.setItem(this.userKey, JSON.stringify(sanitizedUser));
  }

  getAuth(): AuthState {
    const token = storageService.getItem(this.tokenKey);
    const refreshToken = storageService.getItem(this.refreshTokenKey);
    const userStr = storageService.getItem(this.userKey);

    if (!token || !userStr) {
      return {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      };
    }

    try {
      const user = JSON.parse(userStr) as User;
      return {
        user,
        token,
        refreshToken: refreshToken || null,
        isAuthenticated: true,
      };
    } catch {
      return {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      };
    }
  }

  clearAuth(): void {
    storageService.removeItem(this.tokenKey);
    storageService.removeItem(this.refreshTokenKey);
    storageService.removeItem(this.userKey);
  }

  getToken(): string | null {
    return storageService.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return storageService.getItem(this.refreshTokenKey);
  }

  async verifyThirdweb(data: ThirdwebVerifyRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/thirdweb/verify', data);
    if (response.data) {
      this.setAuth(response.data.access_token, response.data.refresh_token, response.data.user);
    }
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', data);
    if (response.data) {
      this.setAuth(response.data.access_token, response.data.refresh_token, response.data.user);
    }
    return response.data;
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await apiService.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken });
    if (response.data) {
      this.setAuth(response.data.access_token, response.data.refresh_token, response.data.user);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  async getMe(): Promise<User> {
    const response = await apiService.get<User>('/me');
    if (response.data) {
      storageService.setItem(this.userKey, JSON.stringify(sanitizeObject(response.data)));
    }
    return response.data;
  }

  async updateMe(data: Partial<User>): Promise<User> {
    const response = await apiService.patch<User>('/me', data);
    if (response.data) {
      storageService.setItem(this.userKey, JSON.stringify(sanitizeObject(response.data)));
    }
    return response.data;
  }
}

export const authService = new AuthService();

