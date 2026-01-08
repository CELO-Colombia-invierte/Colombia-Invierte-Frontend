import React from 'react';
import { Investment } from '@/types';
import './InvestmentCard.css';

interface InvestmentCardProps {
  investment: Investment;
  onClick?: () => void;
}

export const InvestmentCard: React.FC<InvestmentCardProps> = ({ investment, onClick }) => {
  const formatAmount = (amount: number) => {
    return `$${amount.toLocaleString('es-CO', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    })}`;
  };

  return (
    <div className="investment-card" onClick={onClick}>
      <div className="investment-card-left">
        <div
          className="investment-card-icon"
          style={{ backgroundColor: investment.color || '#3b82f6' }}
        >
          {investment.icon && <span>{investment.icon}</span>}
        </div>
        <div className="investment-card-info">
          <h3 className="investment-card-name">{investment.name}</h3>
          <p className="investment-card-currency">{investment.amount.toFixed(4)} {investment.currency}</p>
        </div>
      </div>
      <div className="investment-card-right">
        <p className="investment-card-amount">{formatAmount(investment.amount)}</p>
        <p className={`investment-card-change ${investment.changePercentage >= 0 ? 'positive' : 'negative'}`}>
          {investment.changePercentage >= 0 ? '+' : ''}{investment.changePercentage.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};

export default InvestmentCard;
