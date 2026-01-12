import { ComponentType } from 'react';

export interface RouteConfig {
  path: string;
  component: ComponentType<any>;
  exact?: boolean;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  username?: string;
  display_name?: string;
  avatar?: string;
  avatar_asset_id?: string;
  verified?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken?: string | null;
  isAuthenticated: boolean;
}

export interface ThirdwebVerifyRequest {
  address: string;
  chain_id: number;
  message?: string;
  signature?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface Wallet {
  id: string;
  address: string;
  chain_id: number;
  label?: string;
  is_primary?: boolean;
}

export interface AddWalletRequest {
  address: string;
  chain_id: number;
  label?: string;
}

export interface UpdateWalletRequest {
  label?: string;
  is_primary?: boolean;
}
