import React from 'react';
import { IonIcon } from '@ionic/react';
import { informationCircleOutline } from 'ionicons/icons';
import { Project } from '@/models/projects';
import { buildFinancialItems } from './financialItems';

interface FinancialItemsListProps {
  project: Project;
}

export const FinancialItemsList: React.FC<FinancialItemsListProps> = ({ project }) => {
  const financialItems = buildFinancialItems(project);
  return (
    <div className="finanzas-items">
      {financialItems.map((item, index) => (
        <div key={index} className="finanzas-item">
          <div className="finanzas-icon">{item.iconComponent}</div>
          <div className="finanzas-content">
            <div className="finanzas-label-wrapper">
              <span className="finanzas-label">{item.label}</span>
              <div className="finanzas-tooltip">
                <IonIcon icon={informationCircleOutline} />
                <span className="tooltip-text">{item.tooltip}</span>
              </div>
            </div>
            <span className="finanzas-value">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
