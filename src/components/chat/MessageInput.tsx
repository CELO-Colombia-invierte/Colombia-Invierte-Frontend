import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { attachOutline, imageOutline, sendSharp } from 'ionicons/icons';
import './MessageInput.css';

interface MessageInputProps {
  onSend?: (message: string) => void;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  placeholder = 'Tú mensaje...'
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend?.(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input">
      <input
        type="text"
        className="message-input-field"
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <div className="message-input-actions">
        <button className="message-input-action" aria-label="Adjuntar archivo">
          <IonIcon icon={attachOutline} />
        </button>
        <button className="message-input-action" aria-label="Adjuntar imagen">
          <IonIcon icon={imageOutline} />
        </button>
        <button
          className="message-input-send"
          onClick={handleSend}
          aria-label="Enviar mensaje"
        >
          <IonIcon icon={sendSharp} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
