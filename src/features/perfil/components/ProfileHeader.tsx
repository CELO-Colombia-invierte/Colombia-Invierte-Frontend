import React from 'react';
import { IonIcon } from '@ionic/react';
import { arrowBackOutline, checkmarkCircle, createOutline } from 'ionicons/icons';
import { User } from '@/models/User.model';
import './ProfileHeader.css';

interface ProfileHeaderProps {
  user: User;
  onBack: () => void;
  onEdit?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onBack, onEdit }) => {
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
      {onEdit && (
        <button className="profile-edit-btn" onClick={onEdit} type="button">
          <IonIcon icon={createOutline} />
        </button>
      )}
    </div>
  );
};

export default ProfileHeader;
