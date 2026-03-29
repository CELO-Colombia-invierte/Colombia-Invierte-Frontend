import React from 'react';
import { IonIcon } from '@ionic/react';
import {
  arrowBackOutline,
  peopleCircle,
} from 'ionicons/icons';
import './GroupChatHeader.css';

interface GroupChatHeaderProps {
  title: string;
  subtitle?: string;
  isGroup: boolean;
  avatarUrl?: string;
  initials: string;
  membersCount?: number;
  onBack?: () => void;
  onHeaderClick?: () => void;
}

export const GroupChatHeader: React.FC<GroupChatHeaderProps> = ({
  title,
  subtitle,
  isGroup,
  avatarUrl,
  initials,
  membersCount,
  onBack,
  onHeaderClick,
}) => {
  return (
    <div className="group-chat-header">
      <button
        className="header-back-btn"
        onClick={onBack}
        aria-label="Volver"
      >
        <IonIcon icon={arrowBackOutline} />
      </button>

      <div
        className="group-chat-header-user"
        onClick={onHeaderClick}
        style={{ cursor: onHeaderClick ? 'pointer' : 'default' }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={title}
            className="group-chat-header-avatar"
          />
        ) : isGroup ? (
          <div className="group-chat-header-avatar-group">
            <IonIcon icon={peopleCircle} />
          </div>
        ) : (
          <div className="group-chat-header-avatar-placeholder">
            <span>{initials}</span>
          </div>
        )}

        <div className="group-chat-header-info">
          <h2 className="group-chat-header-name">{title}</h2>
          {isGroup && membersCount ? (
            <p className="group-chat-header-members">{membersCount} miembros</p>
          ) : subtitle ? (
            <p className="group-chat-header-subtitle">{subtitle}</p>
          ) : null}
        </div>
      </div>

    </div>
  );
};

export default GroupChatHeader;
