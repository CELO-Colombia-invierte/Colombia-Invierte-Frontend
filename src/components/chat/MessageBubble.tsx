import React from 'react';
import { Message } from '@/types';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  return (
    <div className={`message-bubble ${message.isMine ? 'mine' : 'theirs'}`}>
      <div className="message-bubble-content">
        <p className="message-bubble-text">{message.text}</p>
        <span className="message-bubble-time">{message.timestamp}</span>
      </div>
    </div>
  );
};

export default MessageBubble;
