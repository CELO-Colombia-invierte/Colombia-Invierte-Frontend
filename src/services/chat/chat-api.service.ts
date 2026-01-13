import { apiService } from '../api';
import {
  Conversation,
  Message,
  CreateConversationRequest,
  CreateMessageRequest,
  PresignMessageAttachmentRequest,
  PresignMessageAttachmentResponse,
  AddAttachmentRequest,
  MessageAttachment,
} from '@/types/chat';

class ChatApiService {
  async getConversations(): Promise<Conversation[]> {
    const response = await apiService.get<Conversation[]>('/conversations');
    return response.data;
  }

  async createConversation(
    data: CreateConversationRequest
  ): Promise<Conversation> {
    const response = await apiService.post<Conversation>('/conversations', data);
    return response.data;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await apiService.get<Message[]>(
      `/conversations/${conversationId}/messages`
    );
    return response.data;
  }

  async sendMessage(
    conversationId: string,
    data: CreateMessageRequest
  ): Promise<Message> {
    const response = await apiService.post<Message>(
      `/conversations/${conversationId}/messages`,
      data
    );
    return response.data;
  }

  async presignAttachment(
    conversationId: string,
    data: PresignMessageAttachmentRequest
  ): Promise<PresignMessageAttachmentResponse> {
    const response = await apiService.post<PresignMessageAttachmentResponse>(
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
    data: AddAttachmentRequest
  ): Promise<MessageAttachment> {
    const response = await apiService.post<MessageAttachment>(
      `/conversations/${conversationId}/messages/${messageId}/attachments`,
      data
    );
    return response.data;
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
