import React, { useState } from 'react';
import './InvestmentComponents.css';

interface InvestmentDescriptionProps {
  description?: string;
  highlights?: string;
}

export const InvestmentDescription: React.FC<InvestmentDescriptionProps> = ({
  description,
  highlights,
}) => {
  const [activeTab, setActiveTab] = useState<'description' | 'highlights'>(
    'description'
  );

  if (!description && !highlights) {
    return null;
  }

  return (
    <div className="investment-section">
      <div className="description-tabs">
        {description && (
          <button
            className={`description-tab ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Descripción
          </button>
        )}
        {highlights && (
          <button
            className={`description-tab ${activeTab === 'highlights' ? 'active' : ''}`}
            onClick={() => setActiveTab('highlights')}
          >
            Aspectos Destacados
          </button>
        )}
      </div>
      <div className="description-content">
        {activeTab === 'description' && description && (
          <div
            className="description-text"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
        {activeTab === 'highlights' && highlights && (
          <div
            className="description-text"
            dangerouslySetInnerHTML={{ __html: highlights }}
          />
        )}
      </div>
    </div>
  );
};

