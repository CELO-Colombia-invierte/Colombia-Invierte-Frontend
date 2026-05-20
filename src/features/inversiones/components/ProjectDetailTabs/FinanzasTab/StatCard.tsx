import React from 'react';

interface StatCardProps {
  label: string;
  value?: React.ReactNode;
  badge?: string;
  badgeClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, badge, badgeClass }) => (
  <div className="chain-stat-card">
    <span className="chain-stat-label">{label}</span>
    {badge !== undefined ? (
      <span className={`chain-stat-badge ${badgeClass ?? ''}`}>{badge}</span>
    ) : (
      <span className="chain-stat-value">{value}</span>
    )}
  </div>
);
