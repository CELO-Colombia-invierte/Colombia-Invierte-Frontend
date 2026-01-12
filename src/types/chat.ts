export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
}

export enum ConversationMemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  role: ConversationMemberRole;
  joined_at: string;
  last_read_at: string | null;
  unread_count: number;
  user: ChatUser;
}

export interface ChatUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  asset_id: string;
  asset: Asset;
}

export interface Asset {
  id: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  body_text: string;
  created_at: string;
  sender_user: ChatUser;
  attachments: MessageAttachment[];
}

export interface Conversation {
  id: string;
  type: ConversationType;
  created_by: string;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  created_by_user: ChatUser;
  members: ConversationMember[];
}

export interface CreateConversationRequest {
  type: ConversationType;
  member_ids: string[];
}

export interface CreateMessageRequest {
  body_text: string;
}

export interface PresignMessageAttachmentRequest {
  file_name: string;
  mime_type: string;
  file_size: number;
}

export interface PresignMessageAttachmentResponse {
  upload_url: string;
  asset_id: string;
  expires_in: number;
}

export interface AddAttachmentRequest {
  asset_id: string;
}

export interface SendMessageSocketPayload {
  conversationId: string;
  bodyText: string;
}

export interface TypingIndicatorSocketPayload {
  conversationId: string;
}

export interface JoinConversationSocketPayload {
  conversationId: string;
}

export interface MarkAsReadSocketPayload {
  conversationId: string;
}

export interface NewMessageSocketEvent {
  message: Message;
  conversationId: string;
}

export interface UserTypingSocketEvent {
  conversationId: string;
  userId: string;
  userName: string;
}

export interface UserStoppedTypingSocketEvent {
  conversationId: string;
  userId: string;
}

export interface MessageReadSocketEvent {
  conversationId: string;
  userId: string;
  readAt: string;
}

export interface NewConversationSocketEvent {
  conversationId: string;
}

export interface ConnectedSocketEvent {
  message: string;
  userId: string;
}

export interface SocketErrorEvent {
  message: string;
}

export interface SocketResponse {
  success: boolean;
  message?: Message;
  error?: string;
}
