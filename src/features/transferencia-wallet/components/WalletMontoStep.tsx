import React, { useState, useRef } from 'react';
import { SelectedNetwork, SelectedCoin } from './WalletSelectionStep';
import './WalletMontoStep.css';

export interface WalletAmountData {
  value: number;
  walletAddress: string;
  commission: number;
  totalUSD: number;
}

interface Props {
  network: SelectedNetwork;
  coin: SelectedCoin;
  onPreview: (data: WalletAmountData) => void;
}

const MOCK_COMMISSION = 0.01;

const IconInfo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const WalletMontoStep: React.FC<Props> = ({ coin, onPreview }) => {
  const [rawValue, setRawValue] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const numericValue = parseFloat(rawValue) || 0;
  const hasAddress = walletAddress.trim().length > 0;
  const commission = hasAddress ? MOCK_COMMISSION : 0;
  const isValid = numericValue > 0 && hasAddress;

  const displayValue = rawValue || '0.0';
  const isActive = numericValue > 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) val = parts[0] + '.' + parts[1];
    if (parts[1] !== undefined && parts[1].length > 2) {
      val = parts[0] + '.' + parts[1].slice(0, 2);
    }
    setRawValue(val);
  };

  const handlePreview = () => {
    if (!isValid) return;
    const usdPerUnit = coin.balance > 0 ? coin.usdValue / coin.balance : 0;
    const totalUSD = numericValue * usdPerUnit;
    onPreview({
      value: numericValue,
      walletAddress: walletAddress.trim(),
      commission,
      totalUSD,
    });
  };

  return (
    <div className="wm-container">
      <div className="wm-content">

        {/* Moneda seleccionada */}
        <div className="wm-coin-row">
          <div className="wm-coin-logo" style={{ backgroundColor: coin.color }}>
            <span className="wm-coin-initials">{coin.initials}</span>
          </div>
          <span className="wm-coin-name">{coin.name}</span>
        </div>

        {/* Display del monto */}
        <div className="wm-amount-display" onClick={() => inputRef.current?.focus()}>
          <span className={`wm-value${isActive ? ' wm-value--active' : ''}`}>
            {displayValue}
          </span>
          <span className={`wm-unit${isActive ? ' wm-unit--active' : ''}`}>
            {coin.symbol}
          </span>
        </div>

        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={rawValue}
          onChange={handleAmountChange}
          className="wm-hidden-input"
          aria-hidden="true"
        />

        {/* Saldo */}
        <div className="wm-balance-block">
          <p className="wm-balance-line">Tu saldo: {coin.symbol} {coin.balance}</p>
          <p className="wm-balance-line">USDT: 0</p>
        </div>

        {/* Dirección de wallet */}
        <input
          className="wm-address-input"
          type="text"
          placeholder="Dirección de wallet"
          value={walletAddress}
          onChange={e => setWalletAddress(e.target.value)}
        />

        {/* Comisión */}
        <div className="wm-commission-row">
          <IconInfo />
          <span className="wm-commission-text">
            Comisión: {commission.toFixed(2)} {coin.symbol}
          </span>
        </div>
      </div>

      <button
        className={`wm-btn${isValid ? ' wm-btn--active' : ''}`}
        onClick={handlePreview}
        disabled={!isValid}
      >
        Previsualizar
      </button>
    </div>
  );
};

export default WalletMontoStep;
