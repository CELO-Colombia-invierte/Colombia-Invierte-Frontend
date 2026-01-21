import React from 'react';
import { IonIcon } from '@ionic/react';
import {
  trendingUpOutline,
  calendarOutline,
  cashOutline,
} from 'ionicons/icons';
import './InvestmentComponents.css';

interface StatCard {
  icon: string;
  label: string;
  value: string;
  color?: string;
}

interface InvestmentStatsProps {
  stats: StatCard[];
}

export const InvestmentStats: React.FC<InvestmentStatsProps> = ({ stats }) => {
  const getIcon = (iconName: string) => {
    const icons: { [key: string]: string } = {
      trendingUp: trendingUpOutline,
      calendar: calendarOutline,
      cash: cashOutline,
    };
    return icons[iconName] || cashOutline;
  };

  return (
    <div className="investment-stats-container">
      {stats.map((stat, index) => (
        <div key={index} className="investment-stat-card">
          <div
            className="stat-icon"
            style={{ color: stat.color || '#667eea' }}
          >
            <IonIcon icon={getIcon(stat.icon)} />
          </div>
          <div className="stat-content">
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value">{stat.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

