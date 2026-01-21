import React from 'react';
import { IonIcon } from '@ionic/react';
import {
  informationCircleOutline,
  calendarOutline,
  timeOutline,
} from 'ionicons/icons';
import './StepStyles.css';

interface Step2FinancialInfoProps {
  formData: {
    valorCuota: string;
    moneda: string;
    rendimiento: string;
    cantidadMeses: string;
    fechaPago: string;
    horaPago: string;
  };
  onChange: (field: string, value: string) => void;
}

export const Step2FinancialInfo: React.FC<Step2FinancialInfoProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="step-content">
      <div className="form-group">
        <label className="form-label">
          Valor de la cuota mensual
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <div className="currency-input-group">
          <div className="currency-input-wrapper">
            <span className="currency-prefix">COP</span>
            <input
              type="number"
              className="form-input currency-input"
              placeholder="0"
              min="1000"
              value={formData.valorCuota}
              onChange={(e) => onChange('valorCuota', e.target.value)}
            />
          </div>
        </div>
        <span className="form-hint">Mínimo: $1,000 COP</span>
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
            min="0"
            max="100"
            step="0.01"
            value={formData.rendimiento}
            onChange={(e) => onChange('rendimiento', e.target.value)}
          />
        </div>
        <span className="form-hint">Rango: 0% - 100%</span>
      </div>

      <div className="form-group">
        <label className="form-label">
          Cantidad de meses
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <input
          type="number"
          className="form-input"
          placeholder="0"
          min="1"
          max="120"
          value={formData.cantidadMeses}
          onChange={(e) => onChange('cantidadMeses', e.target.value)}
        />
        <span className="form-hint">Rango: 1 - 120 meses</span>
      </div>

      <div className="form-group">
        <label className="form-label">
          Fecha máxima de pago mensual
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <div className="input-with-icon">
          <IonIcon icon={calendarOutline} className="input-icon" />
          <input
            type="date"
            className="form-input"
            value={formData.fechaPago}
            onChange={(e) => onChange('fechaPago', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <div className="input-with-icon">
          <IonIcon icon={timeOutline} className="input-icon" />
          <input
            type="time"
            className="form-input"
            value={formData.horaPago}
            onChange={(e) => onChange('horaPago', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
