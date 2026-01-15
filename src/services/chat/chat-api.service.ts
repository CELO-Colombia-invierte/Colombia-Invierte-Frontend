import { apiService } from '../api';
import { Conversation } from '@/models/Conversation.model';
import { Message, MessageAttachment } from '@/models/Message.model';
import { ConversationMapper } from '@/mappers/ConversationMapper';
import { MessageMapper } from '@/mappers/MessageMapper';
import {
  ConversationResponseDto,
  MessageResponseDto,
  PresignMessageAttachmentRequestDto,
  PresignMessageAttachmentResponseDto,
  AddMessageAttachmentRequestDto,
  MessageAttachmentDto,
} from '@/dtos/chat/ChatResponse.dto';

class ChatApiService {
  async getConversations(): Promise<Conversation[]> {
    const response =
      await apiService.get<ConversationResponseDto[]>('/conversations');
    return ConversationMapper.fromDtoArray(response.data);
  }

  async createConversation(
    type: 'DIRECT' | 'GROUP',
    memberIds: string[]
  ): Promise<Conversation> {
    const requestData = ConversationMapper.toCreateRequest(type, memberIds);
    const response = await apiService.post<ConversationResponseDto>(
      '/conversations',
      requestData
    );
    return ConversationMapper.fromDto(response.data);
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await apiService.get<MessageResponseDto[]>(
      `/conversations/${conversationId}/messages`
    );
    return MessageMapper.fromDtoArray(response.data);
  }

  async sendMessage(conversationId: string, text: string): Promise<Message> {
    const requestData = MessageMapper.toSendRequest(text);
    const response = await apiService.post<MessageResponseDto>(
      `/conversations/${conversationId}/messages`,
      requestData
    );
    return MessageMapper.fromDto(response.data);
  }

  async presignAttachment(
    conversationId: string,
    data: PresignMessageAttachmentRequestDto
  ): Promise<PresignMessageAttachmentResponseDto> {
    const response = await apiService.post<PresignMessageAttachmentResponseDto>(
      `/conversations/${conversationId}/messages/presign`,
      data
    );
    return response.data;
  }

  async uploadFile(uploadUrl: string, file: File): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }
  }

  async addAttachment(
    conversationId: string,
    messageId: string,
    data: AddMessageAttachmentRequestDto
  ): Promise<MessageAttachment> {
    const response = await apiService.post<MessageAttachmentDto>(
      `/conversations/${conversationId}/messages/${messageId}/attachments`,
      data
    );
    return MessageMapper.attachmentFromDto(response.data);
  }

  async uploadMessageAttachment(
    conversationId: string,
    messageId: string,
    file: File
  ): Promise<MessageAttachment> {
    const presignResponse = await this.presignAttachment(conversationId, {
      file_name: file.name,
      mime_type: file.type,
      file_size: file.size,
    });

    await this.uploadFile(presignResponse.upload_url, file);

    return this.addAttachment(conversationId, messageId, {
      asset_id: presignResponse.asset_id,
    });
  }
}

export const chatApiService = new ChatApiService();
