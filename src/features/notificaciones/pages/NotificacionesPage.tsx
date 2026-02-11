import React, { useState } from 'react';
import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import './NotificacionesPage.css';

const NotificacionesPage: React.FC = () => {
  const history = useHistory();
  const { notifications, loading, markAllAsRead } = useNotifications();
  const [hasMarkedAllAsRead, setHasMarkedAllAsRead] = useState(false);

  const handleSeeAllClick = async () => {
    await markAllAsRead();
    setHasMarkedAllAsRead(true);
  };

  const handleNotificationClick = (notification: any) => {
    if (notification.action_url) {
      history.push(notification.action_url);
    }
  };

  const handleBack = () => {
    history.goBack();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButton slot="start" fill="clear" onClick={handleBack}>
            <IonIcon icon={arrowBack} />
          </IonButton>
          <IonTitle>Notificaciones</IonTitle>
          {notifications.length > 0 && !hasMarkedAllAsRead && (
            <IonButton slot="end" fill="clear" size="small" onClick={handleSeeAllClick}>
              Marcar todo como leído
            </IonButton>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="notificaciones-page-content">
        {loading && (
          <div className="notificaciones-page__loading">
            <p>Cargando notificaciones...</p>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="notificaciones-page__empty">
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
              />
            ))}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default NotificacionesPage;
