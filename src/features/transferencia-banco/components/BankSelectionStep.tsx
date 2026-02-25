import React from 'react';
import { SelectedBank } from '../pages/BankTransferPage';
import './BankSelectionStep.css';

interface Props {
  onSelect: (bank: SelectedBank) => void;
}

const BANKS: SelectedBank[] = [
  { id: 'bancolombia',        name: 'Bancolombia',          color: '#F5C518', initials: 'BC' },
  { id: 'banco-bogota',       name: 'Banco de Bogotá',      color: '#C41230', initials: 'BB' },
  { id: 'davivienda',         name: 'Davivienda',           color: '#DA0010', initials: 'DV' },
  { id: 'bbva',               name: 'BBVA Colombia',        color: '#004481', initials: 'BB' },
  { id: 'banco-occidente',    name: 'Banco de Occidente',   color: '#0066CC', initials: 'BO' },
  { id: 'itau',               name: 'Itaú Corpbanca',       color: '#EC7000', initials: 'IT' },
  { id: 'scotiabank',         name: 'Scotiabank Colpatria', color: '#EC111A', initials: 'SC' },
  { id: 'banco-popular',      name: 'Banco Popular',        color: '#003087', initials: 'BP' },
  { id: 'banco-agrario',      name: 'Banco Agrario',        color: '#2D8E42', initials: 'BA' },
  { id: 'caja-social',        name: 'Banco Caja Social',    color: '#003082', initials: 'CS' },
  { id: 'mundo-mujer',        name: 'Banco Mundo Mujer',    color: '#9B1E8E', initials: 'MM' },
  { id: 'falabella',          name: 'Banco Falabella',      color: '#009933', initials: 'BF' },
  { id: 'pichincha',          name: 'Banco Pichincha',      color: '#FFCD00', initials: 'PI' },
  { id: 'banco-w',            name: 'Banco W',              color: '#00A99D', initials: 'BW' },
  { id: 'mibanco',            name: 'MiBanco',              color: '#00A651', initials: 'MB' },
];

const BankSelectionStep: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="bs-container">
      <p className="bs-label">Selecciona un banco</p>
      <div className="bs-grid">
        {BANKS.map((bank) => (
          <button
            key={bank.id}
            className="bs-card"
            onClick={() => onSelect(bank)}
          >
            <div
              className="bs-logo"
              style={{ backgroundColor: bank.color }}
            >
              <span className="bs-logo-text">{bank.initials}</span>
            </div>
            <span className="bs-name">{bank.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BankSelectionStep;
