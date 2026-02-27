import React from 'react';
import { IonIcon } from '@ionic/react';
import { scanOutline } from 'ionicons/icons';
import './SettingsHeader.css';

interface SettingsHeaderProps {
  title: string;
  onBack?: () => void;
  showQRButton?: boolean;
  onQRClick?: () => void;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  title,
  showQRButton = false,
  onQRClick,
}) => {
  return (
    <div className="settings-header">
      <h1 className="settings-header-title">{title}</h1>

      {showQRButton && onQRClick ? (
        <button className="settings-header-qr" onClick={onQRClick}>
          <IonIcon icon={scanOutline} />
        </button>
      ) : (
        <div style={{ width: '40px' }} />
      )}
    </div>
  );
};

export default SettingsHeader;
