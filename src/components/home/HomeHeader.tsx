import React from 'react';
import { NotificationBell } from '@/components/notifications';
import './HomeHeader.css';

interface HomeHeaderProps {
  userName: string;
  userAvatar?: string;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName,
  userAvatar,
}) => {
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
      <NotificationBell />
    </div>
  );
};

export default HomeHeader;
