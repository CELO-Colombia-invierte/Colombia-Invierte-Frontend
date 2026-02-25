import React from 'react';
import { SelectedBank, DestinatarioData, AmountData } from '../pages/BankTransferPage';
import './ConfirmacionModal.css';

interface Props {
  bank: SelectedBank;
  destinatario: DestinatarioData;
  amount: AmountData;
  onCancel: () => void;
  onConfirm: () => void;
}

const formatCOP = (value: number): string =>
  value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ConfirmacionModal: React.FC<Props> = ({ bank, destinatario, amount, onCancel, onConfirm }) => {
  return (
    <div className="cm-overlay">
      <div className="cm-card">

        {/* Icono info */}
        <div className="cm-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="none">
            <circle cx="12" cy="12" r="12" fill="#3B5BDB" />
            <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">i</text>
          </svg>
        </div>

        {/* Texto de confirmacion */}
        <p className="cm-text">
          ¿Estás seguro que desea transferir el monto de{' '}
          <strong>{formatCOP(amount.value)} COP</strong> a{' '}
          <strong>{destinatario.fullName}</strong> con el número de cuenta{' '}
          <strong>{destinatario.accountNumber}</strong> de{' '}
          <strong>{bank.name}</strong>?
        </p>

        {/* Botones */}
        <div className="cm-actions">
          <button className="cm-btn cm-btn--cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button className="cm-btn cm-btn--confirm" onClick={onConfirm}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionModal;
