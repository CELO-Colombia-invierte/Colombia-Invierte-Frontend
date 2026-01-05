import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth';
import { AuthState } from '@/types';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() =>
    authService.getAuth()
  );

  useEffect(() => {
    setAuthState(authService.getAuth());
  }, []);

  const login = useCallback((token: string, user: AuthState['user']) => {
    if (user) {
      authService.setAuth(token, user);
      setAuthState({
        user,
        token,
        isAuthenticated: true,
      });
    }
  }, []);

  const logout = useCallback(() => {
    authService.clearAuth();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  }, []);

  return {
    ...authState,
    login,
    logout,
  };
};

