import React from 'react';
import { IonIcon } from '@ionic/react';
import { informationCircleOutline, happyOutline } from 'ionicons/icons';
import './StepStyles.css';

export const Step1BasicInfo: React.FC = () => {
  return (
    <div className="step-content">
      <div className="form-group">
        <label className="form-label">
          Tipo de proyecto
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <div className="select-wrapper">
          <select className="form-select">
            <option>Tokenización</option>
            <option>Natillera</option>
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
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Descripción de proyecto
          <IonIcon icon={informationCircleOutline} className="info-icon" />
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
          <textarea className="form-textarea" rows={4}></textarea>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Aspectos destacados
          <IonIcon icon={informationCircleOutline} className="info-icon" />
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
          <textarea className="form-textarea" rows={4}></textarea>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Derechos del token
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <input
          type="text"
          className="form-input"
          placeholder="Escribe por ítem..."
        />
        <button type="button" className="add-space-button">
          + Añadir slot
        </button>
      </div>

      <div className="form-group">
        <label className="form-label">
          Preguntas frecuentes
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <input
          type="text"
          className="form-input"
          placeholder="Escriba la pregunta..."
        />
        <div style={{ marginTop: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '20px' }}>•</span>
            <input
              type="text"
              className="form-input"
              placeholder="Escribe la respuesta..."
              style={{ margin: 0 }}
            />
          </div>
        </div>
        <button type="button" className="add-space-button">
          + Añadir slot
        </button>
      </div>
    </div>
  );
};
