import React, { useState, useEffect, useRef } from 'react';
import { usersService } from '@/services/users/users.service';
import { User } from '@/models/User.model';
import { ContactData } from '../pages/CuentaTransferPage';
import './ContactSearchStep.css';

type SearchTab = 'todo' | 'natilleras' | 'tokenzaciones';

interface Props {
  recentContacts?: ContactData[];
  onSelect: (contact: ContactData) => void;
}

const AVATAR_COLORS = ['#3B5BDB', '#2D8E42', '#E03131', '#F5A623', '#9B59B6', '#1A9C8E'];

const TABS: { id: SearchTab; label: string }[] = [
  { id: 'todo', label: 'Todo' },
  { id: 'natilleras', label: 'Natilleras' },
  { id: 'tokenzaciones', label: 'Tokenizaciones' },
];

function mapUserToContact(user: User): ContactData {
  const displayName = user.getDisplayName();
  const initials = user.getInitials();
  const username = user.username ?? user.email?.split('@')[0] ?? user.id;
  const avatarColor = AVATAR_COLORS[user.id.charCodeAt(0) % AVATAR_COLORS.length];
  return { id: user.id, username, displayName, initials, avatarColor };
}

const ContactSearchStep: React.FC<Props> = ({ recentContacts = [], onSelect }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('todo');
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ContactData[]>([]);
  const [notFound, setNotFound] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setNotFound(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const users = await usersService.searchUsers(trimmed);
        if (users.length > 0) {
          setResults(users.map(mapUserToContact));
          setNotFound(false);
        } else {
          setResults([]);
          setNotFound(true);
        }
      } catch {
        setResults([]);
        setNotFound(true);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setNotFound(false);
  };

  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab);
    setResults([]);
    setNotFound(false);
  };

  return (
    <div className="cs-container">
      <div className="cs-content">

        <p className="cs-heading">Encuentra tus contactos</p>

        <div className="cs-search-row">
          <button className="cs-search-icon-left" disabled>
            <SearchIcon />
          </button>
          <input
            className="cs-search-input"
            type="text"
            placeholder="Usuario, correo o ID"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {query.length > 0 && (
            <button
              className="cs-clear-btn"
              onMouseDown={e => e.preventDefault()}
              onClick={handleClear}
              aria-label="Limpiar búsqueda"
            >
              <ClearIcon />
            </button>
          )}
        </div>

        {isFocused && (
          <div className="cs-tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`cs-tab${activeTab === tab.id ? ' cs-tab--active' : ''}`}
                onMouseDown={e => e.preventDefault()}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {query.trim().length > 0 && (
          <div className="cs-section">
            <p className="cs-section-title">Resultados</p>
            {isSearching && results.length === 0 && (
              <p className="cs-searching">Buscando...</p>
            )}
            {results.length > 0 && (
              <div className="cs-list">
                {results.map(contact => (
                  <ContactItem key={contact.id} contact={contact} onSelect={onSelect} />
                ))}
              </div>
            )}
            {notFound && !isSearching && (
              <p className="cs-not-found">Usuario no encontrado</p>
            )}
          </div>
        )}

        {!query && (
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

const ClearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PersonIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

export default ContactSearchStep;
