import React from 'react';
import { ChatUser } from '@/types';
import { ChatListItem } from './ChatListItem';
import './ChatList.css';

interface ChatListProps {
  users: ChatUser[];
  onUserClick?: (user: ChatUser) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ users, onUserClick }) => {
  return (
    <div className="chat-list">
      {users.length > 0 ? (
        users.map((user) => (
          <ChatListItem
            key={user.id}
            user={user}
            onClick={() => onUserClick?.(user)}
          />
        ))
      ) : (
        <div className="chat-list-empty">
          <p>No hay conversaciones</p>
        </div>
      )}
    </div>
  );
};

export default ChatList;
