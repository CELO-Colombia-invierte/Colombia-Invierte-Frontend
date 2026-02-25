import React, { useState, useRef } from 'react';
import { SelectedBank, AmountData } from '../pages/BankTransferPage';
import './MontoStep.css';

interface Props {
  bank: SelectedBank;
  balance: number;
  onNext: (amount: AmountData) => void;
}

const formatCOP = (value: number): string =>
  value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const MontoStep: React.FC<Props> = ({ bank, balance, onNext }) => {
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
    <div className="ms-container">
      <div className="ms-content">

        {/* Banco seleccionado */}
        <div className="ms-bank-row">
          <div className="ms-bank-logo" style={{ backgroundColor: bank.color }}>
            <span className="ms-bank-initials">{bank.initials}</span>
          </div>
          <span className="ms-bank-name">{bank.name}</span>
        </div>

        {/* Tarjeta de monto */}
        <div className="ms-card">
          <p className="ms-card-title">Ingrese el monto</p>

          {/* Display del monto — al tocar enfoca el input oculto */}
          <div className="ms-amount-display" onClick={() => inputRef.current?.focus()}>
            <span className="ms-currency">COP</span>
            <span className={`ms-value${isValid ? ' ms-value--active' : ''}`}>
              {isValid ? formatCOP(numericValue) : '0'}
            </span>
          </div>

          {/* Input oculto que captura el teclado numérico */}
          <input
            ref={inputRef}
            type="tel"
            value={rawValue}
            onChange={handleChange}
            className="ms-hidden-input"
            aria-hidden="true"
          />

          {/* Saldo disponible */}
          <p className="ms-balance">Tu saldo: COP {formatCOP(balance)}</p>

          {/* Chips de montos sugeridos */}
          <div className="ms-chips">
            {chips.map((chip) => (
              <button
                key={chip}
                className={`ms-chip${selectedChip === chip ? ' ms-chip--selected' : ''}`}
                onClick={() => handleChipSelect(chip)}
              >
                COP {formatCOP(chip)}
              </button>
            ))}
          </div>

          {/* Campo de detalle */}
          <input
            className="ms-detail"
            type="text"
            placeholder="Detalle"
            value={detail}
            onChange={e => setDetail(e.target.value)}
          />
        </div>
      </div>

      {/* Botón pagar */}
      <button
        className={`ms-btn${isValid ? ' ms-btn--active' : ''}`}
        onClick={handlePay}
        disabled={!isValid}
      >
        Pagar
      </button>
    </div>
  );
};

export default MontoStep;
