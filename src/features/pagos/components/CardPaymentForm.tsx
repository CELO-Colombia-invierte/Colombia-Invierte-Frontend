import React from 'react';
import { Country, State } from 'country-state-city';

export interface CardFormState {
  cardNumber: string;
  cardExpiry: string;
  cardCVC: string;
  cardName: string;
  country: string;
  address1: string;
  suburb: string;
  city: string;
  postalCode: string;
  state: string;
  email: string;
}

interface Props {
  value: CardFormState;
  onChange: (next: CardFormState) => void;
}

export const CardPaymentForm: React.FC<Props> = ({ value, onChange }) => {
  const set = <K extends keyof CardFormState>(k: K, v: CardFormState[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="tkn-card-form">
      <div className="tkn-form-section">
        <label className="tkn-form-label">Card information</label>
        <div className="tkn-card-input-group">
          <input
            type="text"
            className="tkn-input"
            placeholder="Enter text"
            value={value.cardNumber}
            onChange={(e) => set('cardNumber', e.target.value)}
            maxLength={19}
          />
          <div className="tkn-card-icons-inline">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="MC" className="tkn-icon-small" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="tkn-icon-small" />
          </div>
        </div>
        <div className="tkn-card-row">
          <input
            type="text"
            className="tkn-input half"
            placeholder="MM / YY"
            value={value.cardExpiry}
            onChange={(e) => set('cardExpiry', e.target.value)}
            maxLength={7}
          />
          <input
            type="text"
            className="tkn-input half"
            placeholder="CVC"
            value={value.cardCVC}
            onChange={(e) => set('cardCVC', e.target.value)}
            maxLength={4}
          />
        </div>
      </div>

      <div className="tkn-form-section">
        <label className="tkn-form-label">Cardholder name</label>
        <input
          type="text"
          className="tkn-input"
          placeholder="Full name on card"
          value={value.cardName}
          onChange={(e) => set('cardName', e.target.value)}
        />
      </div>

      <div className="tkn-form-section">
        <label className="tkn-form-label">Country or region</label>
        <select
          className="tkn-select"
          value={value.country}
          onChange={(e) => onChange({ ...value, country: e.target.value, state: '' })}
        >
          {Country.getAllCountries().map((c) => (
            <option key={c.isoCode} value={c.isoCode}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="tkn-input"
          placeholder="Address line 1"
          value={value.address1}
          onChange={(e) => set('address1', e.target.value)}
        />
        <input
          type="text"
          className="tkn-input"
          placeholder="Suburb"
          value={value.suburb}
          onChange={(e) => set('suburb', e.target.value)}
        />
        <div className="tkn-card-row">
          <input
            type="text"
            className="tkn-input half"
            placeholder="City"
            value={value.city}
            onChange={(e) => set('city', e.target.value)}
          />
          <input
            type="text"
            className="tkn-input half"
            placeholder="Postal code"
            value={value.postalCode}
            onChange={(e) => set('postalCode', e.target.value)}
          />
        </div>
        <select className="tkn-select" value={value.state} onChange={(e) => set('state', e.target.value)}>
          <option value="">State</option>
          {State.getStatesOfCountry(value.country).map((s) => (
            <option key={s.isoCode} value={s.isoCode}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="tkn-form-section">
        <label className="tkn-form-label">Contact information</label>
        <input
          type="email"
          className="tkn-input"
          placeholder="Email"
          value={value.email}
          onChange={(e) => set('email', e.target.value)}
        />
      </div>
    </div>
  );
};
