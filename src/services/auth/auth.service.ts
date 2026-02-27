import { storageService } from '../storage';
import { apiService } from '../api';
import { sanitizeObject } from '@/utils/sanitization';
import { User } from '@/models/User.model';
import { UserMapper } from '@/mappers/UserMapper';
import {
  AuthResponseDto,
  ThirdwebVerifyRequestDto,
  LoginRequestDto,
  UpdateUserRequestDto,
  UserDto,
} from '@/dtos/auth/AuthResponse.dto';

// Tipos exportados para el servicio
export type AuthState = {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: User;
};

class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly refreshTokenKey = 'auth_refresh_token';
  private readonly userKey = 'auth_user';
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  setAuth(token: string, refreshToken: string, user: User): void {
    const sanitizedUser = sanitizeObject(user.toJSON());
    storageService.setItem(this.tokenKey, token);
    storageService.setItem(this.refreshTokenKey, refreshToken);
    storageService.setItem(this.userKey, JSON.stringify(sanitizedUser));
    this.notifyListeners();
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
      const userData = JSON.parse(userStr);
      const user = new User(userData);

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
    this.notifyListeners();
  }

  getToken(): string | null {
    const token = storageService.getItem(this.tokenKey);
    return token;
  }

  getRefreshToken(): string | null {
    return storageService.getItem(this.refreshTokenKey);
  }

  async verifyThirdweb(data: ThirdwebVerifyRequestDto): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponseDto>(
      '/auth/thirdweb/verify',
      data
    );
    if (response.data) {
      const user = UserMapper.fromAuthResponse(response.data);
      this.setAuth(
        response.data.access_token,
        response.data.refresh_token,
        user
      );
      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        user,
      };
    }
    throw new Error('No data received from verify');
  }

  async login(data: LoginRequestDto): Promise<AuthResponse> {

    const response = await apiService.post<AuthResponseDto>(
      '/auth/login',
      data
    );
    if (response.data) {
      const user = UserMapper.fromAuthResponse(response.data);
      this.setAuth(
        response.data.access_token,
        response.data.refresh_token,
        user
      );
      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        user,
      };
    }
    throw new Error('No data received from login');
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await apiService.post<AuthResponseDto>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    if (response.data) {
      const user = UserMapper.fromAuthResponse(response.data);
      this.setAuth(
        response.data.access_token,
        response.data.refresh_token,
        user
      );
      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        user,
      };
    }
    throw new Error('No data received from refresh');
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
    const response = await apiService.get<UserDto>('/me');
    if (response.data) {
      const user = UserMapper.fromDto(response.data);
      storageService.setItem(
        this.userKey,
        JSON.stringify(sanitizeObject(user.toJSON()))
      );
      return user;
    }
    throw new Error('No data received from getMe');
  }

  async updateMe(data: UpdateUserRequestDto): Promise<User> {
    const response = await apiService.patch<UserDto>('/me', data);
    if (response.data) {
      const user = UserMapper.fromDto(response.data);
      storageService.setItem(
        this.userKey,
        JSON.stringify(sanitizeObject(user.toJSON()))
      );
      return user;
    }
    throw new Error('No data received from updateMe');
  }
}

export const authService = new AuthService();
