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
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
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
