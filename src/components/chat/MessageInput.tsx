import React, { useState } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { attachOutline, imageOutline, sendSharp } from 'ionicons/icons';
import './MessageInput.css';

interface MessageInputProps {
  onSend?: (message: string) => void;
  onTyping?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onTyping,
  placeholder = 'Tu mensaje...',
  disabled = false,
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    onTyping?.();
  };

  return (
    <div className="message-input">
      <input
        type="text"
        className="message-input-field"
        placeholder={placeholder}
        value={message}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        disabled={disabled}
      />
      <div className="message-input-actions">
        <button className="message-input-action" aria-label="Adjuntar archivo" disabled={disabled}>
          <IonIcon icon={attachOutline} />
        </button>
        <button className="message-input-action" aria-label="Adjuntar imagen" disabled={disabled}>
          <IonIcon icon={imageOutline} />
        </button>
        <button
          className="message-input-send"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          aria-label="Enviar mensaje"
        >
          {disabled ? (
            <IonSpinner name="crescent" />
          ) : (
            <IonIcon icon={sendSharp} />
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
