import React from 'react';
import { IonIcon } from '@ionic/react';
import { arrowBackOutline, shareSocialOutline } from 'ionicons/icons';
import './InvestmentComponents.css';

interface InvestmentHeaderProps {
  projectName: string;
  projectType?: 'natillera' | 'tokenizacion';
  coverImage?: string;
  gradient?: string;
  onBack: () => void;
  onShare?: () => void;
}

export const InvestmentHeader: React.FC<InvestmentHeaderProps> = ({
  projectName,
  coverImage,
  gradient,
  onBack,
  onShare,
}) => {
  return (
    <div className="investment-header">
      <div className="investment-header-top">
        <button className="header-back-btn" onClick={onBack}>
          <IonIcon icon={arrowBackOutline} />
        </button>
        <h1 className="investment-header-title">{projectName}</h1>
        {onShare && (
          <button className="header-share-btn" onClick={onShare}>
            <IonIcon icon={shareSocialOutline} />
          </button>
        )}
      </div>
      <div
        className="investment-header-image"
        style={{
          background: coverImage
            ? `url(${coverImage}) center/cover`
            : gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      />
    </div>
  );
};
