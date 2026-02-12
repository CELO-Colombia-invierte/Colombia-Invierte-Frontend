import React from 'react';
import { IonIcon } from '@ionic/react';
import { notificationsOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useNotifications } from '@/hooks/use-notifications';
import './NotificationBell.css';

export const NotificationBell: React.FC = () => {
  const history = useHistory();
  const { unreadCount } = useNotifications();

  const handleBellClick = () => {
    history.push('/notificaciones');
  };

  return (
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
  );
};

export default NotificationBell;
