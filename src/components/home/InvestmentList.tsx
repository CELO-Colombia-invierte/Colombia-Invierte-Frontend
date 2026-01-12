import React from 'react';
import { Investment } from '@/types';
import { InvestmentCard } from './InvestmentCard';
import './InvestmentList.css';

interface InvestmentListProps {
  investments: Investment[];
  title?: string;
  onInvestmentClick?: (investment: Investment) => void;
}

export const InvestmentList: React.FC<InvestmentListProps> = ({
  investments,
  title = 'Mis inversiones',
  onInvestmentClick
}) => {
  return (
    <div className="investment-list">
      <div className="investment-list-header">
        <h2 className="investment-list-title">{title}</h2>
      </div>
      <div className="investment-list-items">
        {investments.length > 0 ? (
          investments.map((investment) => (
            <InvestmentCard
              key={investment.id}
              investment={investment}
              onClick={() => onInvestmentClick?.(investment)}
            />
          ))
        ) : (
          <div className="investment-list-empty">
            <p>No tienes inversiones aún</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentList;
