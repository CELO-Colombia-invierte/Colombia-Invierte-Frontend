import React from 'react';
import { IonIcon } from '@ionic/react';
import { copyOutline, informationCircleOutline } from 'ionicons/icons';
import './StepStyles.css';

interface Step4SuccessProps {
  tokenizacionName: string;
  userName: string;
  description: string;
  aspectosDestacados: string;
  privacidad: string;
  invitarAmigos: string;
  shareLink: string;
  onPrivacidadChange: (value: string) => void;
  onInvitarAmigosChange: (value: string) => void;
  onCopyLink: () => void;
}

export const Step4Success: React.FC<Step4SuccessProps> = ({
  privacidad,
  invitarAmigos,
  shareLink,
  onPrivacidadChange,
  onInvitarAmigosChange,
  onCopyLink,
}) => {
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
          <select
            className="form-select dark"
            value={privacidad}
            onChange={(e) => onPrivacidadChange(e.target.value)}
          >
            <option value="Privado">Privado</option>
            <option value="Público">Público</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label white">
            Invitar amigos
            <IonIcon icon={informationCircleOutline} className="info-icon" />
          </label>
          <input
            type="text"
            className="form-input dark"
            placeholder="Correo o Nombre de Usuario..."
            value={invitarAmigos}
            onChange={(e) => onInvitarAmigosChange(e.target.value)}
          />
        </div>

        <div className="share-link-group">
          <input
            type="text"
            className="form-input dark"
            value={shareLink}
            readOnly
          />
          <button type="button" className="copy-button" onClick={onCopyLink}>
            <IonIcon icon={copyOutline} />
          </button>
        </div>
      </div>
    </div>
  );
};
