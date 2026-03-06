import React from 'react';
import './WalletEstadoModal.css';

interface Props {
  onViewTx: () => void;
  onDone: () => void;
}

const TIMELINE = [
  { label: 'Inicio cadena de bloques',         date: '16 de abril de 2026 - 12:00:11' },
  { label: 'Conteo de cadena de bloques (15/60)', date: '16 de abril de 2026 - 12:00:11' },
  { label: 'Transferencia exitosa',             date: '16 de abril de 2026 - 12:00:21' },
];

const IconDone = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="#3B5BDB" />
    <polyline points="5,10 9,14 15,7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WalletEstadoModal: React.FC<Props> = ({ onViewTx, onDone }) => {
  return (
    <div className="we-overlay">
      <div className="we-card">

        {/* Icono principal — checkmark azul */}
        <div className="we-main-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <polyline points="6,16 13,23 26,10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Timeline */}
        <div className="we-section">
          <p className="we-section-title">Estado</p>
          <div className="we-timeline">
            {TIMELINE.map((item, index) => (
              <div key={index} className="we-timeline-item">
                <div className="we-timeline-left">
                  <div className="we-timeline-icon"><IconDone /></div>
                  {index < TIMELINE.length - 1 && (
                    <div className="we-timeline-line" />
                  )}
                </div>
                <div className="we-timeline-content">
                  <p className="we-timeline-label">{item.label}</p>
                  <p className="we-timeline-date">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="we-actions">
          <button className="we-btn we-btn--tx" onClick={onViewTx}>
            Ver transacción en la red
          </button>
          <button className="we-btn we-btn--done" onClick={onDone}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletEstadoModal;
