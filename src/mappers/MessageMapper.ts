import { Message, MessageAttachment } from '@/models/Message.model';
import { User } from '@/models/User.model';
import {
  MessageResponseDto,
  MessageAttachmentDto,
  SendMessageRequestDto
} from '@/dtos/chat/ChatResponse.dto';
import { UserMapper } from './UserMapper';
import type { PropuestaPreview } from '@/types/propuesta';


export class MessageMapper {
  static attachmentFromDto(dto: MessageAttachmentDto): MessageAttachment {
    const asset = (dto as any).asset;
    return new MessageAttachment({
      id: dto.id,
      assetId: dto.asset_id,
      url: dto.url || asset?.url || '',
      mimeType: dto.mime_type || asset?.mime_type || '',
      fileName: dto.file_name || asset?.original_name || '',
      fileSize: dto.file_size || asset?.size_bytes || 0,
    });
  }


  static fromDto(dto: MessageResponseDto): Message {
    return new Message({
      id: dto.id,
      conversationId: dto.conversation_id,
      senderId: dto.sender_user_id,
      text: dto.body_text,
      type: dto.type ?? 'TEXT',
      proposalId: dto.proposal_id ?? undefined,
      proposalData: dto.proposal_data ? (dto.proposal_data as PropuestaPreview) : undefined,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
      sender: dto.sender_user
        ? UserMapper.fromSimpleDto(dto.sender_user)
        : undefined,
      attachments: dto.attachments?.map(a => this.attachmentFromDto(a)) ?? [],
    });
  }


  static fromDtoArray(dtos: MessageResponseDto[]): Message[] {
    return dtos.map(dto => this.fromDto(dto));
  }


  static toSendRequest(text: string): SendMessageRequestDto {
    return {
      body_text: text,
    };
  }


  static createOptimistic(
    text: string,
    conversationId: string,
    currentUser: User
  ): Message {
    return new Message({
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      senderId: currentUser.id,
      text,
      createdAt: new Date(),
      updatedAt: new Date(),
      sender: currentUser,
      attachments: [],
      isOptimistic: true,
      isSending: true,
    });
  }

 
  static replaceOptimistic(
    messages: Message[],
    optimisticId: string,
    realMessage: Message
  ): Message[] {
    return messages.map(m => m.id === optimisticId ? realMessage : m);
  }


  static markOptimisticAsFailed(
    message: Message,
    error: string
  ): Message {
    const failedMessage = new Message({
      ...message,
      isSending: false,
      sendError: error,
    });
    return failedMessage;
  }
}
