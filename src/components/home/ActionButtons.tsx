import React from 'react';
import { IonIcon } from '@ionic/react';
import { paperPlaneOutline, qrCodeOutline } from 'ionicons/icons';
import './ActionButtons.css';

interface ActionButtonsProps {
  onSend?: () => void;
  onReceive?: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onSend, onReceive }) => {
  return (
    <div className="action-buttons">
      <button
        className="action-button action-button-send"
        onClick={onSend}
        aria-label="Transferir"
      >
        <IonIcon icon={paperPlaneOutline} />
        <span>Transferir</span>
      </button>
      <button
        className="action-button action-button-receive"
        onClick={onReceive}
        aria-label="Recibir"
      >
        <IonIcon icon={qrCodeOutline} />
        <span>Recibir</span>
      </button>
    </div>
  );
};

export default ActionButtons;
