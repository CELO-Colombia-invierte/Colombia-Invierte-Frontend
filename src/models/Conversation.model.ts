import { User } from './User.model';
import { Message } from './Message.model';

export type ConversationType = 'DIRECT' | 'GROUP';
export type ConversationMemberRole = 'admin' | 'member';

export class ConversationMember {
  readonly id: string;
  readonly conversationId: string;
  readonly userId: string;
  readonly role: ConversationMemberRole;
  joinedAt: Date;
  user: User;

  constructor(data: {
    id: string;
    conversationId: string;
    userId: string;
    role: ConversationMemberRole;
    joinedAt: Date;
    user: User;
  }) {
    this.id = data.id;
    this.conversationId = data.conversationId;
    this.userId = data.userId;
    this.role = data.role;
    this.joinedAt = data.joinedAt;
    this.user = data.user;
  }
}

export class Conversation {
  readonly id: string;
  type: ConversationType;
  members: ConversationMember[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    type: ConversationType;
    members?: ConversationMember[];
    lastMessage?: Message;
    unreadCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.type = data.type;
    this.members = data.members ?? [];
    this.lastMessage = data.lastMessage;
    this.unreadCount = data.unreadCount ?? 0;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  isGroup(): boolean {
    return this.type === 'GROUP';
  }

  getTitle(currentUserId: string): string {
    if (this.isGroup()) {
      return 'Grupo';
    }

    const otherMember = this.members.find(m => m.userId !== currentUserId);
    if (!otherMember) return 'Conversacion';

    return otherMember.user?.getDisplayName() || otherMember.user?.username || 'Usuario';
  }

  getAvatarUrl(currentUserId: string): string | undefined {
    if (this.isGroup()) {
      return undefined;
    }

    const otherMember = this.members.find(m => m.userId !== currentUserId);
    return otherMember?.user?.getAvatarUrl();
  }

  getAvatarInitials(currentUserId: string): string {
    if (this.isGroup()) {
      return 'GR';
    }

    const otherMember = this.members.find(m => m.userId !== currentUserId);
    return otherMember?.user?.getInitials() || 'U';
  }

  getLastMessagePreview(): string {
    if (!this.lastMessage) return 'Sin mensajes';
    
    const text = this.lastMessage.text || '';
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  }

  getLastMessagePreviewWithSender(currentUserId: string): string {
    if (!this.lastMessage) return 'Sin mensajes';

    const senderId = this.lastMessage.senderId;
    const text = this.lastMessage.text || '';
    const preview = text.length > 30 ? text.substring(0, 30) + '...' : text;

    if (this.isGroup()) {
      const sender = this.members.find(m => m.userId === senderId);
      const senderName = sender?.user?.getDisplayName() || sender?.user?.username || 'Usuario';
      const isCurrentUser = senderId === currentUserId;
      
      if (isCurrentUser) {
        return `Tu: ${preview}`;
      }
      return `${senderName}: ${preview}`;
    }

    if (senderId === currentUserId) {
      return `Tu: ${preview}`;
    }

    return preview;
  }

  getLastMessageTime(): string | null {
    if (!this.lastMessage) return null;

    const now = new Date();
    const messageDate = this.lastMessage.createdAt;
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return messageDate.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
    });
  }
}
