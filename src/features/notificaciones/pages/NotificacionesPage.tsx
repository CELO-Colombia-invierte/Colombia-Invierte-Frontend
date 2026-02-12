import React from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
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
    // Marcar como leído si no lo está
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navegar si tiene action_url
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
      <IonHeader className="notificaciones-header">
        <IonToolbar>
          <IonButton
            slot="start"
            fill="clear"
            onClick={handleBack}
            className="notificaciones-back-btn"
          >
            <IonIcon icon={arrowBack} />
          </IonButton>
          <IonTitle>Notificaciones</IonTitle>
          {unreadCount > 0 && (
            <IonButton
              slot="end"
              fill="clear"
              size="small"
              onClick={handleMarkAllAsRead}
              className="notificaciones-mark-all-btn"
            >
              Marcar todo
            </IonButton>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="notificaciones-page-content">
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
