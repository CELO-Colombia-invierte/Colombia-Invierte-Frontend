import { io, Socket } from 'socket.io-client';
import { authService } from '../auth';
import {
  Message,
  SendMessageSocketPayload,
  TypingIndicatorSocketPayload,
  JoinConversationSocketPayload,
  MarkAsReadSocketPayload,
  NewMessageSocketEvent,
  UserTypingSocketEvent,
  UserStoppedTypingSocketEvent,
  MessageReadSocketEvent,
  NewConversationSocketEvent,
  ConnectedSocketEvent,
  SocketErrorEvent,
  SocketResponse,
} from '@/types/chat';

type EventCallback<T> = (data: T) => void;

class ChatWebSocketService {
  private socket: Socket | null = null;
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '';
  }

  connect(): void {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    this.socket = io(`${this.baseUrl}/chat`, {
      auth: {
        token,
      },
      transports: ['websocket'],
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  onConnected(callback: EventCallback<ConnectedSocketEvent>): void {
    this.socket?.on('connected', callback);
  }

  onNewMessage(callback: EventCallback<NewMessageSocketEvent>): void {
    this.socket?.on('newMessage', callback);
  }

  onUserTyping(callback: EventCallback<UserTypingSocketEvent>): void {
    this.socket?.on('userTyping', callback);
  }

  onUserStoppedTyping(
    callback: EventCallback<UserStoppedTypingSocketEvent>
  ): void {
    this.socket?.on('userStoppedTyping', callback);
  }

  onMessageRead(callback: EventCallback<MessageReadSocketEvent>): void {
    this.socket?.on('messageRead', callback);
  }

  onNewConversation(
    callback: EventCallback<NewConversationSocketEvent>
  ): void {
    this.socket?.on('newConversation', callback);
  }

  onError(callback: EventCallback<SocketErrorEvent>): void {
    this.socket?.on('error', callback);
  }

  offEvent(eventName: string, callback?: Function): void {
    if (callback) {
      this.socket?.off(eventName, callback as any);
    } else {
      this.socket?.off(eventName);
    }
  }

  sendMessage(
    payload: SendMessageSocketPayload,
    callback?: (response: SocketResponse) => void
  ): void {
    this.socket?.emit('sendMessage', payload, callback);
  }

  typing(payload: TypingIndicatorSocketPayload): void {
    this.socket?.emit('typing', payload);
  }

  stopTyping(payload: TypingIndicatorSocketPayload): void {
    this.socket?.emit('stopTyping', payload);
  }

  joinConversation(
    payload: JoinConversationSocketPayload,
    callback?: (response: SocketResponse) => void
  ): void {
    this.socket?.emit('joinConversation', payload, callback);
  }

  leaveConversation(
    payload: JoinConversationSocketPayload,
    callback?: (response: SocketResponse) => void
  ): void {
    this.socket?.emit('leaveConversation', payload, callback);
  }

  markAsRead(
    payload: MarkAsReadSocketPayload,
    callback?: (response: SocketResponse) => void
  ): void {
    this.socket?.emit('markAsRead', payload, callback);
  }
}

export const chatWebSocketService = new ChatWebSocketService();
