import React from 'react';
import { IonIcon } from '@ionic/react';
import { calendarOutline, timeOutline } from 'ionicons/icons';
import InfoTooltip from '../../../components/ui/InfoTooltip';
import './StepStyles.css';

interface Step2FinancialInfoProps {
  formData: {
    valorCuota: string;
    moneda: string;
    rendimiento: string;
    cantidadMeses: string;
    maxParticipantes: string;
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
          <InfoTooltip text="Monto en pesos colombianos (COP) que cada participante debe pagar cada mes. El mínimo permitido es $1,000 COP." />
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
          <InfoTooltip text="Porcentaje de rentabilidad anual proyectada. Se recomienda un valor realista entre el 5% y el 25% anual, acorde al tipo de grupo de ahorro." />
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
          <InfoTooltip text="Duración total del proyecto en meses. Define cuántos ciclos de pago habrá antes de distribuir el fondo acumulado." />
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
          Máximo de participantes
          <InfoTooltip text="Número máximo de personas que pueden unirse a este proyecto (mínimo 2, máximo 100)." />
        </label>
        <input
          type="number"
          className="form-input"
          placeholder="12"
          min="2"
          max="100"
          value={formData.maxParticipantes}
          onChange={(e) => onChange('maxParticipantes', e.target.value)}
        />
        <span className="form-hint">Rango: 2 - 100 participantes</span>
      </div>

      <div className="form-group">
        <label className="form-label">
          Fecha máxima de pago mensual
          <InfoTooltip text="Día límite cada mes para que los participantes realicen su pago de cuota sin incurrir en mora." />
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
