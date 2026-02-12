import React from 'react';
import { IonIcon } from '@ionic/react';
import {
  arrowBackOutline,
  ellipsisVertical,
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
  onMenuClick?: () => void;
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
  onMenuClick,
  onHeaderClick,
}) => {
  return (
    <div className="group-chat-header">
      <button
        className="group-chat-header-back"
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

      <button
        className="group-chat-header-menu"
        onClick={onMenuClick}
        aria-label="Menú"
      >
        <IonIcon icon={ellipsisVertical} />
      </button>
    </div>
  );
};

export default GroupChatHeader;
