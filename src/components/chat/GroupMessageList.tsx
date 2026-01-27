import React from 'react';
import { Message } from '@/models/Message.model';
import { Conversation } from '@/models/Conversation.model';
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
  // Agrupar mensajes consecutivos del mismo usuario
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

  // Generar color consistente basado en el ID del usuario
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

  // Obtener info de usuarios escribiendo (maximo 3)
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
            {/* Avatar solo para mensajes de otros en grupos */}
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
              {/* Nombre solo para el primer mensaje del grupo en chats grupales */}
              {!isMine && isGroup && (
                <span
                  className="message-group-sender-name"
                  style={{ color: userColor }}
                >
                  {senderInfo.name}
                </span>
              )}

              {/* Mensajes del grupo */}
              {group.messages.map((message) => (
                <div
                  key={message.id}
                  className={`group-message-bubble ${isMine ? 'mine' : 'theirs'}`}
                >
                  {/* Imagenes */}
                  {message.getImages().length > 0 && (
                    <div className="group-message-images">
                      {message.getImages().map((attachment) => (
                        <img
                          key={attachment.id}
                          src={attachment.url}
                          alt={attachment.fileName}
                          className="group-message-image"
                        />
                      ))}
                    </div>
                  )}

                  {/* Texto */}
                  {message.text && (
                    <p className="group-message-text">{message.text}</p>
                  )}

                  {/* Hora */}
                  <span className="group-message-time">
                    {message.getFormattedTime()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Indicador de typing */}
      {typingUsersInfo.length > 0 && (
        <div className="message-group theirs typing-indicator-group">
          {/* Avatares apilados si hay multiples usuarios escribiendo */}
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
