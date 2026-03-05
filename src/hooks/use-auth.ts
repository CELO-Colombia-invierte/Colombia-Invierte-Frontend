import { useState, useEffect, useCallback, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { authService } from '@/services/auth';
import { apiService } from '@/services/api';
import type { AuthState } from '@/services/auth';
import {
  ThirdwebVerifyRequestDto,
  LoginRequestDto,
  UpdateUserRequestDto,
} from '@/dtos/auth/AuthResponse.dto';


export const useAuth = () => {
  const history = useHistory();
  const [authState, setAuthState] = useState<AuthState>(() =>
    authService.getAuth()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const callbackRegistered = useRef(false);

  // Registrar el callback de fallo de auth en apiService (solo una vez)
  useEffect(() => {
    if (callbackRegistered.current) return;
    callbackRegistered.current = true;

    apiService.setAuthFailureCallback(() => {
      const emptyState: AuthState = {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      };
      setAuthState(emptyState);
      history.replace('/auth');
    });
  }, [history]);

  // Al montar, verificar si el token expiró y hacer refresh automático
  useEffect(() => {
    const initAuth = async () => {
      const currentAuth = authService.getAuth();

      // Si no hay sesión guardada, no hay nada que hacer
      if (!currentAuth.isAuthenticated) {
        setIsInitializing(false);
        return;
      }

      // Si el access_token NO está expirado, todo bien
      if (!authService.isTokenExpired()) {
        setIsInitializing(false);
        return;
      }

      // El access_token expiró → intentar refresh silencioso
      const refreshToken = authService.getRefreshToken();
      if (!refreshToken) {
        authService.clearAuth();
        setAuthState({ user: null, token: null, refreshToken: null, isAuthenticated: false });
        setIsInitializing(false);
        history.replace('/auth');
        return;
      }

      try {
        const response = await authService.refreshToken();
        setAuthState({
          user: response.user,
          token: response.access_token,
          refreshToken: response.refresh_token,
          isAuthenticated: true,
        });
      } catch {
        // El refresh también falló (token revocado, expirado, secret cambiado)
        authService.clearAuth();
        setAuthState({ user: null, token: null, refreshToken: null, isAuthenticated: false });
        history.replace('/auth');
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Suscribirse a cambios externos del authService
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

        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
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

        return response;
      } finally {
        setIsLoading(false);
      }
    },
    []
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
    isInitializing,
    verifyThirdweb,
    login,
    refreshToken,
    logout,
    getMe,
    updateMe,
  };
};
