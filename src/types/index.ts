import { ComponentType } from 'react';

export interface RouteConfig {
  path: string;
  component: ComponentType<any>;
  exact?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
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

export interface Investment {
  id: string;
  name: string;
  amount: number;
  currency: string;
  changePercentage: number;
  icon?: string;
  color?: string;
}

export interface Balance {
  amount: number;
  currency: string;
  address?: string;
  changePercentage?: number;
}

export interface PortfolioProject {
  id: string;
  name: string;
  type: 'natillera' | 'tokenizacion';
  amount?: number;
  currency?: string;
  changePercentage?: number;
  participants?: number;
  avatars?: string[];
  emoji?: string;
  period?: string;
  description?: string;
  gradient?: string;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  location?: string;
  isOnline?: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  isMine: boolean;
  userId: string;
}
