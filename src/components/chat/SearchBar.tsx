import React from 'react';
import { IonIcon } from '@ionic/react';
import { searchOutline } from 'ionicons/icons';
import './SearchBar.css';

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value = '',
  onChange,
  placeholder = 'Buscar'
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className="search-bar">
      <IonIcon icon={searchOutline} className="search-bar-icon" />
      <input
        type="text"
        className="search-bar-input"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar;
