import React from 'react';
import {
  IonContent,
  IonPage,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import { arrowBack, ellipsisHorizontal } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { Notification } from '@/types';
import './NotificacionesPage.css';

const NotificacionesPage: React.FC = () => {
  const history = useHistory();
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch,
  } = useNotifications();

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.action_url) {
      history.push(notification.action_url);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleBack = () => {
    history.goBack();
  };

  const handleInvitationResponse = async (notificationId: string) => {
    await markAsRead(notificationId);
    await refetch();
  };

  return (
    <IonPage>
      <IonContent fullscreen className="notificaciones-page-content">
        <div className="notificaciones-page__header">
          <button className="notificaciones-page__back-btn" onClick={handleBack}>
            <IonIcon icon={arrowBack} />
          </button>
          <h1 className="notificaciones-page__title">Notificaciones</h1>
          {unreadCount > 0 && (
            <button className="notificaciones-page__menu-btn" onClick={handleMarkAllAsRead}>
              <IonIcon icon={ellipsisHorizontal} />
            </button>
          )}
        </div>

        {loading && (
          <div className="notificaciones-page__loading">
            <IonSpinner name="crescent" />
            <p>Cargando...</p>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="notificaciones-page__empty">
            <span className="notificaciones-page__empty-icon">🔔</span>
            <p>No tienes notificaciones</p>
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <div className="notificaciones-page__list">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
                onInvitationResponse={handleInvitationResponse}
              />
            ))}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default NotificacionesPage;
