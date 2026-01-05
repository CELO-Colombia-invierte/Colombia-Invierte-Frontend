import { storageService } from '../storage';
import { AuthState, User } from '@/types';
import { sanitizeObject } from '@/utils/sanitization';

class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';

  setAuth(token: string, user: User): void {
    const sanitizedUser = sanitizeObject(user);
    storageService.setItem(this.tokenKey, token);
    storageService.setItem(this.userKey, JSON.stringify(sanitizedUser));
  }

  getAuth(): AuthState {
    const token = storageService.getItem(this.tokenKey);
    const userStr = storageService.getItem(this.userKey);

    if (!token || !userStr) {
      return {
        user: null,
        token: null,
        isAuthenticated: false,
      };
    }

    try {
      const user = JSON.parse(userStr) as User;
      return {
        user,
        token,
        isAuthenticated: true,
      };
    } catch {
      return {
        user: null,
        token: null,
        isAuthenticated: false,
      };
    }
  }

  clearAuth(): void {
    storageService.removeItem(this.tokenKey);
    storageService.removeItem(this.userKey);
  }

  getToken(): string | null {
    return storageService.getItem(this.tokenKey);
  }
}

export const authService = new AuthService();

