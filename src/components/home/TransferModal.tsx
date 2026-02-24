import React, { useEffect } from 'react';
import './TransferModal.css';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mano dando / enviando (flecha hacia arriba con mano)
const IconSendAccount = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v10M9 5l3-3 3 3" />
    <path d="M8 14H6a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2h-2" />
    <path d="M8 14l1.5-3.5a1.5 1.5 0 0 1 5 0L16 14" />
  </svg>
);

// Flechas bidireccionales (transferencia entre cuentas)
const IconSendOwn = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16V4m0 0L3 8m4-4l4 4" />
    <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);

// Banco/edificio
const IconBank = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 22h18" />
    <path d="M3 10h18" />
    <path d="M5 6l7-3 7 3" />
    <rect x="6" y="10" width="3" height="12" />
    <rect x="10.5" y="10" width="3" height="12" />
    <rect x="15" y="10" width="3" height="12" />
  </svg>
);

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
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
        <button className="transfer-modal-close" onClick={onClose}>✕</button>

        <div className="transfer-modal-options">
          <button className="transfer-option-btn" onClick={() => { console.log('Transferir a otra cuenta'); onClose(); }}>
            <IconSendAccount />
            <span>Transferir a otra cuenta</span>
          </button>

          <button className="transfer-option-btn" onClick={() => { console.log('Transferir entre mis cuentas'); onClose(); }}>
            <IconSendOwn />
            <span>Transferir entre mis cuentas</span>
          </button>

          <button className="transfer-option-btn" onClick={() => { console.log('Transferir a un banco'); onClose(); }}>
            <IconBank />
            <span>Transferir a un banco</span>
          </button>
        </div>
      </div>
    </div>
  );
};
