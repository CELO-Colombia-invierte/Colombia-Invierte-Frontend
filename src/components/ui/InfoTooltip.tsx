import React, { useId } from 'react';
import { IonIcon, IonPopover, IonContent } from '@ionic/react';
import { informationCircleOutline } from 'ionicons/icons';
import './InfoTooltip.css';

interface InfoTooltipProps {
  text: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  const rawId = useId();
  const triggerId = `tooltip-${rawId.replace(/:/g, '')}`;

  return (
    <>
      <button
        type="button"
        id={triggerId}
        className="info-tooltip-trigger"
        onClick={(e) => e.stopPropagation()}
        aria-label="Más información"
      >
        <IonIcon icon={informationCircleOutline} />
      </button>
      <IonPopover
        trigger={triggerId}
        triggerAction="click"
        showBackdrop={false}
        dismissOnSelect={true}
        className="info-tooltip-popover"
      >
        <IonContent>
          <p className="info-tooltip-content">{text}</p>
        </IonContent>
      </IonPopover>
    </>
  );
};

export default InfoTooltip;
