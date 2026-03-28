import React from 'react';
import { IonIcon } from '@ionic/react';
import { informationCircleOutline, happyOutline } from 'ionicons/icons';
import { RichTextEditor } from '@/components/ui/RichTextEditor/RichTextEditor';
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
          <IonIcon icon={informationCircleOutline} className="info-icon" />
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
          <IonIcon icon={informationCircleOutline} className="info-icon" />
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
          <IonIcon icon={informationCircleOutline} className="info-icon" />
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
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <RichTextEditor
          value={formData.descripcion}
          onChange={(html) => onChange('descripcion', html)}
          rows={4}
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Aspectos destacados
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <RichTextEditor
          value={formData.aspectosDestacados}
          onChange={(html) => onChange('aspectosDestacados', html)}
          rows={4}
        />
      </div>
    </div>
  );
};
