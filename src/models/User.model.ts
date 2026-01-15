
export class User {
  readonly id: string;
  email?: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  avatarAssetId?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    email?: string;
    username?: string;
    displayName?: string;
    avatar?: string;
    avatarAssetId?: string;
    verified?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.email = data.email;
    this.username = data.username;
    this.displayName = data.displayName;
    this.avatar = data.avatar;
    this.avatarAssetId = data.avatarAssetId;
    this.verified = data.verified ?? false;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

 
  getDisplayName(): string {
    if (this.displayName) return this.displayName;
    if (this.username) return this.username;
    if (this.email) return this.email.split('@')[0];
    return 'Usuario';
  }


  getInitials(): string {
    const name = this.getDisplayName();
    const words = name.split(' ');

    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  }


  canSendMessage(): boolean {
    return this.verified;
  }


  getAvatarUrl(): string | undefined {
    if (this.avatar) return this.avatar;

    if (this.avatarAssetId) {
      const baseUrl = import.meta.env.VITE_ASSETS_URL || import.meta.env.VITE_API_URL;
      return `${baseUrl}/assets/${this.avatarAssetId}`;
    }

    return undefined;
  }


  hasAvatar(): boolean {
    return !!(this.avatar || this.avatarAssetId);
  }


  toJSON() {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      displayName: this.displayName,
      avatar: this.avatar,
      avatarAssetId: this.avatarAssetId,
      verified: this.verified,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
