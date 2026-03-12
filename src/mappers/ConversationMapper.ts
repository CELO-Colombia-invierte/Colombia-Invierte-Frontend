import {
  Conversation,
  ConversationMember,
  ConversationType,
  ConversationMemberRole,
} from '@/models/Conversation.model';
import {
  ConversationResponseDto,
  ConversationMemberDto,
  CreateConversationRequestDto,
} from '@/dtos/chat/ChatResponse.dto';
import { UserMapper } from './UserMapper';
import { MessageMapper } from './MessageMapper';


export class ConversationMapper {

  static memberFromDto(dto: ConversationMemberDto): ConversationMember {
    return new ConversationMember({
      id: dto.id || dto.user_id,
      conversationId: dto.conversation_id,
      userId: dto.user_id,
      role: (dto.role || 'member') as ConversationMemberRole,
      joinedAt: new Date(dto.joined_at),
      user: UserMapper.fromSimpleDto(dto.user),
    });
  }

  static fromDto(dto: ConversationResponseDto): Conversation {
    const members = dto.members || [];

    return new Conversation({
      id: dto.id,
      type: dto.type as ConversationType,
      name: dto.name,
      members: members.map((m) => this.memberFromDto(m)),
      lastMessage: dto.last_message
        ? MessageMapper.fromDto(dto.last_message)
        : undefined,
      unreadCount: dto.unread_count ?? 0,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
    });
  }


  static fromDtoArray(dtos: ConversationResponseDto[]): Conversation[] {
    if (!dtos || !Array.isArray(dtos)) {
      return [];
    }
    return dtos.map((dto) => this.fromDto(dto));
  }

  static toCreateRequest(
    type: ConversationType,
    memberIds: string[],
    projectId?: string,
  ): CreateConversationRequestDto {
    return {
      type,
      member_ids: memberIds,
      ...(projectId ? { project_id: projectId } : {}),
    };
  }


  static toCreateDirectRequest(
    otherUserId: string
  ): CreateConversationRequestDto {
    return this.toCreateRequest('DIRECT', [otherUserId]);
  }

 
  static toCreateGroupRequest(
    memberIds: string[]
  ): CreateConversationRequestDto {
    return this.toCreateRequest('GROUP', memberIds);
  }


  static sortByLastMessage(conversations: Conversation[]): Conversation[] {
    return [...conversations].sort((a, b) => {
      const timeA = a.lastMessage?.createdAt.getTime() ?? a.createdAt.getTime();
      const timeB = b.lastMessage?.createdAt.getTime() ?? b.createdAt.getTime();
      return timeB - timeA;
    });
  }


  static filterUnread(conversations: Conversation[]): Conversation[] {
    return conversations.filter((c) => c.unreadCount > 0);
  }

 
  static filterByType(
    conversations: Conversation[],
    type: ConversationType
  ): Conversation[] {
    return conversations.filter((c) => c.type === type);
  }
}
