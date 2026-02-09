import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { notificationsOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useNotifications } from '@/hooks/use-notifications';
import { Notification } from '@/types';
import { NotificationPanel } from './NotificationPanel';
import './NotificationBell.css';

export const NotificationBell: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const history = useHistory();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch,
  } = useNotifications();

  const handleBellClick = () => {
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    setIsPanelOpen(false);

    if (notification.action_url) {
      history.push(notification.action_url);
    }
  };

  const handleSeeAll = () => {
    setIsPanelOpen(false);
    history.push('/notificaciones');
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleInvitationResponse = async (
    notificationId: string,
    _accepted: boolean
  ) => {
    // Marcar la notificación como leída después de responder
    await markAsRead(notificationId);
    // Refrescar las notificaciones para obtener el estado actualizado
    await refetch();
  };

  return (
    <>
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

      {isPanelOpen && (
        <NotificationPanel
          notifications={notifications}
          loading={loading}
          onNotificationClick={handleNotificationClick}
          onSeeAll={handleSeeAll}
          onMarkAllAsRead={handleMarkAllAsRead}
          onClose={handleClosePanel}
          onInvitationResponse={handleInvitationResponse}
        />
      )}
    </>
  );
};

export default NotificationBell;
