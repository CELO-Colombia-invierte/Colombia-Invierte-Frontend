
export interface MessageAttachmentDto {
  id: string;
  asset_id: string;
  url: string;
  mime_type: string;
  file_name: string;
  file_size: number;
}

export interface MessageResponseDto {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  body_text: string;
  created_at: string;
  updated_at: string;
  sender_user?: {
    id: string;
    display_name?: string;
    username?: string;
    avatar?: string;
    avatar_asset_id?: string;
  };
  attachments?: MessageAttachmentDto[];
}

export interface ConversationMemberDto {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  user: {
    id: string;
    email?: string;
    username?: string;
    display_name?: string;
    avatar?: string;
    avatar_asset_id?: string;
    verified?: boolean;
  };
}

export interface ConversationResponseDto {
  id: string;
  type: 'DIRECT' | 'GROUP';
  created_at: string;
  updated_at: string;
  members: ConversationMemberDto[];
  last_message?: MessageResponseDto;
  unread_count?: number;
}

export interface SendMessageRequestDto {
  body_text: string;
}

export interface CreateConversationRequestDto {
  type: 'DIRECT' | 'GROUP';
  member_ids: string[];
}

export interface PresignMessageAttachmentResponseDto {
  upload_url: string;
  asset_id: string;
  expires_in: number;
}

export interface AddMessageAttachmentRequestDto {
  asset_id: string;
}

export interface PresignMessageAttachmentRequestDto {
  file_name: string;
  mime_type: string;
  file_size: number;
}
