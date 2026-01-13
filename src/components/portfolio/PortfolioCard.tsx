import React from 'react';
import { PortfolioProject } from '@/types';
import './PortfolioCard.css';

interface PortfolioCardProps {
  project: PortfolioProject;
  onClick?: () => void;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  project,
  onClick,
}) => {
  const formatAmount = (amount?: number) => {
    if (!amount) return '';
    return `$${amount.toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const renderParticipants = () => {
    if (!project.participants) return null;

    const displayCount = Math.min(3, project.avatars?.length || 0);
    const remaining = project.participants - displayCount;

    return (
      <div className="portfolio-card-participants">
        <div className="portfolio-card-avatars">
          {project.avatars?.slice(0, displayCount).map((avatar, index) => (
            <div key={index} className="portfolio-card-avatar">
              {avatar}
            </div>
          ))}
          {remaining > 0 && (
            <div className="portfolio-card-avatar-more">+{remaining}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`portfolio-card portfolio-card-${project.type}`}
      onClick={onClick}
    >
      <div
        className="portfolio-card-border"
        style={{
          background:
            project.gradient ||
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      />
      {project.type === 'natillera' ? (
        <>
          <div className="portfolio-card-header">
            <h3 className="portfolio-card-name">{project.name}</h3>
            {project.changePercentage !== undefined && (
              <div
                className={`portfolio-card-badge ${project.changePercentage >= 0 ? 'positive' : 'negative'}`}
              >
                {project.changePercentage >= 0 ? '+' : ''}
                {project.changePercentage}%
              </div>
            )}
            {project.period && (
              <div className="portfolio-card-period">{project.period}</div>
            )}
          </div>
          {renderParticipants()}
        </>
      ) : (
        <>
          <div className="portfolio-card-tokenization-content">
            <div className="portfolio-card-amount-section">
              <span className="portfolio-card-amount">
                {formatAmount(project.amount)}
              </span>
              {project.description && (
                <span className="portfolio-card-description">
                  {project.description}
                </span>
              )}
            </div>
            <div className="portfolio-card-bottom">
              <div className="portfolio-card-badge-wrapper">
                {project.changePercentage !== undefined && (
                  <div
                    className={`portfolio-card-badge ${project.changePercentage >= 0 ? 'positive' : 'negative'}`}
                  >
                    {project.changePercentage >= 0 ? '+' : ''}
                    {project.changePercentage}%
                  </div>
                )}
              </div>
              {project.emoji && (
                <div className="portfolio-card-emoji">{project.emoji}</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PortfolioCard;
