import React from 'react';
import { IonIcon } from '@ionic/react';
import { ellipsisHorizontal } from 'ionicons/icons';
import { Notification } from '@/types';
import { NotificationItem } from './NotificationItem';
import './NotificationPanel.css';

interface NotificationPanelProps {
  notifications: Notification[];
  loading: boolean;
  onNotificationClick: (notification: Notification) => void;
  onSeeAll: () => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
  onInvitationResponse?: (notificationId: string, accepted: boolean) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  loading,
  onNotificationClick,
  onSeeAll,
  onMarkAllAsRead,
  onClose,
  onInvitationResponse,
}) => {
  return (
    <>
      <div className="notification-panel-backdrop" onClick={onClose} />
      <div className="notification-panel">
        <div className="notification-panel__header">
          <h3 className="notification-panel__title">Notificaciones</h3>
          <button
            className="notification-panel__menu-btn"
            onClick={onMarkAllAsRead}
            aria-label="Marcar todas como leídas"
          >
            <IonIcon icon={ellipsisHorizontal} />
          </button>
        </div>

        <div className="notification-panel__content">
          {loading ? (
            <div className="notification-panel__loading">
              <p>Cargando...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notification-panel__empty">
              <p>No tienes notificaciones</p>
            </div>
          ) : (
            <div className="notification-panel__list">
              {notifications.slice(0, 5).map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={onNotificationClick}
                  onInvitationResponse={onInvitationResponse}
                />
              ))}
            </div>
          )}
        </div>

        <button className="notification-panel__see-all" onClick={onSeeAll}>
          Ver todas
        </button>
      </div>
    </>
  );
};

export default NotificationPanel;
