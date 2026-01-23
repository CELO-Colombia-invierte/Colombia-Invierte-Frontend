import React from 'react';
import { Investment } from '@/types';
import './InvestmentCard.css';

interface InvestmentCardProps {
  investment: Investment;
  onClick?: () => void;
}

export const InvestmentCard: React.FC<InvestmentCardProps> = ({ investment, onClick }) => {
  const formatAmount = (amount: number) => {
    const numAmount = Number(amount) || 0;
    return `$${numAmount.toLocaleString('es-CO', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    })}`;
  };

  const safeAmount = Number(investment.amount) || 0;
  const safeChangePercentage = Number(investment.changePercentage) || 0;

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
          <p className="investment-card-currency">{safeAmount.toFixed(4)} {investment.currency}</p>
        </div>
      </div>
      <div className="investment-card-right">
        <p className="investment-card-amount">{formatAmount(safeAmount)}</p>
        <p className={`investment-card-change ${safeChangePercentage >= 0 ? 'positive' : 'negative'}`}>
          {safeChangePercentage >= 0 ? '+' : ''}{safeChangePercentage.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};

export default InvestmentCard;
