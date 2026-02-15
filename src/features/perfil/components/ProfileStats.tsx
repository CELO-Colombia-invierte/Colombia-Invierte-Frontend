import React from 'react';
import './ProfileStats.css';

interface Stat {
  value: number | string;
  label: string;
}

interface ProfileStatsProps {
  stats: Stat[];
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
  return (
    <div className="profile-stats">
      {stats.map((stat, index) => (
        <div key={index} className="profile-stat">
          <div className="profile-stat-value">{stat.value}</div>
          <div className="profile-stat-label">{stat.label}</div>
        </div>
      ))}
      <div className="profile-stat-separator"></div>
      <div className="profile-stat">
        <img className='imgProvince' src="" alt="hola" />
        <h2 className="province">Colombia</h2>
      </div>
    </div>
  );
};

export default ProfileStats;





