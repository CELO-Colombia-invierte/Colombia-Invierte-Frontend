import React from 'react';
import { Message } from '@/models/Message.model';
import { ProposalMessageCard } from './ProposalMessageCard';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUserId,
}) => {
  const isMine = message.isMine(currentUserId);
  const formattedTime = message.getFormattedTime();
  const images = message.getImages();

  if (message.type === 'PROPOSAL' && (message.proposalId || message.proposalData)) {
    return (
      <ProposalMessageCard
        proposalId={message.proposalId}
        proposal={message.proposalData}
        formattedTime={formattedTime}
        isMine={isMine}
      />
    );
  }

  return (
    <div className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
      <div className="message-bubble-content">
        {images.length > 0 && (
          <div className="message-bubble-images">
            {images.map((attachment) => (
              <img
                key={attachment.id}
                src={attachment.url}
                alt={attachment.fileName}
                className="message-bubble-image"
              />
            ))}
          </div>
        )}
        <p className="message-bubble-text">{message.text}</p>

        <span className="message-bubble-time">{formattedTime}</span>

        {message.isSending && (
          <span className="message-bubble-status sending">Enviando...</span>
        )}
        {message.hasError() && (
          <span
            className="message-bubble-status error"
            title={message.sendError}
          >
            ⚠️ Error
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
