import React from 'react';
import { SelectedNetwork, SelectedCoin } from './WalletSelectionStep';
import { WalletAmountData } from './WalletMontoStep';
import './WalletVistaPrevia.css';

// Dirección de origen — mock hasta que el backend entregue la wallet del usuario
const MOCK_ORIGIN = '0x742d35Cc6634C0532925a3b844Bc454e4438f44';

interface Props {
  network: SelectedNetwork;
  coin: SelectedCoin;
  amount: WalletAmountData;
  onCancel: () => void;
  onConfirm: () => void;
}

const truncateAddress = (addr: string): string =>
  addr.length > 16 ? `${addr.slice(0, 10)}...${addr.slice(-4)}` : addr;

const IconInfo = () => (
  <div className="wvp-icon">
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="14" fill="#3B5BDB" />
      <text x="14" y="20" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white" fontStyle="italic">i</text>
    </svg>
  </div>
);

const WalletVistaPrevia: React.FC<Props> = ({ network, coin, amount, onCancel, onConfirm }) => {
  const rows: Array<{ label: string; value: string }> = [
    { label: 'Token',     value: coin.symbol },
    { label: 'De',        value: truncateAddress(MOCK_ORIGIN) },
    { label: 'A',         value: truncateAddress(amount.walletAddress) },
    { label: 'Monto',     value: `${amount.value} ${coin.symbol}` },
    { label: 'Red',       value: network.name },
    { label: 'Comisión',  value: `${amount.commission.toFixed(2)} ${coin.symbol}` },
    { label: 'Total',     value: `$${amount.totalUSD.toFixed(4)}` },
  ];

  return (
    <div className="wvp-overlay" onClick={onCancel}>
      <div className="wvp-card" onClick={e => e.stopPropagation()}>

        <IconInfo />

        <p className="wvp-title">Vista previa</p>

        <div className="wvp-table">
          {rows.map(({ label, value }) => (
            <div key={label} className="wvp-row">
              <span className="wvp-label">{label}:</span>
              <span className="wvp-value">{value}</span>
            </div>
          ))}
        </div>

        <button className="wvp-btn" onClick={onConfirm}>
          Transferir
        </button>
      </div>
    </div>
  );
};

export default WalletVistaPrevia;
