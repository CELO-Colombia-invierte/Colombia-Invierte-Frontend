import React from 'react';
import { Notification, NotificationType } from '@/types';
import './NotificationItem.css';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.NEW_MESSAGE:
      return '💬';
    case NotificationType.PROJECT_INVITATION:
      return '📨';
    case NotificationType.PROJECT_INVITATION_ACCEPTED:
      return '✅';
    case NotificationType.PROJECT_INVITATION_DECLINED:
      return '❌';
    case NotificationType.PAYMENT_REMINDER:
      return '⏰';
    case NotificationType.PAYMENT_RECEIVED:
      return '💰';
    case NotificationType.PAYMENT_LATE:
      return '⚠️';
    case NotificationType.SYSTEM_ANNOUNCEMENT:
      return '📢';
    default:
      return '🔔';
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
}) => {
  const handleClick = () => {
    onClick(notification);
  };

  return (
    <div
      className={`notification-item ${!notification.is_read ? 'notification-item--unread' : ''}`}
      onClick={handleClick}
    >
      <div className="notification-item__avatar">
        {notification.actor?.avatar_url ? (
          <img
            src={notification.actor.avatar_url}
            alt={notification.actor.display_name}
            className="notification-item__avatar-img"
          />
        ) : (
          <div className="notification-item__avatar-placeholder">
            {notification.actor?.display_name?.charAt(0).toUpperCase() || '?'}
          </div>
        )}
        <span className="notification-item__icon">
          {getNotificationIcon(notification.type)}
        </span>
      </div>

      <div className="notification-item__content">
        <p className="notification-item__title">
          {notification.actor?.display_name || 'Sistema'}
        </p>
        <p className="notification-item__body">{notification.body}</p>
      </div>

      <div className="notification-item__meta">
        <span className="notification-item__date">
          {formatDate(notification.created_at)}
        </span>
        <span
          className={`notification-item__indicator ${
            notification.is_read
              ? 'notification-item__indicator--read'
              : 'notification-item__indicator--unread'
          }`}
        />
      </div>
    </div>
  );
};

export default NotificationItem;
