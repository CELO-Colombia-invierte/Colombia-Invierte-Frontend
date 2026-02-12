import React from 'react';
import { IonIcon } from '@ionic/react';
import { peopleCircle, chatbubblesOutline } from 'ionicons/icons';
import { Conversation } from '@/models/Conversation.model';
import './ConversationList.css';

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  onConversationClick?: (conversation: Conversation) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentUserId,
  onConversationClick,
}) => {
  if (conversations.length === 0) {
    return (
      <div className="conversation-list-empty">
        <IonIcon icon={chatbubblesOutline} />
        <p>No hay conversaciones</p>
        <span>Tus conversaciones apareceran aqui</span>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      {conversations.map((conversation) => (
        <ConversationListItem
          key={conversation.id}
          conversation={conversation}
          currentUserId={currentUserId}
          onClick={() => onConversationClick?.(conversation)}
        />
      ))}
    </div>
  );
};

interface ConversationListItemProps {
  conversation: Conversation;
  currentUserId: string;
  onClick?: () => void;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  currentUserId,
  onClick,
}) => {
  const isGroup = conversation.isGroup();
  const title = conversation.getTitle(currentUserId);
  const avatarUrl = conversation.getAvatarUrl(currentUserId);
  const initials = conversation.getAvatarInitials(currentUserId);
  const lastMessageTime = conversation.getLastMessageTime();
  const unreadCount = conversation.unreadCount;

  const getSubtitle = () => {
    if (conversation.lastMessage) {
      return conversation.getLastMessagePreviewWithSender(currentUserId);
    }
    if (isGroup) {
      return `${conversation.members.length} miembros`;
    }
    return 'Sin mensajes';
  };

  return (
    <div
      className={`conversation-item ${unreadCount > 0 ? 'has-unread' : ''}`}
      onClick={onClick}
    >
      <div className="conversation-avatar">
        {avatarUrl ? (
          <img src={avatarUrl} alt={title} />
        ) : isGroup ? (
          <div className="conversation-avatar-group">
            <IonIcon icon={peopleCircle} />
          </div>
        ) : (
          <div className="conversation-avatar-initials">{initials}</div>
        )}
        {!isGroup && <span className="conversation-online-indicator"></span>}
      </div>

      <div className="conversation-content">
        <div className="conversation-header">
          <span className="conversation-title">{title}</span>
          {lastMessageTime && (
            <span className="conversation-time">{lastMessageTime}</span>
          )}
        </div>
        <div className="conversation-preview">
          <span className="conversation-subtitle">{getSubtitle()}</span>
          {unreadCount > 0 && (
            <span className="conversation-unread-badge">{unreadCount}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationList;
