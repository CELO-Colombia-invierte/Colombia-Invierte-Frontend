import { User } from './User.model';
import { Message } from './Message.model';

export type ConversationType = 'DIRECT' | 'GROUP';


export class ConversationMember {
  readonly id: string;
  readonly conversationId: string;
  readonly userId: string;
  joinedAt: Date;
  user: User;

  constructor(data: {
    id: string;
    conversationId: string;
    userId: string;
    joinedAt: Date;
    user: User;
  }) {
    this.id = data.id;
    this.conversationId = data.conversationId;
    this.userId = data.userId;
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

  getTitle(currentUserId: string): string {
    if (this.type === 'GROUP') {
      return `Grupo de ${this.members.length} personas`;
    }

    const otherUser = this.getOtherUser(currentUserId);
    return otherUser?.user.getDisplayName() || 'Conversación';
  }


  getOtherUser(currentUserId: string): ConversationMember | undefined {
    return this.members.find(m => m.userId !== currentUserId);
  }


  getOtherUsers(currentUserId: string): ConversationMember[] {
    return this.members.filter(m => m.userId !== currentUserId);
  }


  hasUnreadMessages(): boolean {
    return this.unreadCount > 0;
  }


  isMemberActive(userId: string): boolean {
    return this.members.some(m => m.userId === userId);
  }


  getAvatarUrl(currentUserId: string): string | undefined {
    if (this.type === 'DIRECT') {
      const otherUser = this.getOtherUser(currentUserId);
      return otherUser?.user.getAvatarUrl();
    }
    return undefined;
  }


  getAvatarInitials(currentUserId: string): string {
    if (this.type === 'DIRECT') {
      const otherUser = this.getOtherUser(currentUserId);
      return otherUser?.user.getInitials() || 'GR';
    }

    return 'GR'; 
  }


  getLastMessagePreview(): string {
    if (!this.lastMessage) return 'Sin mensajes';

    if (this.lastMessage.hasAttachments()) {
      const imageCount = this.lastMessage.getImages().length;
      if (imageCount > 0) {
        return `📷 ${imageCount} imagen${imageCount > 1 ? 'es' : ''}`;
      }
      return `📎 ${this.lastMessage.attachments.length} archivo${this.lastMessage.attachments.length > 1 ? 's' : ''}`;
    }


    const maxLength = 50;
    if (this.lastMessage.text.length > maxLength) {
      return this.lastMessage.text.substring(0, maxLength) + '...';
    }

    return this.lastMessage.text;
  }


  getLastMessageTime(): string {
    if (!this.lastMessage) return '';
    return this.lastMessage.getFormattedTime();
  }

  isDirect(): boolean {
    return this.type === 'DIRECT';
  }


  isGroup(): boolean {
    return this.type === 'GROUP';
  }


  markAsRead(): void {
    this.unreadCount = 0;
  }


  incrementUnread(): void {
    this.unreadCount++;
  }


  updateLastMessage(message: Message): void {
    this.lastMessage = message;
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      members: this.members.map(m => ({
        id: m.id,
        conversationId: m.conversationId,
        userId: m.userId,
        joinedAt: m.joinedAt.toISOString(),
        user: m.user.toJSON(),
      })),
      lastMessage: this.lastMessage?.toJSON(),
      unreadCount: this.unreadCount,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
