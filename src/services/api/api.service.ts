import { ApiResponse, ApiError } from '@/types/api';
import { authService } from '../auth';

class ApiService {
  private baseUrl: string;
  private refreshingToken: boolean = false;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true
  ): Promise<ApiResponse<T>> {
    const token = authService.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization' as keyof HeadersInit & string] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401 && retry && !this.refreshingToken) {
        if (!this.refreshPromise) {
          this.refreshingToken = true;
          this.refreshPromise = authService.refreshToken()
            .then(() => {
              this.refreshingToken = false;
              this.refreshPromise = null;
            })
            .catch(() => {
              this.refreshingToken = false;
              this.refreshPromise = null;
              authService.clearAuth();
              throw {
                message: 'Session expired',
                status: 401,
              } as ApiError;
            });
        }

        await this.refreshPromise;
        return this.request<T>(endpoint, options, false);
      }

      if (!response.ok) {
        const error: ApiError = {
          message: response.statusText,
          status: response.status,
        };
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw {
          message: error.message,
        } as ApiError;
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();

