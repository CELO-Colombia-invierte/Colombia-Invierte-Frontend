import React from 'react';
import { IonIcon } from '@ionic/react';
import { happyOutline } from 'ionicons/icons';
import InfoTooltip from '../../../components/ui/InfoTooltip';
import './StepStyles.css';

interface Step1BasicInfoProps {
  formData: {
    tipoProyecto: string;
    nombreProyecto: string;
    descripcion: string;
    aspectosDestacados: string;
    privacidad: string;
  };
  onChange: (field: string, value: string) => void;
}

export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="step-content">
      <div className="form-group">
        <label className="form-label">
          Tipo de proyecto
          <InfoTooltip text="Define si este proyecto es una Natillera (ahorro colaborativo por cuotas) o una Tokenización (inversión en activos tokenizados en blockchain)." />
        </label>
        <div className="select-wrapper">
          <select
            className="form-select"
            value={formData.tipoProyecto}
            onChange={(e) => onChange('tipoProyecto', e.target.value)}
          >
            <option value="Natillera">Natillera</option>
            <option value="Tokenización">Tokenización</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Privacidad del proyecto
          <InfoTooltip text="Elige si el proyecto es Privado (solo acceden personas invitadas) o Público (cualquier usuario puede verlo y unirse)." />
        </label>
        <div className="select-wrapper">
          <select
            className="form-select"
            value={formData.privacidad}
            onChange={(e) => onChange('privacidad', e.target.value)}
          >
            <option value="PRIVATE">Privado</option>
            <option value="PUBLIC">Público</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Nombre de proyecto
          <InfoTooltip text="El nombre público que identificará tu proyecto. Elige uno descriptivo y fácil de recordar para los participantes." />
        </label>
        <div className="input-with-emoji">
          <button className="emoji-button" type="button">
            <IonIcon icon={happyOutline} />
          </button>
          <input
            type="text"
            className="form-input"
            placeholder="Escribe el nombre..."
            value={formData.nombreProyecto}
            onChange={(e) => onChange('nombreProyecto', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Descripción de proyecto
          <InfoTooltip text="Explica en detalle el propósito del proyecto, cómo funciona y qué beneficios ofrece a los participantes." />
        </label>
        <div className="rich-text-editor">
          <div className="editor-toolbar">
            <button type="button" className="toolbar-btn">
              <strong>B</strong>
            </button>
            <button type="button" className="toolbar-btn">
              <em>I</em>
            </button>
            <button type="button" className="toolbar-btn">
              <u>U</u>
            </button>
            <button type="button" className="toolbar-btn">
              <IonIcon icon={happyOutline} />
            </button>
            <button type="button" className="toolbar-btn">
              🔗
            </button>
            <button type="button" className="toolbar-btn">
              ≡
            </button>
            <button type="button" className="toolbar-btn">
              ☰
            </button>
          </div>
          <textarea
            className="form-textarea"
            rows={4}
            value={formData.descripcion}
            onChange={(e) => onChange('descripcion', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Aspectos destacados
          <InfoTooltip text="Enumera las características más atractivas o ventajas clave del proyecto para motivar la participación." />
        </label>
        <div className="rich-text-editor">
          <div className="editor-toolbar">
            <button type="button" className="toolbar-btn">
              <strong>B</strong>
            </button>
            <button type="button" className="toolbar-btn">
              <em>I</em>
            </button>
            <button type="button" className="toolbar-btn">
              <u>U</u>
            </button>
            <button type="button" className="toolbar-btn">
              <IonIcon icon={happyOutline} />
            </button>
            <button type="button" className="toolbar-btn">
              🔗
            </button>
            <button type="button" className="toolbar-btn">
              ≡
            </button>
            <button type="button" className="toolbar-btn">
              ☰
            </button>
          </div>
          <textarea
            className="form-textarea"
            rows={4}
            value={formData.aspectosDestacados}
            onChange={(e) => onChange('aspectosDestacados', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
