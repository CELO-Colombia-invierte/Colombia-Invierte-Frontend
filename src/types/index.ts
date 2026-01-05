import { ComponentType } from 'react';

export interface RouteConfig {
  path: string;
  component: ComponentType<any>;
  exact?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

