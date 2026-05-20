import React from 'react';
import { IonIcon } from '@ionic/react';
import { chevronDownOutline } from 'ionicons/icons';

interface Props {
  cryptoAmount: string;
  onCryptoAmountChange: (v: string) => void;
  selectedCrypto: string;
  walletBalance: number;
  conversion: number;
  fee: number;
  total: number;
}

export const CryptoPaymentForm: React.FC<Props> = ({
  cryptoAmount,
  onCryptoAmountChange,
  selectedCrypto,
  walletBalance,
  conversion,
  fee,
  total,
}) => {
  const hasAmount = cryptoAmount && parseFloat(cryptoAmount) > 0;

  return (
    <div className="tkn-crypto-form">
      <div className="tkn-form-section">
        <label className="tkn-form-label">Wallet & Network</label>
        <div className="tkn-wallet-box">
          <span className="tkn-wallet-icon">👛</span>
          <span className="tkn-wallet-balance">{walletBalance.toFixed(2)}</span>
        </div>
      </div>

      <div className="tkn-form-section">
        <label className="tkn-form-label">Coin</label>
        <div className="tkn-crypto-input-group">
          <input
            type="number"
            className="tkn-crypto-input"
            placeholder="0.1824"
            value={cryptoAmount}
            onChange={(e) => onCryptoAmountChange(e.target.value)}
            step="0.0001"
          />
          <div className="tkn-crypto-select-box">
            <span>{selectedCrypto}</span>
            <IonIcon icon={chevronDownOutline} />
          </div>
        </div>
      </div>

      {hasAmount && (
        <div className="tkn-crypto-summary">
          <div className="tkn-summary-label">Total:</div>
          <div className="tkn-summary-row">
            <span className="tkn-summary-text">Conversión:</span>
            <span className="tkn-summary-value">{conversion.toFixed(2)} USDT</span>
          </div>
          <div className="tkn-summary-row">
            <span className="tkn-summary-text">Fee:</span>
            <span className="tkn-summary-value">{fee.toFixed(2)} USDT</span>
          </div>
          <div className="tkn-total-amount">{total.toFixed(2)} USDT</div>
        </div>
      )}
    </div>
  );
};
