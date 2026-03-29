import React, { useState, useRef } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import {
  attachOutline,
  imageOutline,
  sendSharp,
  closeCircle,
  documentOutline,
  videocamOutline,
} from 'ionicons/icons';
import './MessageInput.css';

const MAX_FILE_SIZE = 50 * 1024 * 1024; 

const ACCEPTED_IMAGES = 'image/jpeg,image/png,image/webp,image/gif';
const ACCEPTED_ALL =
  'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

interface MessageInputProps {
  onSend?: (message: string, files?: File[]) => void;
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    setError(null);

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" excede el limite de 50MB`);
        continue;
      }
      newFiles.push(file);
      if (file.type.startsWith('image/')) {
        newPreviews.push(URL.createObjectURL(file));
      } else {
        newPreviews.push('');
      }
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    if (previews[index]) {
      URL.revokeObjectURL(previews[index]);
    }
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if ((!message.trim() && selectedFiles.length === 0) || disabled) return;
    onSend?.(message, selectedFiles.length > 0 ? selectedFiles : undefined);
    setMessage('');
    previews.forEach((p) => { if (p) URL.revokeObjectURL(p); });
    setSelectedFiles([]);
    setPreviews([]);
    setError(null);
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

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('video/')) return videocamOutline;
    return documentOutline;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canSend = (message.trim() || selectedFiles.length > 0) && !disabled;

  return (
    <div className="message-input">
      {selectedFiles.length > 0 && (
        <div className="message-input-previews">
          {selectedFiles.map((file, index) => (
            <div key={index} className="message-input-preview-item">
              {previews[index] ? (
                <img src={previews[index]} alt={file.name} className="message-input-preview-img" />
              ) : (
                <div className="message-input-preview-file">
                  <IonIcon icon={getFileIcon(file)} />
                  <span className="message-input-preview-name">{file.name}</span>
                  <span className="message-input-preview-size">{formatSize(file.size)}</span>
                </div>
              )}
              <button className="message-input-preview-remove" onClick={() => removeFile(index)}>
                <IonIcon icon={closeCircle} />
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <div className="message-input-error">{error}</div>}
      <div className="message-input-row">
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
          <button
            className="message-input-action"
            aria-label="Adjuntar archivo"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
          >
            <IonIcon icon={attachOutline} />
          </button>
          <button
            className="message-input-action"
            aria-label="Adjuntar imagen"
            disabled={disabled}
            onClick={() => imageInputRef.current?.click()}
          >
            <IonIcon icon={imageOutline} />
          </button>
          <button
            className="message-input-send"
            onClick={handleSend}
            disabled={!canSend}
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
      <input
        ref={imageInputRef}
        type="file"
        accept={ACCEPTED_IMAGES}
        multiple
        hidden
        onChange={(e) => { handleFilesSelected(e.target.files); e.target.value = ''; }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_ALL}
        multiple
        hidden
        onChange={(e) => { handleFilesSelected(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
};

export default MessageInput;
