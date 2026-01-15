import React from 'react';
import './SettingsToggle.css';

interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const SettingsToggle: React.FC<SettingsToggleProps> = ({
  label,
  description,
  checked,
  onChange,
}) => {
  const handleToggle = () => {
    onChange(!checked);
  };

  return (
    <div className="settings-toggle">
      <div className="settings-toggle-content">
        <span className="settings-toggle-label">{label}</span>
        {description && (
          <span className="settings-toggle-description">{description}</span>
        )}
      </div>

      <div
        className={`settings-toggle-switch ${checked ? 'settings-toggle-switch-active' : ''}`}
        onClick={handleToggle}
      >
        <div className="settings-toggle-switch-knob" />
      </div>
    </div>
  );
};

export default SettingsToggle;
