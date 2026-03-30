import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { notificationsOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationPanel } from './NotificationPanel';
import { Notification } from '@/types';
import './NotificationBell.css';

export const NotificationBell: React.FC = () => {
  const history = useHistory();
  const [showPanel, setShowPanel] = useState(false);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch } = useNotifications();

  const handleBellClick = () => {
    setShowPanel(true);
  };

  const handleClose = () => {
    setShowPanel(false);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    setShowPanel(false);
    if (notification.action_url) {
      history.push(notification.action_url);
    }
  };

  const handleSeeAll = () => {
    setShowPanel(false);
    history.push('/notificaciones');
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleInvitationResponse = async (notificationId: string) => {
    await markAsRead(notificationId);
    await refetch();
  };

  return (
    <div className="notification-bell-wrapper">
      <button
        className="notification-bell"
        onClick={handleBellClick}
        aria-label="Notificaciones"
      >
        <IonIcon icon={notificationsOutline} />
        {unreadCount > 0 && (
          <span className="notification-bell__badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <NotificationPanel
          notifications={notifications}
          loading={loading}
          onNotificationClick={handleNotificationClick}
          onSeeAll={handleSeeAll}
          onMarkAllAsRead={handleMarkAllAsRead}
          onClose={handleClose}
          onInvitationResponse={handleInvitationResponse}
        />
      )}
    </div>
  );
};

export default NotificationBell;
