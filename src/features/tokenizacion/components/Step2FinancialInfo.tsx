import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import {
  informationCircleOutline,
  calendarOutline,
  timeOutline,
} from 'ionicons/icons';
import './StepStyles.css';

export const Step2FinancialInfo: React.FC = () => {
  const [currency, setCurrency] = useState<'COP' | 'USD'>('COP');

  return (
    <div className="step-content">
      <div className="form-group">
        <label className="form-label">
          Valor de activo
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <div className="currency-input-group">
          <div className="currency-toggle">
            <button
              type="button"
              className={`currency-btn ${currency === 'COP' ? 'active' : ''}`}
              onClick={() => setCurrency('COP')}
            >
              COP
            </button>
            <button
              type="button"
              className={`currency-btn ${currency === 'USD' ? 'active' : ''}`}
              onClick={() => setCurrency('USD')}
            >
              USD
            </button>
            <div
              className={`toggle-slider ${currency === 'COP' ? 'left' : 'right'}`}
            ></div>
          </div>
          <div className="currency-input-wrapper">
            <span className="currency-prefix">{currency}</span>
            <input
              type="number"
              className="form-input currency-input"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Rendimiento anual esperado
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <div className="input-with-prefix">
          <span className="input-prefix">%</span>
          <input
            type="number"
            className="form-input currency-input"
            placeholder="0"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Precio por token
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <div className="input-with-prefix">
          <span className="input-prefix">$</span>
          <input
            type="number"
            className="form-input currency-input"
            placeholder="0"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Total de tokens disponibles
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <div className="input-with-prefix">
          <span className="input-prefix">Tokens</span>
          <input
            type="number"
            className="form-input currency-input"
            placeholder="0"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Nombre del token
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <input
          type="text"
          className="form-input"
          placeholder="Escribe el símbolo (Ej: CSK, FIK,LLI)"
        />
      </div>

      <div className="form-group">
        <label
          className="form-label"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          Venta anticipada
          <IonIcon icon={informationCircleOutline} className="info-icon" />
          <label className="toggle-switch" style={{ marginLeft: 'auto' }}>
            <input type="checkbox" />
            <span className="toggle-slider-round"></span>
          </label>
        </label>
        <div className="input-with-icon">
          <IonIcon icon={calendarOutline} className="input-icon" />
          <input type="date" className="form-input" />
        </div>
        <div className="input-with-icon" style={{ marginTop: '12px' }}>
          <IonIcon icon={timeOutline} className="input-icon" />
          <input type="time" className="form-input" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Venta pública
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <div className="input-with-icon">
          <IonIcon icon={calendarOutline} className="input-icon" />
          <input type="date" className="form-input" />
        </div>
        <div className="input-with-icon" style={{ marginTop: '12px' }}>
          <IonIcon icon={timeOutline} className="input-icon" />
          <input type="time" className="form-input" />
        </div>
      </div>
    </div>
  );
};
