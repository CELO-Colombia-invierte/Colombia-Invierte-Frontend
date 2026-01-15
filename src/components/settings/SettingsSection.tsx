import React from 'react';
import './SettingsSection.css';

interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
}) => {
  return (
    <div className="settings-section">
      {title && <h3 className="settings-section-title">{title}</h3>}
      <div className="settings-section-content">{children}</div>
    </div>
  );
};

export default SettingsSection;
