import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import {
  copyOutline,
  informationCircleOutline,
  sendOutline,
} from 'ionicons/icons';
import './StepStyles.css';

interface Step4SuccessProps {
  tokenizacionName: string;
  userName: string;
  description: string;
  aspectosDestacados: string;
  privacidad: string;
  invitarAmigos: string;
  shareLink: string;
  projectId: string;
  onPrivacidadChange: (value: string) => void;
  onInvitarAmigosChange: (value: string) => void;
  onCopyLink: () => void;
  onInvite: (
    emailOrUsername: string
  ) => Promise<{ success: boolean; message: string }>;
}

export const Step4Success: React.FC<Step4SuccessProps> = ({
  privacidad,
  invitarAmigos,
  shareLink,
  onPrivacidadChange,
  onInvitarAmigosChange,
  onCopyLink,
  onInvite,
}) => {
  const [isInviting, setIsInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleInvite = async () => {
    if (!invitarAmigos.trim()) {
      setInviteMessage({
        type: 'error',
        text: 'Ingresa un correo o nombre de usuario',
      });
      return;
    }

    setIsInviting(true);
    setInviteMessage(null);

    try {
      const result = await onInvite(invitarAmigos.trim());
      if (result.success) {
        setInviteMessage({ type: 'success', text: result.message });
        onInvitarAmigosChange(''); // Limpiar el campo
      } else {
        setInviteMessage({ type: 'error', text: result.message });
      }
    } catch {
      setInviteMessage({
        type: 'error',
        text: 'Error al enviar la invitación',
      });
    } finally {
      setIsInviting(false);
    }
  };

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
          <div className="invite-input-group">
            <input
              type="text"
              className="form-input dark"
              placeholder="Correo o Nombre de Usuario..."
              value={invitarAmigos}
              onChange={(e) => onInvitarAmigosChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              disabled={isInviting}
            />
            <button
              type="button"
              className="invite-button"
              onClick={handleInvite}
              disabled={isInviting || !invitarAmigos.trim()}
            >
              {isInviting ? (
                <span className="invite-loading">...</span>
              ) : (
                <IonIcon icon={sendOutline} />
              )}
            </button>
          </div>
          {inviteMessage && (
            <div className={`invite-message ${inviteMessage.type}`}>
              {inviteMessage.text}
            </div>
          )}
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
