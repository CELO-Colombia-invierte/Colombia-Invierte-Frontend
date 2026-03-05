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

// Wallet: billetera digital
const IconWallet = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 3H5a2 2 0 0 0-2 2v2" />
    <circle cx="17" cy="14" r="1" fill="currentColor" stroke="none" />
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
          <button className="transfer-option-btn" onClick={() => { onClose(); history.push('/transferir-cuenta'); }}>
            <span className="transfer-option-icon"><IconSendAccount /></span>
            <span>Transferir a otra cuenta</span>
          </button>

          <button className="transfer-option-btn" onClick={() => { onClose(); }}>
            <span className="transfer-option-icon"><IconWallet /></span>
            <span>Transferir a una wallet</span>
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
