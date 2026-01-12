import React from 'react';
import { IonIcon } from '@ionic/react';
import { informationCircleOutline, cloudUploadOutline } from 'ionicons/icons';
import './StepStyles.css';

export const Step3Content: React.FC = () => {
  return (
    <div className="step-content">
      <div className="form-group">
        <label className="form-label">
          Upload content
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <button type="button" className="upload-button">
          <IonIcon icon={cloudUploadOutline} className="upload-icon" />
          Subir archivo
        </button>
      </div>

      <div className="form-group">
        <label className="form-label">
          Category
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <div className="select-wrapper">
          <select className="form-select">
            <option>Real Estate</option>
            <option>Arte</option>
            <option>Tecnología</option>
            <option>Finanzas</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Important documents
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <input
          type="text"
          className="form-input"
          placeholder="Motivo del documento..."
        />
        <button
          type="button"
          className="upload-button"
          style={{ marginTop: '12px' }}
        >
          <IonIcon icon={cloudUploadOutline} className="upload-icon" />
          Subir archivo
        </button>
        <button
          type="button"
          className="add-space-button"
          style={{ marginTop: '12px' }}
        >
          + Añadir espacio
        </button>
      </div>
    </div>
  );
};
