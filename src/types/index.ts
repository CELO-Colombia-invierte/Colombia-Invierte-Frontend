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
  currency: string;      // principal (ej. OUSD)
  address?: string;
  changePercentage?: number;
  secondaryAmount?: number;   // secundario (ej. USDT)
  secondaryCurrency?: string;
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

// Notificaciones
export enum NotificationType {
  PROJECT_INVITATION = 'PROJECT_INVITATION',
  PROJECT_INVITATION_ACCEPTED = 'PROJECT_INVITATION_ACCEPTED',
  PROJECT_INVITATION_DECLINED = 'PROJECT_INVITATION_DECLINED',
  PAYMENT_REMINDER = 'PAYMENT_REMINDER',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_LATE = 'PAYMENT_LATE',
  NEW_MESSAGE = 'NEW_MESSAGE',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
}

export interface NotificationActor {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
}

export interface NotificationProject {
  id: string;
  name: string;
  type: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  action_url: string | null;
  actor: NotificationActor | null;
  project: NotificationProject | null;
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
}

export interface UnreadCountResponse {
  unread_count: number;
}
