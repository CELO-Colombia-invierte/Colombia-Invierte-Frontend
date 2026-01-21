import React from 'react';
import { IonIcon } from '@ionic/react';
import { informationCircleOutline } from 'ionicons/icons';
import './InvestmentComponents.css';

interface FinancialItem {
  label: string;
  value: string;
  description?: string;
}

interface InvestmentFinancialInfoProps {
  title: string;
  items: FinancialItem[];
}

export const InvestmentFinancialInfo: React.FC<
  InvestmentFinancialInfoProps
> = ({ title, items }) => {
  return (
    <div className="investment-section">
      <h2 className="section-title">{title}</h2>
      <div className="financial-info-list">
        {items.map((item, index) => (
          <div key={index} className="financial-info-item">
            <div className="financial-info-header">
              <span className="financial-label">{item.label}</span>
              {item.description && (
                <IonIcon
                  icon={informationCircleOutline}
                  className="info-icon-small"
                />
              )}
            </div>
            <span className="financial-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

