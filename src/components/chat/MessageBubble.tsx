import React from 'react';
import { Message } from '@/models/Message.model';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUserId,
}) => {
  // Usamos los métodos del modelo
  const isMine = message.isMine(currentUserId);
  const formattedTime = message.getFormattedTime();
  const images = message.getImages();

  return (
    <div className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
      <div className="message-bubble-content">
        {/* Mostrar imágenes si existen */}
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

        {/* Texto del mensaje */}
        <p className="message-bubble-text">{message.text}</p>

        {/* Hora formateada */}
        <span className="message-bubble-time">{formattedTime}</span>

        {/* Indicadores de estado */}
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
