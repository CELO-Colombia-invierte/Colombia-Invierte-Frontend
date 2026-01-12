import React from 'react';
import { IonIcon } from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import './NewProjectCard.css';

interface NewProjectCardProps {
  onClick?: () => void;
  text?: string;
}

export const NewProjectCard: React.FC<NewProjectCardProps> = ({
  onClick,
  text = 'Nuevo proyecto'
}) => {
  return (
    <div className="new-project-card" onClick={onClick}>
      <div className="new-project-card-content">
        <div className="new-project-card-icon">
          <IonIcon icon={addOutline} />
        </div>
        <p className="new-project-card-text">{text}</p>
      </div>
    </div>
  );
};

export default NewProjectCard;
