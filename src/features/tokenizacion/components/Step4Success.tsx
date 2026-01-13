import React from 'react';
import { IonIcon } from '@ionic/react';
import { copyOutline } from 'ionicons/icons';
import './StepStyles.css';

export const Step4Success: React.FC = () => {
  return (
    <div className="step-content success-step">
      <div className="success-icon-container">
        <div className="success-icon">🎉</div>
      </div>

      <h2 className="success-title">TOKENIZACIÓN CREADA</h2>

      <p className="success-message">
        Tu Tokenización fue creada exitosamente, la misma se encuentra privada
        hasta que añadas a tu comunidad o decidas ponerlo en público y permitir
        el ingreso a cualquier persona de la plataforma
      </p>

      <div className="privacy-settings">
        <div className="form-group">
          <select className="form-select form-input dark">
            <option>Privado</option>
            <option>Público</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            Invitar amigos <span className="info-icon">ⓘ</span>
          </label>
          <input
            type="text"
            className="form-input dark"
            placeholder="Correo o Nombre de Usuario..."
          />
        </div>

        <div className="form-group">
          <div className="share-link-group">
            <input
              type="text"
              className="form-input dark"
              value="https://colombiainvierte.com/natil..."
              readOnly
            />
            <button className="copy-button">
              <IonIcon icon={copyOutline} />
            </button>
          </div>
        </div>
      </div>

      <button
        className="primary-button"
        style={{
          width: '100%',
          padding: '16px',
          background: '#4a90e2',
          border: 'none',
          borderRadius: '12px',
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: '600',
          marginTop: '24px',
          cursor: 'pointer',
        }}
      >
        Ir a mi Tokenización
      </button>
    </div>
  );
};
