import React from 'react';
import { ContactData, AmountData } from '../pages/CuentaTransferPage';
import './CuentaConfirmacionModal.css';

interface Props {
  contact: ContactData;
  amount: AmountData;
  onCancel: () => void;
  onConfirm: () => void;
}

const formatCOP = (value: number): string =>
  value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CuentaConfirmacionModal: React.FC<Props> = ({ contact, amount, onCancel, onConfirm }) => {
  return (
    <div className="cc-overlay">
      <div className="cc-card">

        {/* Icono info */}
        <div className="cc-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="none">
            <circle cx="12" cy="12" r="12" fill="#3B5BDB" />
            <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">i</text>
          </svg>
        </div>

        {/* Texto de confirmación */}
        <p className="cc-text">
          ¿Estás seguro que desea transferir el monto de{' '}
          <strong>{formatCOP(amount.value)} COP</strong> a{' '}
          <strong>{contact.displayName}</strong> con el número de cuenta{' '}
          <strong>{contact.id}</strong>?
        </p>

        {/* Botones */}
        <div className="cc-actions">
          <button className="cc-btn cc-btn--cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button className="cc-btn cc-btn--confirm" onClick={onConfirm}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CuentaConfirmacionModal;
