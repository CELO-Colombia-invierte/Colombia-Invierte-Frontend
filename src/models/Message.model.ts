import { User } from './User.model';

export class MessageAttachment {
  readonly id: string;
  assetId: string;
  url: string;
  mimeType: string;
  fileName: string;
  fileSize: number;

  constructor(data: {
    id: string;
    assetId: string;
    url: string;
    mimeType: string;
    fileName: string;
    fileSize: number;
  }) {
    this.id = data.id;
    this.assetId = data.assetId;
    this.url = data.url;
    this.mimeType = data.mimeType;
    this.fileName = data.fileName;
    this.fileSize = data.fileSize;
  }


  isImage(): boolean {
    return this.mimeType.startsWith('image/');
  }


  isVideo(): boolean {
    return this.mimeType.startsWith('video/');
  }


  isDocument(): boolean {
    return this.mimeType.includes('pdf') ||
           this.mimeType.includes('document') ||
           this.mimeType.includes('text');
  }


  getFormattedSize(): string {
    const bytes = this.fileSize;

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
}


export class Message {
  readonly id: string;
  readonly conversationId: string;
  senderId: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  sender?: User;
  attachments: MessageAttachment[];
  isOptimistic: boolean;
  isSending: boolean;
  sendError?: string;

  constructor(data: {
    id: string;
    conversationId: string;
    senderId: string;
    text: string;
    createdAt?: Date;
    updatedAt?: Date;
    sender?: User;
    attachments?: MessageAttachment[];
    isOptimistic?: boolean;
    isSending?: boolean;
    sendError?: string;
  }) {
    this.id = data.id;
    this.conversationId = data.conversationId;
    this.senderId = data.senderId;
    this.text = data.text;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
    this.sender = data.sender;
    this.attachments = data.attachments ?? [];
    this.isOptimistic = data.isOptimistic ?? false;
    this.isSending = data.isSending ?? false;
    this.sendError = data.sendError;
  }


  isMine(currentUserId: string): boolean {
    return this.senderId === currentUserId;
  }


  isRecent(): boolean {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return this.createdAt.getTime() > fiveMinutesAgo;
  }

  getFormattedTime(): string {
    const now = new Date();
    const diff = now.getTime() - this.createdAt.getTime();

    if (diff < 60000) return 'Ahora';

    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m`;
    }

    if (this.createdAt.toDateString() === now.toDateString()) {
      return this.createdAt.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (this.createdAt.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    }

    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return this.createdAt.toLocaleDateString('es-CO', { weekday: 'short' });
    }

    return this.createdAt.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  }

  
  hasAttachments(): boolean {
    return this.attachments.length > 0;
  }


  hasImages(): boolean {
    return this.attachments.some(a => a.isImage());
  }

  
  getImages(): MessageAttachment[] {
    return this.attachments.filter(a => a.isImage());
  }

  getSenderName(): string {
    return this.sender?.getDisplayName() || 'Usuario';
  }


  hasError(): boolean {
    return !!this.sendError;
  }

 
  toJSON() {
    return {
      id: this.id,
      conversationId: this.conversationId,
      senderId: this.senderId,
      text: this.text,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      sender: this.sender?.toJSON(),
      attachments: this.attachments.map(a => ({
        id: a.id,
        assetId: a.assetId,
        url: a.url,
        mimeType: a.mimeType,
        fileName: a.fileName,
        fileSize: a.fileSize,
      })),
    };
  }
}
