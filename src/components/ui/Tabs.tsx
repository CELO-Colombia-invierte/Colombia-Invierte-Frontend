import React from 'react';
import './Tabs.css';

export interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <div className={`tabs-container ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          type="button"
        >
          <span className="tab-label-wrapper">
            <span className="tab-label">{tab.label}</span>
          </span>
          {activeTab === tab.id && <div className="tab-indicator" />}
        </button>
      ))}
    </div>
  );
};

export default Tabs;

