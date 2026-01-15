import { Conversation, ConversationMember, ConversationType } from '@/models/Conversation.model';
import {
  ConversationResponseDto,
  ConversationMemberDto,
  CreateConversationRequestDto
} from '@/dtos/chat/ChatResponse.dto';
import { UserMapper } from './UserMapper';
import { MessageMapper } from './MessageMapper';

/**
 * ConversationMapper - Transforma entre DTOs del API y Models del dominio
 */
export class ConversationMapper {
  /**
   * Convierte un ConversationMemberDto a ConversationMember Model
   */
  static memberFromDto(dto: ConversationMemberDto): ConversationMember {
    return new ConversationMember({
      id: dto.id,
      conversationId: dto.conversation_id,
      userId: dto.user_id,
      joinedAt: new Date(dto.joined_at),
      user: UserMapper.fromSimpleDto(dto.user),
    });
  }

  /**
   * Convierte un ConversationResponseDto a Conversation Model
   */
  static fromDto(dto: ConversationResponseDto): Conversation {
    return new Conversation({
      id: dto.id,
      type: dto.type as ConversationType,
      members: dto.members.map(m => this.memberFromDto(m)),
      lastMessage: dto.last_message
        ? MessageMapper.fromDto(dto.last_message)
        : undefined,
      unreadCount: dto.unread_count ?? 0,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
    });
  }

  /**
   * Convierte un array de ConversationResponseDto a Conversation Models
   */
  static fromDtoArray(dtos: ConversationResponseDto[]): Conversation[] {
    return dtos.map(dto => this.fromDto(dto));
  }

  /**
   * Convierte parámetros a CreateConversationRequestDto
   */
  static toCreateRequest(
    type: ConversationType,
    memberIds: string[]
  ): CreateConversationRequestDto {
    return {
      type,
      member_ids: memberIds,
    };
  }

  /**
   * Crea una conversación directa con otro usuario
   */
  static toCreateDirectRequest(otherUserId: string): CreateConversationRequestDto {
    return this.toCreateRequest('DIRECT', [otherUserId]);
  }

  /**
   * Crea una conversación de grupo
   */
  static toCreateGroupRequest(memberIds: string[]): CreateConversationRequestDto {
    return this.toCreateRequest('GROUP', memberIds);
  }

  /**
   * Ordena conversaciones por último mensaje (más reciente primero)
   */
  static sortByLastMessage(conversations: Conversation[]): Conversation[] {
    return [...conversations].sort((a, b) => {
      const timeA = a.lastMessage?.createdAt.getTime() ?? a.createdAt.getTime();
      const timeB = b.lastMessage?.createdAt.getTime() ?? b.createdAt.getTime();
      return timeB - timeA; // Descendente (más reciente primero)
    });
  }

  /**
   * Filtra conversaciones no leídas
   */
  static filterUnread(conversations: Conversation[]): Conversation[] {
    return conversations.filter(c => c.hasUnreadMessages());
  }

  /**
   * Filtra conversaciones por tipo
   */
  static filterByType(
    conversations: Conversation[],
    type: ConversationType
  ): Conversation[] {
    return conversations.filter(c => c.type === type);
  }
}
