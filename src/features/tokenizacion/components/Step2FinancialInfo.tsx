import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { calendarOutline, timeOutline } from 'ionicons/icons';
import InfoTooltip from '../../../components/ui/InfoTooltip';
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


  const [currency, setCurrency] = useState<'COP' | 'USD'>(
    (formData.moneda as 'COP' | 'USD') || 'COP'
  );

  const presaleEnabled = formData.ventaAnticipada === 'true';

  const handlePresaleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('ventaAnticipada', String(e.target.checked));
  };

  const handleCurrencyChange = (newCurrency: 'COP' | 'USD') => {
    setCurrency(newCurrency);
    onChange('moneda', newCurrency);
  };

  const toNumber = (value: string) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  };

  const formatPrice = (value: number) =>
    value > 0 ? String(Math.round(value * 100) / 100) : '';

  const formatTokens = (value: number) =>
    value > 0 ? String(Math.round(value)) : '';

  const handleValorActivoChange = (value: string) => {
    onChange('valorActivo', value);
    const valorActivo = toNumber(value);
    if (valorActivo <= 0) return;
    const totalTokens = toNumber(formData.totalTokens);
    const precioPorToken = toNumber(formData.precioPorToken);
    if (totalTokens > 0) {
      onChange('precioPorToken', formatPrice(valorActivo / totalTokens));
    } else if (precioPorToken > 0) {
      onChange('totalTokens', formatTokens(valorActivo / precioPorToken));
    }
  };

  const handlePrecioPorTokenChange = (value: string) => {
    onChange('precioPorToken', value);
    const valorActivo = toNumber(formData.valorActivo);
    const precioPorToken = toNumber(value);
    if (valorActivo > 0 && precioPorToken > 0) {
      onChange('totalTokens', formatTokens(valorActivo / precioPorToken));
    }
  };

  const handleTotalTokensChange = (value: string) => {
    onChange('totalTokens', value);
    const valorActivo = toNumber(formData.valorActivo);
    const totalTokens = toNumber(value);
    if (valorActivo > 0 && totalTokens > 0) {
      onChange('precioPorToken', formatPrice(valorActivo / totalTokens));
    }
  };

  return (
    <div className="step-content">
      <div className="form-group">
        <label className="form-label">
          Valor de activo
          <InfoTooltip text="Valor total del activo real que se está tokenizando (en COP o USD). Es el precio de mercado del activo completo." />
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
              onChange={(e) => handleValorActivoChange(e.target.value)}
              onWheel={(e) => e.currentTarget.blur()}
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Rendimiento anual proyectado
          <InfoTooltip text="Es una proyección que tú como creador prometes a los inversores. El contrato NO la enforce automáticamente: tendrás que depositar los rendimientos manualmente vía 'Depositar rendimientos' para que los tokenholders los reclamen. Si no depositas, ellos pueden abrir una disputa." />
        </label>
        <div className="input-with-prefix">
          <span className="input-prefix">%</span>
          <input
            type="number"
            className="form-input currency-input"
            placeholder="0"
            value={formData.rendimiento}
            onChange={(e) => onChange('rendimiento', e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Precio por token
          <InfoTooltip text="Costo unitario de cada token. Usualmente resulta de dividir el valor total del activo entre el total de tokens disponibles." />
        </label>
        <div className="input-with-prefix">
          <span className="input-prefix">$</span>
          <input
            type="number"
            className="form-input currency-input"
            placeholder="0"
            value={formData.precioPorToken}
            onChange={(e) => handlePrecioPorTokenChange(e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Total de tokens disponibles
          <InfoTooltip text="Cantidad total de tokens en que se divide el activo. Determina la fracción de propiedad que representa cada token." />
        </label>
        <div className="input-with-prefix input-with-tokens">
          <span className="input-prefix">Tokens</span>
          <input
            type="number"
            className="form-input currency-input"
            placeholder="0"
            value={formData.totalTokens}
            onChange={(e) => handleTotalTokensChange(e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Símbolo del token
          <InfoTooltip text="Identificador corto y único del token (2 a 5 caracteres). Ejemplo: CSK para CasaToken, FIK para FincaToken." />
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
          <InfoTooltip text="Nombre completo y descriptivo del token. Aparecerá en la blockchain y en todos los registros de la plataforma." />
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
        <div
          className="form-label"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          Venta anticipada
          <InfoTooltip text="Período exclusivo previo a la venta pública donde inversores seleccionados pueden adquirir tokens a precio especial." />
          <label className="toggle-switch" style={{ marginLeft: 'auto' }}>
            <input
              type="checkbox"
              checked={presaleEnabled}
              onChange={handlePresaleToggle}
            />
            <span className="toggle-slider-round"></span>
          </label>
        </div>
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
          <InfoTooltip text="Fecha y hora de inicio de la venta abierta al público general. Desde este momento cualquier usuario puede comprar tokens." />
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
