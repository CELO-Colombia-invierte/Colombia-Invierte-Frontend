import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './TransferModal.css';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Enviar a otra cuenta: avión de papel (send)
const IconSendAccount = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22l-4-9-9-4 20-7z" />
  </svg>
);

// Entre mis cuentas: flechas circulares (swap)
const IconSendOwn = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 1l4 4-4 4" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <path d="M7 23l-4-4 4-4" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

// Banco: edificio con columnas
const IconBank = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18" />
    <path d="M3 10h18" />
    <path d="M5 6l7-3 7 3" />
    <line x1="6" y1="10" x2="6" y2="21" />
    <line x1="10" y1="10" x2="10" y2="21" />
    <line x1="14" y1="10" x2="14" y2="21" />
    <line x1="18" y1="10" x2="18" y2="21" />
  </svg>
);

// X icon
const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const history = useHistory();
  useEffect(() => {
    const tabBar = document.querySelector('.bottom-navbar') as HTMLElement | null;
    if (tabBar) {
      tabBar.style.display = isOpen ? 'none' : '';
    }
    return () => {
      if (tabBar) tabBar.style.display = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="transfer-modal-overlay" onClick={onClose}>
      <div className="transfer-modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="transfer-modal-handle" />
        <button className="transfer-modal-close" onClick={onClose}>
          <IconClose />
        </button>

        <div className="transfer-modal-options">
          <button className="transfer-option-btn" onClick={() => { onClose(); }}>
            <span className="transfer-option-icon"><IconSendAccount /></span>
            <span>Transferir a otra cuenta</span>
          </button>

          <button className="transfer-option-btn" onClick={() => { onClose(); }}>
            <span className="transfer-option-icon"><IconSendOwn /></span>
            <span>Transferir entre mis cuentas</span>
          </button>

          <button className="transfer-option-btn" onClick={() => { onClose(); history.push('/transferir-banco'); }}>
            <span className="transfer-option-icon"><IconBank /></span>
            <span>Transferir a un banco</span>
          </button>
        </div>
      </div>
    </div>
  );
};
