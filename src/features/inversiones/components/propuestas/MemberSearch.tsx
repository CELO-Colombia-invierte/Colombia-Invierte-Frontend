import React, { useState, useEffect, useRef } from 'react';
import { InvestmentPosition } from '@/models/membership';
import './MemberSearch.css';

interface MemberSearchProps {
  members: InvestmentPosition[];
  selectedId: string;
  onSelect: (member: InvestmentPosition) => void;
}

export const MemberSearch: React.FC<MemberSearchProps> = ({ members, selectedId, onSelect }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = members.find((m) => m.user_id === selectedId);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = members.filter((m) => {
    if (!query) return true;
    const name = (m.user as any)?.display_name || m.user?.username || '';
    const username = m.user?.username || '';
    const q = query.toLowerCase();
    return name.toLowerCase().includes(q) || username.toLowerCase().includes(q);
  });

  const getDisplayName = (m: InvestmentPosition) =>
    (m.user as any)?.display_name || m.user?.username || 'Usuario';

  const getAvatarUrl = (m: InvestmentPosition): string | undefined => {
    const u = m.user as any;
    if (!u) return undefined;
    if (u.avatar) return u.avatar;
    if (u.avatar_asset_id) {
      return `${import.meta.env.VITE_ASSETS_URL || import.meta.env.VITE_API_URL}/assets/${u.avatar_asset_id}`;
    }
    return undefined;
  };

  const handleSelect = (m: InvestmentPosition) => {
    onSelect(m);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="member-search" ref={ref}>
      {selected && (
        <div className="member-search-selected">
          <div className="member-search-chip">
            {getAvatarUrl(selected) ? (
              <img src={getAvatarUrl(selected)} alt={getDisplayName(selected)} className="member-chip-avatar" />
            ) : (
              <div className="member-chip-initials">{getDisplayName(selected).charAt(0).toUpperCase()}</div>
            )}
            <span className="member-chip-name">{getDisplayName(selected)}</span>
            <span className="member-chip-username">@{selected.user?.username}</span>
          </div>
        </div>
      )}
      <input
        className="member-search-input"
        placeholder="Escribe el nombre, usuario, correo o ID"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && filtered.length > 0 && (
        <div className="member-search-dropdown">
          {filtered.map((m) => (
            <div key={m.user_id} className="member-search-option" onClick={() => handleSelect(m)}>
              {getAvatarUrl(m) ? (
                <img src={getAvatarUrl(m)} alt={getDisplayName(m)} className="member-option-avatar" />
              ) : (
                <div className="member-option-initials">{getDisplayName(m).charAt(0).toUpperCase()}</div>
              )}
              <div className="member-option-info">
                <span className="member-option-name">{getDisplayName(m)}</span>
                <span className="member-option-username">@{m.user?.username}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
