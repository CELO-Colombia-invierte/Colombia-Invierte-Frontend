import React from 'react';
import { IonIcon } from '@ionic/react';
import { arrowBackOutline, shareOutline } from 'ionicons/icons';
import './InvestmentComponents.css';

interface InvestmentHeaderProps {
  projectName: string;
  projectType: 'natillera' | 'tokenizacion';
  coverImage?: string;
  gradient?: string;
  onBack: () => void;
  onShare?: () => void;
}

export const InvestmentHeader: React.FC<InvestmentHeaderProps> = ({
  projectName,
  projectType,
  coverImage,
  gradient,
  onBack,
  onShare,
}) => {
  return (
    <div className="investment-header">
      <div
        className="investment-header-image"
        style={{
          background: coverImage
            ? `url(${coverImage}) center/cover`
            : gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div className="investment-header-overlay" />
        <div className="investment-header-actions">
          <button className="header-action-btn" onClick={onBack}>
            <IonIcon icon={arrowBackOutline} />
          </button>
          {onShare && (
            <button className="header-action-btn" onClick={onShare}>
              <IonIcon icon={shareOutline} />
            </button>
          )}
        </div>
      </div>
      <div className="investment-header-info">
        <span className="investment-type-badge">
          {projectType === 'natillera' ? '💰 Natillera' : '🏢 Tokenización'}
        </span>
        <h1 className="investment-project-name">{projectName}</h1>
      </div>
    </div>
  );
};

