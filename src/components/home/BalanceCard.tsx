import React from 'react';
import { Balance } from '@/types';
import './BalanceCard.css';

interface BalanceCardProps {
  balance: Balance;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance }) => {
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatAddress = (address?: string) => {
    if (!address) return '';
    return `${address.slice(0, 5)}...${address.slice(-4)}`;
  };

  return (
    <div className="balance-card">
      <div className="balance-card-amount">
        <h1 className="balance-card-value">
          {formatAmount(balance.amount)} <span className="balance-card-currency">{balance.currency}</span>
        </h1>
        {balance.address && (
          <p className="balance-card-address">{formatAddress(balance.address)}</p>
        )}
      </div>
      {balance.changePercentage !== undefined && (
        <div className={`balance-card-change ${balance.changePercentage >= 0 ? 'positive' : 'negative'}`}>
          {balance.changePercentage >= 0 ? '+' : ''}{balance.changePercentage.toFixed(2)}%
        </div>
      )}
    </div>
  );
};

export default BalanceCard;
