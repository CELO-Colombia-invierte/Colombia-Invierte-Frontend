import React from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  progress?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress = 0 }) => {
  return (
    <div className="loading-screen">
      <div className="loading-background">
        <div className="loading-edge loading-edge-left"></div>
        <div className="loading-content">
          <div className="loading-progress">{Math.round(progress)}%</div>
        </div>
        <div className="loading-edge loading-edge-right"></div>
      </div>
    </div>
  );
};

