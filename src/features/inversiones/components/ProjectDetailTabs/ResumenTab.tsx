import React from 'react';
import { IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  checkmarkCircleOutline,
  lockClosedOutline,
  globeOutline,
  calendarOutline,
  walletOutline,
} from 'ionicons/icons';
import { Project } from '@/models/projects';
import './ProjectDetailTabs.css';

interface ResumenTabProps {
  project: Project;
  isOwner: boolean;
  showJoinButton?: boolean;
  onJoinAction?: () => void;
  joinStatus?: 'pending' | 'approved' | null;
  isMember?: boolean;
}

export const ResumenTab: React.FC<ResumenTabProps> = ({
  project,
  isOwner,
  showJoinButton,
  onJoinAction,
  joinStatus,
  isMember = false,
}) => {
  const history = useHistory();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleGoToPayment = () => {
    history.push(`/pago/${project.id}`);
  };

  return (
    <div className="resumen-tab">
      <div className="resumen-section">
        <div className="resumen-header">
          <h1 className="resumen-title">{project.name}</h1>
          {project.owner_user && (
            <div className="resumen-owner">
              <span className="owner-label">{project.owner_user.username}</span>
              {isOwner && (
                <IonIcon
                  icon={checkmarkCircleOutline}
                  className="verified-badge"
                />
              )}
            </div>
          )}
        </div>

        {/* Badges de info rápida */}
        <div className="resumen-badges">
          <div className="info-badge">
            <IonIcon
              icon={
                project.visibility === 'PUBLIC'
                  ? globeOutline
                  : lockClosedOutline
              }
              className="badge-icon"
            />
            <span>
              {project.visibility === 'PUBLIC' ? 'Público' : 'Privado'}
            </span>
          </div>
          <div className="info-badge">
            <IonIcon icon={calendarOutline} className="badge-icon" />
            <span>Creado el {formatDate(project.created_at)}</span>
          </div>
        </div>

        {project.description_rich && (
          <div className="resumen-content-block">
            <h3 className="content-block-title">Descripción de proyecto</h3>
            <div
              className="content-block-text"
              dangerouslySetInnerHTML={{ __html: project.description_rich }}
            />
          </div>
        )}

        {project.highlights_rich && (
          <div className="resumen-content-block">
            <h3 className="content-block-title">Aspectos destacados</h3>
            <div
              className="content-block-text"
              dangerouslySetInnerHTML={{ __html: project.highlights_rich }}
            />
          </div>
        )}
      </div>

      {showJoinButton && (
        <div className="resumen-actions">
          <button
            className="action-button secondary"
            onClick={() => window.history.back()}
          >
            Tal vez en otro momento.
          </button>
          <button
            className="action-button primary"
            onClick={onJoinAction}
            disabled={joinStatus === 'pending' || joinStatus === 'approved'}
          >
            {joinStatus === 'pending'
              ? 'Solicitud Enviada'
              : joinStatus === 'approved'
                ? 'Ya eres miembro'
                : `Unirme a la ${project.type === 'NATILLERA' ? 'Natillera' : 'Tokenización'}`}
          </button>
        </div>
      )}

      {isMember &&
        !isOwner &&
        !showJoinButton &&
        (() => {
          const deadline = project.natillera_details?.payment_deadline_at;
          const isPastDeadline = deadline
            ? new Date() >= new Date(deadline)
            : false;
          return isPastDeadline ? (
            <div className="resumen-actions">
              <button
                className="action-button payment-button-highlighted"
                onClick={handleGoToPayment}
              >
                <IonIcon icon={walletOutline} className="button-icon" />
                Realizar Pago
              </button>
            </div>
          ) : null;
        })()}
    </div>
  );
};
