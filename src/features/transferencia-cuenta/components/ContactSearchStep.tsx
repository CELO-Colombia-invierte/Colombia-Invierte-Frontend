import React, { useState } from 'react';
import { ContactData } from '../pages/CuentaTransferPage';
import './ContactSearchStep.css';

interface Props {
  recentContacts?: ContactData[];
  onSelect: (contact: ContactData) => void;
}

// Mock — se reemplaza con GET /users/username/:username al conectar el backend
const MOCK_RESULT: ContactData = {
  id: 'mock-1',
  username: 'juanperez',
  displayName: 'Juan Pérez',
  initials: 'JP',
  avatarColor: '#3B5BDB',
};

const ContactSearchStep: React.FC<Props> = ({ recentContacts = [], onSelect }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<ContactData | null>(null);

  const canSearch = query.trim().length >= 3 && !isSearching;

  const handleSearch = async () => {
    if (!canSearch) return;
    setResult(null);
    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSearching(false);
    setResult(MOCK_RESULT);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setResult(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="cs-container">
      <div className="cs-content">

        {/* Subtítulo */}
        <p className="cs-heading">Encuentra tus contactos</p>

        {/* Input de búsqueda */}
        <div className="cs-search-row">
          <span className="cs-search-icon-left"><SearchIcon /></span>
          <input
            className="cs-search-input"
            type="text"
            placeholder="Usuario, correo o ID"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            disabled={isSearching}
          />
        </div>

        {/* Resultado de búsqueda */}
        {result && (
          <div className="cs-section">
            <p className="cs-section-title">Resultado</p>
            <p className="cs-section-sub">Enviar a</p>
            <div className="cs-list">
              <ContactItem contact={result} onSelect={onSelect} />
            </div>
          </div>
        )}

        {/* Contactos recientes — solo si no hay query ni resultado */}
        {!query && !result && (
          <div className="cs-section">
            <p className="cs-section-title">Recientes</p>
            {recentContacts.length > 0 ? (
              <>
                <p className="cs-section-sub">Enviar a</p>
                <div className="cs-list">
                  {recentContacts.map(c => (
                    <ContactItem key={c.id} contact={c} onSelect={onSelect} />
                  ))}
                </div>
              </>
            ) : (
              <div className="cs-empty-state">
                <PersonIcon />
                <p className="cs-empty">Aún no transferiste dinero a ningún contacto</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlay de carga */}
      {isSearching && (
        <div className="cs-overlay">
          <div className="cs-loading-card">
            <div className="cs-spinner" />
            <span className="cs-loading-text">Buscando contacto...</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface ContactItemProps {
  contact: ContactData;
  onSelect: (contact: ContactData) => void;
}

const ContactItem: React.FC<ContactItemProps> = ({ contact, onSelect }) => (
  <button className="cs-contact-item" onClick={() => onSelect(contact)}>
    <div className="cs-contact-info">
      <span className="cs-contact-name">{contact.displayName}</span>
      <span className="cs-contact-username">@{contact.username}</span>
    </div>
    <div className="cs-avatar" style={{ backgroundColor: contact.avatarColor }}>
      <span className="cs-avatar-initials">{contact.initials}</span>
    </div>
  </button>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const PersonIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

export default ContactSearchStep;
