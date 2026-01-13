import React from 'react';
import { IonIcon } from '@ionic/react';
import { arrowBackOutline, ellipsisVertical } from 'ionicons/icons';
import { ChatUser } from '@/types';
import './ChatHeader.css';

interface ChatHeaderProps {
  user: ChatUser;
  onBack?: () => void;
  onMenuClick?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ user, onBack, onMenuClick }) => {
  return (
    <div className="chat-header">
      <button className="chat-header-back" onClick={onBack} aria-label="Volver">
        <IonIcon icon={arrowBackOutline} />
      </button>

      <div className="chat-header-user">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="chat-header-avatar" />
        ) : (
          <div className="chat-header-avatar-placeholder">
            <span>{user.name.charAt(0).toUpperCase()}</span>
          </div>
        )}
        {user.isOnline && <div className="chat-header-online-indicator" />}
        <div className="chat-header-info">
          <h2 className="chat-header-name">{user.name}</h2>
          {user.location && (
            <p className="chat-header-location">{user.location}</p>
          )}
        </div>
      </div>

      <button className="chat-header-menu" onClick={onMenuClick} aria-label="Menú">
        <IonIcon icon={ellipsisVertical} />
      </button>
    </div>
  );
};

export default ChatHeader;
