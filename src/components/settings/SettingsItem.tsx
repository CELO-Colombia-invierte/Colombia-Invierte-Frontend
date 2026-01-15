import React from 'react';
import { IonIcon } from '@ionic/react';
import { chevronForwardOutline } from 'ionicons/icons';
import './SettingsItem.css';

interface SettingsItemProps {
  label: string;
  value?: string;
  onClick?: () => void;
  showChevron?: boolean;
  icon?: string;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  label,
  value,
  onClick,
  showChevron = true,
  icon,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`settings-item ${onClick ? 'settings-item-clickable' : ''}`}
      onClick={handleClick}
    >
      <div className="settings-item-left">
        {icon && (
          <div className="settings-item-icon">
            <IonIcon icon={icon} />
          </div>
        )}
        <span className="settings-item-label">{label}</span>
      </div>

      <div className="settings-item-right">
        {value && <span className="settings-item-value">{value}</span>}
        {showChevron && onClick && (
          <IonIcon
            icon={chevronForwardOutline}
            className="settings-item-chevron"
          />
        )}
      </div>
    </div>
  );
};

export default SettingsItem;
