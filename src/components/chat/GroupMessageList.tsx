import React, { useEffect, useRef } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { documentOutline, downloadOutline } from 'ionicons/icons';
import { Message } from '@/models/Message.model';
import { Conversation } from '@/models/Conversation.model';
import { ProposalMessageCard } from './ProposalMessageCard';
import './GroupMessageList.css';

interface TypingUser {
  id: string;
  name: string;
}

interface GroupMessageListProps {
  messages: Message[];
  currentUserId: string;
  isGroup: boolean;
  conversation?: Conversation | null;
  typingUsers?: TypingUser[];
}

export const GroupMessageList: React.FC<GroupMessageListProps> = ({
  messages,
  currentUserId,
  isGroup,
  conversation,
  typingUsers = [],
}) => {
  const endRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: isInitialLoad.current ? 'instant' : 'smooth' });
    isInitialLoad.current = false;
  }, [messages]);

  const groupedMessages = messages.reduce((acc, message, index) => {
    const prevMessage = messages[index - 1];
    const isSameUser = prevMessage && prevMessage.senderId === message.senderId;
    const isWithin5Minutes = prevMessage &&
      (message.createdAt.getTime() - prevMessage.createdAt.getTime()) < 5 * 60 * 1000;

    if (isSameUser && isWithin5Minutes) {
      acc[acc.length - 1].messages.push(message);
    } else {
      acc.push({
        senderId: message.senderId,
        messages: [message],
      });
    }
    return acc;
  }, [] as { senderId: string; messages: Message[] }[]);

  const getSenderInfo = (senderId: string) => {
    if (!conversation) return { name: 'Usuario', avatarUrl: undefined, initials: 'U' };

    const member = conversation.members.find(m => m.userId === senderId);
    if (!member) return { name: 'Usuario', avatarUrl: undefined, initials: 'U' };

    const user = member.user;
    return {
      name: user?.getDisplayName() || user?.username || 'Usuario',
      avatarUrl: user?.getAvatarUrl(),
      initials: user?.getInitials() || 'U',
    };
  };

  const getColorForUser = (userId: string) => {
    const colors = [
      '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3',
      '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ff9800',
      '#ff5722', '#795548', '#607d8b',
    ];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };


  const getTypingUsersInfo = () => {
    if (typingUsers.length === 0) return [];
    
    return typingUsers.slice(0, 3).map(typingUser => {
      const member = conversation?.members.find(m => m.userId === typingUser.id);
      const user = member?.user;
      
      return {
        id: typingUser.id,
        name: typingUser.name,
        avatarUrl: user?.getAvatarUrl(),
        initials: user?.getInitials() || typingUser.name.charAt(0).toUpperCase(),
        color: getColorForUser(typingUser.id),
      };
    });
  };

  if (messages.length === 0 && typingUsers.length === 0) {
    return (
      <div className="group-message-list-empty">
        <p>No hay mensajes</p>
        <span>Envia el primer mensaje</span>
      </div>
    );
  }

  const typingUsersInfo = getTypingUsersInfo();

  return (
    <div className="group-message-list">
      {groupedMessages.map((group, groupIndex) => {
        const isMine = group.senderId === currentUserId;
        const senderInfo = getSenderInfo(group.senderId);
        const userColor = getColorForUser(group.senderId);

        return (
          <div
            key={groupIndex}
            className={`message-group ${isMine ? 'mine' : 'theirs'}`}
          >
           
            {!isMine && isGroup && (
              <div className="message-group-avatar">
                {senderInfo.avatarUrl ? (
                  <img src={senderInfo.avatarUrl} alt={senderInfo.name} />
                ) : (
                  <div
                    className="message-group-avatar-placeholder"
                    style={{ background: userColor }}
                  >
                    {senderInfo.initials}
                  </div>
                )}
              </div>
            )}

            <div className="message-group-content">
             
              {!isMine && isGroup && (
                <span className="message-group-sender-name">
                  {senderInfo.name}
                </span>
              )}

              
              {group.messages.map((message) => {
                if (message.type === 'PROPOSAL' && (message.proposalId || message.proposalData)) {
                  return (
                    <ProposalMessageCard
                      key={message.id}
                      proposalId={message.proposalId}
                      proposal={message.proposalData}
                      formattedTime={message.getFormattedTime()}
                      isMine={isMine}
                    />
                  );
                }

                return (
                  <div
                    key={message.id}
                    className={`group-message-bubble ${isMine ? 'mine' : 'theirs'}`}
                  >

                    {message.hasAttachments() && (
                      <div className="group-message-attachments">
                        {message.attachments.map((attachment) => {
                          const isUploading = message.isSending;

                          if (attachment.isImage()) {
                            return (
                              <div key={attachment.id} className="group-message-attachment-wrapper">
                                {isUploading ? (
                                  <img
                                    src={attachment.url}
                                    alt={attachment.fileName}
                                    className="group-message-image"
                                  />
                                ) : (
                                  <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                    <img
                                      src={attachment.url}
                                      alt={attachment.fileName}
                                      className="group-message-image"
                                    />
                                  </a>
                                )}
                                {isUploading && (
                                  <div className="group-message-upload-overlay">
                                    <IonSpinner name="crescent" className="group-message-upload-spinner" />
                                  </div>
                                )}
                              </div>
                            );
                          }
                          if (attachment.isVideo()) {
                            return (
                              <div key={attachment.id} className="group-message-attachment-wrapper">
                                <div className="group-message-video-placeholder">
                                  <IonIcon icon={documentOutline} />
                                  <span>{attachment.fileName}</span>
                                </div>
                                {isUploading && (
                                  <div className="group-message-upload-overlay">
                                    <IonSpinner name="crescent" className="group-message-upload-spinner" />
                                  </div>
                                )}
                                {!isUploading && (
                                  <video
                                    src={attachment.url}
                                    controls
                                    preload="metadata"
                                    className="group-message-video"
                                  />
                                )}
                              </div>
                            );
                          }
                          return (
                            <div key={attachment.id} className="group-message-attachment-wrapper">
                              {isUploading ? (
                                <div className="group-message-document uploading">
                                  <IonIcon icon={documentOutline} className="group-message-document-icon" />
                                  <div className="group-message-document-info">
                                    <span className="group-message-document-name">{attachment.fileName}</span>
                                    <span className="group-message-document-size">{attachment.getFormattedSize()}</span>
                                  </div>
                                  <IonSpinner name="crescent" className="group-message-upload-spinner-small" />
                                </div>
                              ) : (
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group-message-document"
                                >
                                  <IonIcon icon={documentOutline} className="group-message-document-icon" />
                                  <div className="group-message-document-info">
                                    <span className="group-message-document-name">{attachment.fileName}</span>
                                    <span className="group-message-document-size">{attachment.getFormattedSize()}</span>
                                  </div>
                                  <IonIcon icon={downloadOutline} className="group-message-document-download" />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                  
                    {message.text && (
                      <p className="group-message-text">{message.text}</p>
                    )}

                    <div className="group-message-footer">
                      {message.isSending && (
                        <span className="group-message-status sending">Enviando...</span>
                      )}
                      {message.hasError() && (
                        <span className="group-message-status error">{message.sendError}</span>
                      )}
                      <span className="group-message-time">
                        {message.getFormattedTime()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

     
      <div ref={endRef} />

    
      {typingUsersInfo.length > 0 && (
        <div className="message-group theirs typing-indicator-group">
      
          {isGroup && (
            <div className="typing-avatars-stack">
              {typingUsersInfo.map((userInfo) => (
                <div key={userInfo.id} className="typing-avatar-stacked">
                  {userInfo.avatarUrl ? (
                    <img src={userInfo.avatarUrl} alt={userInfo.name} />
                  ) : (
                    <div
                      className="typing-avatar-placeholder-stacked"
                      style={{ background: userInfo.color }}
                    >
                      {userInfo.initials}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="message-group-content">
            <div className="typing-indicator-bubble">
              <div className="typing-dots">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupMessageList;
