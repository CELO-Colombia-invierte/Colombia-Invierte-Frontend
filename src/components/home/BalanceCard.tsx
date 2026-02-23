import React, { useState } from 'react';
import { Balance } from '@/types';
import './BalanceCard.css';

interface BalanceCardProps {
  balance: Balance;
}

type BalanceTab = 'total' | 'utilizable';

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance }) => {
  const [activeTab, setActiveTab] = useState<BalanceTab>('total');

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatAddress = (address?: string) => {
    if (!address) return '';
    return `${address.slice(0, 5)}...${address.slice(-4)}`;
  };

  // FECHA CARD
  const formatDate = () => {
    return new Date().toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const changePercentage = balance.changePercentage ?? 0;
  const isPositive = changePercentage >= 0;

  return (
    <div className="balance-card">
      <div className="balance-card-tabs">
        <button
          className={`balance-card-tab ${activeTab === 'total' ? 'active' : ''}`}
          onClick={() => setActiveTab('total')}
        >
          {activeTab === 'utilizable' ? 'Balance total' : 'Total Balance'}
        </button>
        <button
          className={`balance-card-tab ${activeTab === 'utilizable' ? 'active' : ''}`}
          onClick={() => setActiveTab('utilizable')}
        >
          Balance utilizable
        </button>
      </div>

      <div className="balance-card-body">
        <div className="balance-card-top-row">
          {activeTab === 'total' ? (
            <span className={`balance-card-badge ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '+' : ''}{changePercentage.toFixed(2)}%
            </span>
          ) : (
            <span className="balance-card-info-icon">ⓘ</span>
          )}
          {balance.address && (
            <button className="balance-card-wallet-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M16 12h2" strokeLinecap="round" />
              </svg>
              Mi wallet
            </button>
          )}
        </div>

        <div className="balance-card-amount-section">
          <h1 className="balance-card-value">
            {formatAmount(balance.amount)}
            <span className="balance-card-currency"> {balance.currency}</span>
          </h1>
          {balance.address && (
            <p className="balance-card-address">{formatAddress(balance.address)}</p>
          )}
          <p className="balance-card-date">{formatDate()}</p>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
