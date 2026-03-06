import React, { useState, useRef } from 'react';
import { ContactData, AmountData } from '../pages/CuentaTransferPage';
import './CuentaMontoStep.css';

interface Props {
  contact: ContactData;
  balance: number;
  onNext: (amount: AmountData) => void;
}

const formatCOP = (value: number): string =>
  value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const CuentaMontoStep: React.FC<Props> = ({ contact, balance, onNext }) => {
  const [rawValue, setRawValue] = useState('');
  const [detail, setDetail] = useState('');
  const [selectedChip, setSelectedChip] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
  const isValid = numericValue > 0;

  const chips = [
    Math.round(balance * 0.05),
    Math.round(balance * 0.25),
    Math.round(balance * 0.50),
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, '');
    setRawValue(digits);
    setSelectedChip(null);
  };

  const handleChipSelect = (chipValue: number) => {
    setRawValue(chipValue.toString());
    setSelectedChip(chipValue);
    inputRef.current?.focus();
  };

  const handlePay = () => {
    if (!isValid) return;
    onNext({ value: numericValue, detail: detail.trim() });
  };

  return (
    <div className="cmo-container">
      <div className="cmo-content">

        {/* Contacto seleccionado */}
        <div className="cmo-contact-row">
          <div className="cmo-avatar" style={{ backgroundColor: contact.avatarColor }}>
            <span className="cmo-avatar-initials">{contact.initials}</span>
          </div>
          <span className="cmo-contact-name">{contact.displayName}</span>
        </div>

        {/* Tarjeta de monto */}
        <div className="cmo-card">
          <p className="cmo-card-title">Ingrese el monto</p>

          {/* Display del monto — al tocar enfoca el input oculto */}
          <div className="cmo-amount-display" onClick={() => inputRef.current?.focus()}>
            <span className="cmo-currency">COP</span>
            <span className={`cmo-value${isValid ? ' cmo-value--active' : ''}`}>
              {isValid ? formatCOP(numericValue) : '0'}
            </span>
          </div>

          <input
            ref={inputRef}
            type="tel"
            value={rawValue}
            onChange={handleChange}
            className="cmo-hidden-input"
            aria-hidden="true"
          />

          <p className="cmo-balance">Tu saldo: COP {formatCOP(balance)}</p>

          <div className="cmo-chips">
            {chips.map((chip) => (
              <button
                key={chip}
                className={`cmo-chip${selectedChip === chip ? ' cmo-chip--selected' : ''}`}
                onClick={() => handleChipSelect(chip)}
              >
                COP {formatCOP(chip)}
              </button>
            ))}
          </div>

          <input
            className="cmo-detail"
            type="text"
            placeholder="Detalle"
            value={detail}
            onChange={e => setDetail(e.target.value)}
          />
        </div>
      </div>

      {/* Botón pagar */}
      <button
        className={`cmo-btn${isValid ? ' cmo-btn--active' : ''}`}
        onClick={handlePay}
        disabled={!isValid}
      >
        Pagar
      </button>
    </div>
  );
};

export default CuentaMontoStep;
