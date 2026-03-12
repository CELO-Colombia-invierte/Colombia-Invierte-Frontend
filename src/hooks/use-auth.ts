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


  useEffect(() => {
    const initAuth = async () => {
      const currentAuth = authService.getAuth();


      if (!currentAuth.isAuthenticated) {
        setIsInitializing(false);
        return;
      }


      if (!authService.isTokenExpired()) {
        setIsInitializing(false);
        return;
      }


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
        
        authService.clearAuth();
        setAuthState({ user: null, token: null, refreshToken: null, isAuthenticated: false });
        history.replace('/auth');
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
   
  }, []);


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

  const logout = useCallback(() => {
   
    authService.clearAuth();
    setAuthState({ user: null, token: null, refreshToken: null, isAuthenticated: false });
    history.replace('/auth');
    
    authService.logout().catch(() => {});
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
