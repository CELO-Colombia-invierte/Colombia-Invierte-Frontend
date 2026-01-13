import React from 'react';
import { ChatUser } from '@/types';
import './ChatListItem.css';

interface ChatListItemProps {
  user: ChatUser;
  onClick?: () => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({ user, onClick }) => {
  return (
    <div className="chat-list-item" onClick={onClick}>
      <div className="chat-list-item-avatar-wrapper">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="chat-list-item-avatar" />
        ) : (
          <div className="chat-list-item-avatar-placeholder">
            <span>{user.name.charAt(0).toUpperCase()}</span>
          </div>
        )}
        {user.isOnline && <div className="chat-list-item-online-indicator" />}
      </div>

      <div className="chat-list-item-content">
        <div className="chat-list-item-header">
          <h3 className="chat-list-item-name">{user.name}</h3>
          {user.lastMessageTime && (
            <span className="chat-list-item-time">{user.lastMessageTime}</span>
          )}
        </div>
        <div className="chat-list-item-footer">
          {user.location && (
            <p className="chat-list-item-location">{user.location}</p>
          )}
          {user.unreadCount !== undefined && user.unreadCount > 0 && (
            <div className="chat-list-item-badge">{user.unreadCount}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
