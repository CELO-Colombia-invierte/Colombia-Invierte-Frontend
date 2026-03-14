import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './RecibirModal.css';

interface RecibirModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const IconPerson = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconWallet = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 3H5a2 2 0 0 0-2 2v2" />
    <circle cx="17" cy="14" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const RecibirModal: React.FC<RecibirModalProps> = ({ isOpen, onClose }) => {
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
    <div className="recibir-modal-overlay" onClick={onClose}>
      <div className="recibir-modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="recibir-modal-handle" />
        <button className="recibir-modal-close" onClick={onClose}>
          <IconClose />
        </button>

        <div className="recibir-modal-options">
          <button
            className="recibir-option-btn"
            onClick={() => { onClose(); history.push('/recibir/amigo'); }}
          >
            <span className="recibir-option-icon"><IconPerson /></span>
            <span>Recibir de un amigo</span>
          </button>

          <button
            className="recibir-option-btn"
            onClick={() => { onClose(); history.push('/recibir/wallet'); }}
          >
            <span className="recibir-option-icon"><IconWallet /></span>
            <span>Recibir en mi wallet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
