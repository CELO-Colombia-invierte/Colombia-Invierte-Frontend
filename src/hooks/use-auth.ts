import { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { authService } from '@/services/auth';
import type { AuthState } from '@/services/auth';
import {
  ThirdwebVerifyRequestDto,
  LoginRequestDto,
  UpdateUserRequestDto,
} from '@/dtos/auth/AuthResponse.dto';
import { isProfileComplete } from '@/utils/profile';

export const useAuth = () => {
  const history = useHistory();
  const [authState, setAuthState] = useState<AuthState>(() =>
    authService.getAuth()
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAuthState(authService.getAuth());
    const unsubscribe = authService.subscribe(() => {
      setAuthState(authService.getAuth());
    });
    return unsubscribe;
  }, []);

  const verifyThirdweb = useCallback(
    async (data: ThirdwebVerifyRequestDto) => {
      if (isLoading) return;
      setIsLoading(true);
      try {
        const response = await authService.verifyThirdweb(data);
        const newAuthState: AuthState = {
          user: response.user,
          token: response.access_token,
          refreshToken: response.refresh_token,
          isAuthenticated: true,
        };
        setAuthState(newAuthState);

        setTimeout(() => {
          const redirectPath = isProfileComplete(response.user)
            ? '/home'
            : '/complete-profile';
          history.replace(redirectPath);
        }, 400);

        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [history, isLoading]
  );

  const login = useCallback(
    async (data: LoginRequestDto) => {
      setIsLoading(true);
      try {
        const response = await authService.login(data);
        const newAuthState: AuthState = {
          user: response.user,
          token: response.access_token,
          refreshToken: response.refresh_token,
          isAuthenticated: true,
        };
        setAuthState(newAuthState);
        setTimeout(() => {
          const redirectPath = isProfileComplete(response.user)
            ? '/home'
            : '/complete-profile';
          history.replace(redirectPath);
        }, 400);

        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [history]
  );

  const refreshToken = useCallback(async () => {
    try {
      const response = await authService.refreshToken();
      const newAuthState: AuthState = {
        user: response.user,
        token: response.access_token,
        refreshToken: response.refresh_token,
        isAuthenticated: true,
      };
      setAuthState(newAuthState);
      return response;
    } catch (error) {
      authService.clearAuth();
      const emptyAuthState: AuthState = {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      };
      setAuthState(emptyAuthState);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      const emptyAuthState: AuthState = {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      };
      setAuthState(emptyAuthState);
      history.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [history]);

  const getMe = useCallback(async () => {
    const user = await authService.getMe();
    setAuthState((prev) => ({
      ...prev,
      user,
    }));
    return user;
  }, []);

  const updateMe = useCallback(async (data: UpdateUserRequestDto) => {
    const user = await authService.updateMe(data);
    setAuthState((prev) => ({
      ...prev,
      user,
    }));
    return user;
  }, []);

  return {
    ...authState,
    isLoading,
    verifyThirdweb,
    login,
    refreshToken,
    logout,
    getMe,
    updateMe,
  };
};
