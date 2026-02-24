import React, { useState } from 'react';
import { SelectedBank, DestinatarioData } from '../pages/BankTransferPage';
import './DestinatarioStep.css';

interface Props {
  bank: SelectedBank;
  onNext: (destinatario: DestinatarioData) => void;
}

const DestinatarioStep: React.FC<Props> = ({ bank, onNext }) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const isValid = accountNumber.trim().length > 0 && fullName.trim().length > 0;

  const handleSearch = async () => {
    if (!isValid) return;
    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSearching(false);
    onNext({ accountNumber: accountNumber.trim(), fullName: fullName.trim() });
  };

  return (
    <div className="ds-container">
      <div className="ds-content">
        {/* Banco seleccionado */}
        <div className="ds-bank-row">
          <div className="ds-bank-logo" style={{ backgroundColor: bank.color }}>
            <span className="ds-bank-initials">{bank.initials}</span>
          </div>
          <span className="ds-bank-name">{bank.name}</span>
        </div>

        {/* Formulario */}
        <div className="ds-card">
          <p className="ds-card-title">Ingrese los datos</p>
          <input
            className="ds-input"
            type="text"
            inputMode="numeric"
            placeholder="Número de cuenta"
            value={accountNumber}
            onChange={e => setAccountNumber(e.target.value)}
            disabled={isSearching}
          />
          <input
            className="ds-input"
            type="text"
            placeholder="Nombres y apellidos del destinatario"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            disabled={isSearching}
          />
        </div>

        {/* Texto de ayuda */}
        <div className="ds-helper">
          <span className="ds-helper-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </span>
          <span>Verifique que los datos sean correctos</span>
        </div>
      </div>

      {/* Boton */}
      <button
        className={`ds-btn${isValid ? ' ds-btn--active' : ''}`}
        onClick={handleSearch}
        disabled={!isValid || isSearching}
      >
        Buscar destinatario
      </button>

      {/* Overlay de carga */}
      {isSearching && (
        <div className="ds-overlay">
          <div className="ds-loading-card">
            <div className="ds-spinner" />
            <span className="ds-loading-text">Buscando destinatario...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinatarioStep;
