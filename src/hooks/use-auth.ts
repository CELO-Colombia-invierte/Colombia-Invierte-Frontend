import { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { authService } from '@/services/auth';
import { AuthState, ThirdwebVerifyRequest, LoginRequest, User } from '@/types';

export const useAuth = () => {
  const history = useHistory();
  const [authState, setAuthState] = useState<AuthState>(() =>
    authService.getAuth()
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAuthState(authService.getAuth());
  }, []);

  const verifyThirdweb = useCallback(async (data: ThirdwebVerifyRequest) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await authService.verifyThirdweb(data);
      const newAuthState = {
        user: response.user,
        token: response.access_token,
        refreshToken: response.refresh_token,
        isAuthenticated: true,
      };
      setAuthState(newAuthState);
      history.push('/home');
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [history, isLoading]);

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      setAuthState({
        user: response.user,
        token: response.access_token,
        refreshToken: response.refresh_token,
        isAuthenticated: true,
      });
      history.push('/home');
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [history]);

  const refreshToken = useCallback(async () => {
    try {
      const response = await authService.refreshToken();
      setAuthState({
        user: response.user,
        token: response.access_token,
        refreshToken: response.refresh_token,
        isAuthenticated: true,
      });
      return response;
    } catch (error) {
      authService.clearAuth();
      setAuthState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setAuthState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      });
      history.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [history]);

  const getMe = useCallback(async () => {
    try {
      const user = await authService.getMe();
      setAuthState(prev => ({
        ...prev,
        user,
      }));
      return user;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateMe = useCallback(async (data: Partial<User>) => {
    try {
      const user = await authService.updateMe(data);
      setAuthState(prev => ({
        ...prev,
        user,
      }));
      return user;
    } catch (error) {
      throw error;
    }
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

