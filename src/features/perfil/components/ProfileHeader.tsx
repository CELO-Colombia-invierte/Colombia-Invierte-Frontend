import React from 'react';
import { IonIcon } from '@ionic/react';
import { arrowBackOutline, checkmarkCircle } from 'ionicons/icons';
import { User } from '@/models/User.model';
import './ProfileHeader.css';

interface ProfileHeaderProps {
  user: User;
  onBack: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onBack }) => {
  return (
    <div className="profile-header">
      <button className="profile-back-btn" onClick={onBack} type="button">
        <IonIcon icon={arrowBackOutline} />
      </button>
      <div className="profile-username-header">
        <span className="profile-username-text">{user.username}</span>
        {user.verified && (
          <IonIcon icon={checkmarkCircle} className="verified-icon" />
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;





