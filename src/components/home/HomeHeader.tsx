import React from 'react';
import { IonIcon } from '@ionic/react';
import { notificationsOutline } from 'ionicons/icons';
import './HomeHeader.css';

interface HomeHeaderProps {
  userName: string;
  userAvatar?: string;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ userName, userAvatar }) => {
  return (
    <div className="home-header">
      <div className="home-header-user">
        {userAvatar ? (
          <img src={userAvatar} alt={userName} className="home-header-avatar" />
        ) : (
          <div className="home-header-avatar-placeholder">
            <span>{userName.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <div className="home-header-greeting">
          <p className="home-header-welcome">Bienvenida</p>
          <h2 className="home-header-name">{userName}</h2>
        </div>
      </div>
      <button className="home-header-notification" aria-label="Notificaciones">
        <IonIcon icon={notificationsOutline} />
      </button>
    </div>
  );
};

export default HomeHeader;
