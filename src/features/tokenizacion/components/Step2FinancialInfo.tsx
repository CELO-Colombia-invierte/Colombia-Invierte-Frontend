import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import {
  informationCircleOutline,
  calendarOutline,
  timeOutline,
} from 'ionicons/icons';
import './StepStyles.css';

interface Step2FinancialInfoProps {
  formData: {
    valorActivo: string;
    moneda: string;
    rendimiento: string;
    precioPorToken: string;
    monedaToken: string;
    totalTokens: string;
    simboloToken: string;
    nombreToken: string;
    ventaAnticipada: string;
    fechaVentaAnticipada: string;
    horaVentaAnticipada: string;
    fechaVentaPublica: string;
    horaVentaPublica: string;
  };
  onChange: (field: string, value: string) => void;
}

export const Step2FinancialInfo: React.FC<Step2FinancialInfoProps> = ({
  formData,
  onChange,
}) => {
  console.log('[Step2] Renderizado:', { formData });

  const [currency, setCurrency] = useState<'COP' | 'USD'>(
    (formData.moneda as 'COP' | 'USD') || 'COP'
  );

  const presaleEnabled = formData.ventaAnticipada === 'true';

  const handlePresaleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[Step2] handlePresaleToggle:', { checked: e.target.checked });
    onChange('ventaAnticipada', String(e.target.checked));
  };

  const handleCurrencyChange = (newCurrency: 'COP' | 'USD') => {
    setCurrency(newCurrency);
    onChange('moneda', newCurrency);
  };

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
              onClick={() => handleCurrencyChange('COP')}
            >
              COP
            </button>
            <button
              type="button"
              className={`currency-btn ${currency === 'USD' ? 'active' : ''}`}
              onClick={() => handleCurrencyChange('USD')}
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
              value={formData.valorActivo}
              onChange={(e) => onChange('valorActivo', e.target.value)}
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
            value={formData.rendimiento}
            onChange={(e) => onChange('rendimiento', e.target.value)}
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
            value={formData.precioPorToken}
            onChange={(e) => onChange('precioPorToken', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Total de tokens disponibles
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <div className="input-with-prefix input-with-tokens">
          <span className="input-prefix">Tokens</span>
          <input
            type="number"
            className="form-input currency-input"
            placeholder="0"
            value={formData.totalTokens}
            onChange={(e) => onChange('totalTokens', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Símbolo del token
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <input
          type="text"
          className="form-input"
          placeholder="Escribe el símbolo (Ej: CSK, FIK, LLI)"
          value={formData.simboloToken}
          onChange={(e) => onChange('simboloToken', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Nombre del token
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <input
          type="text"
          className="form-input"
          placeholder="Escribe el nombre completo del token"
          value={formData.nombreToken}
          onChange={(e) => onChange('nombreToken', e.target.value)}
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
            <input
              type="checkbox"
              checked={presaleEnabled}
              onChange={handlePresaleToggle}
            />
            <span className="toggle-slider-round"></span>
          </label>
        </label>
        <div className="input-with-icon">
          <IonIcon icon={calendarOutline} className="input-icon" />
          <input
            type="date"
            className="form-input"
            disabled={!presaleEnabled}
            value={formData.fechaVentaAnticipada}
            onChange={(e) => onChange('fechaVentaAnticipada', e.target.value)}
          />
        </div>
        <div className="input-with-icon" style={{ marginTop: '12px' }}>
          <IonIcon icon={timeOutline} className="input-icon" />
          <input
            type="time"
            className="form-input"
            disabled={!presaleEnabled}
            value={formData.horaVentaAnticipada}
            onChange={(e) => onChange('horaVentaAnticipada', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Venta pública
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <div className="input-with-icon">
          <IonIcon icon={calendarOutline} className="input-icon" />
          <input
            type="date"
            className="form-input"
            value={formData.fechaVentaPublica}
            onChange={(e) => onChange('fechaVentaPublica', e.target.value)}
          />
        </div>
        <div className="input-with-icon" style={{ marginTop: '12px' }}>
          <IonIcon icon={timeOutline} className="input-icon" />
          <input
            type="time"
            className="form-input"
            value={formData.horaVentaPublica}
            onChange={(e) => onChange('horaVentaPublica', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
