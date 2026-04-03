import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { documentOutline, downloadOutline, closeOutline } from 'ionicons/icons';
import { Message, MessageAttachment } from '@/models/Message.model';
import { ProposalMessageCard } from './ProposalMessageCard';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
}

const ImageViewer: React.FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => (
  <div className="image-viewer-overlay" onClick={onClose}>
    <button className="image-viewer-close" onClick={onClose}>
      <IonIcon icon={closeOutline} />
    </button>
    <img src={url} alt="" className="image-viewer-img" onClick={(e) => e.stopPropagation()} />
  </div>
);

const AttachmentRenderer: React.FC<{ attachment: MessageAttachment; onImageClick: (url: string) => void }> = ({ attachment, onImageClick }) => {
  if (attachment.isImage()) {
    return (
      <img
        src={attachment.url}
        alt={attachment.fileName}
        className="message-bubble-image"
        onClick={() => onImageClick(attachment.url)}
      />
    );
  }

  if (attachment.isVideo()) {
    return (
      <video
        src={attachment.url}
        controls
        preload="metadata"
        className="message-bubble-video"
      />
    );
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="message-bubble-document"
    >
      <IonIcon icon={documentOutline} className="message-bubble-document-icon" />
      <div className="message-bubble-document-info">
        <span className="message-bubble-document-name">{attachment.fileName}</span>
        <span className="message-bubble-document-size">{attachment.getFormattedSize()}</span>
      </div>
      <IonIcon icon={downloadOutline} className="message-bubble-document-download" />
    </a>
  );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUserId,
}) => {
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const isMine = message.isMine(currentUserId);
  const formattedTime = message.getFormattedTime();

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

  const allImages = message.hasAttachments() && message.attachments.every((a) => a.isImage());
  const isImageOnly = allImages && (!message.text || message.text === 'Archivo adjunto');

  return (
    <>
      <div className={`message-bubble ${isMine ? 'mine' : 'theirs'} ${isImageOnly ? 'image-only' : ''}`}>
        <div className="message-bubble-content">
          {message.hasAttachments() && (
            <div className="message-bubble-attachments">
              {message.attachments.map((attachment) => (
                <AttachmentRenderer key={attachment.id} attachment={attachment} onImageClick={setViewerImage} />
              ))}
            </div>
          )}
          {message.text && !isImageOnly && <p className="message-bubble-text">{message.text}</p>}
          <span className="message-bubble-time">{formattedTime}</span>
          {message.isSending && (
            <span className="message-bubble-status sending">Enviando...</span>
          )}
          {message.hasError() && (
            <span className="message-bubble-status error" title={message.sendError}>
              Error
            </span>
          )}
        </div>
      </div>
      {viewerImage && <ImageViewer url={viewerImage} onClose={() => setViewerImage(null)} />}
    </>
  );
};

export default MessageBubble;
