import React, { useEffect, useState } from 'react';
import { IonIcon, useIonToast } from '@ionic/react';
import {
  personOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  mailOutline,
} from 'ionicons/icons';
import { Project } from '@/models/projects';
import { InvestmentPosition } from '@/models/membership';
import { projectMembershipService } from '@/services/projects';
import './ProjectDetailTabs.css';

interface SolicitudesTabProps {
  project: Project;
}

export const SolicitudesTab: React.FC<SolicitudesTabProps> = ({ project }) => {
  const [present] = useIonToast();
  const [pendingRequests, setPendingRequests] = useState<InvestmentPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingRequests();
  }, [project.id]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const requests = await projectMembershipService.getPendingRequests(project.id);
      setPendingRequests(requests);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      await projectMembershipService.approveMembership(project.id, requestId);

      await present({
        message: 'Solicitud aprobada exitosamente',
        duration: 2000,
        color: 'success',
      });

      // Actualizar la lista
      await fetchPendingRequests();
    } catch (error: any) {
      await present({
        message: error.message || 'Error al aprobar la solicitud',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      await projectMembershipService.rejectMembership(project.id, requestId);

      await present({
        message: 'Solicitud rechazada',
        duration: 2000,
        color: 'warning',
      });

      // Actualizar la lista
      await fetchPendingRequests();
    } catch (error: any) {
      await present({
        message: error.message || 'Error al rechazar la solicitud',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="solicitudes-tab">
        <div className="solicitudes-loading">
          <p>Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="solicitudes-tab">
      <h2 className="solicitudes-title">Solicitudes pendientes</h2>

      {pendingRequests.length === 0 ? (
        <div className="solicitudes-empty">
          <IonIcon icon={mailOutline} className="empty-icon" />
          <p className="empty-text">No hay solicitudes pendientes</p>
          <p className="empty-subtext">
            Las personas que soliciten unirse aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="solicitudes-list">
          {pendingRequests.map((request) => (
            <div key={request.id} className="solicitud-card">
              <div className="solicitud-header">
                <div className="solicitud-avatar">
                  <IonIcon icon={personOutline} />
                </div>
                <div className="solicitud-info">
                  <h3 className="solicitud-name">
                    {request.user?.displayName || request.user?.username || 'Usuario'}
                  </h3>
                  <p className="solicitud-username">
                    @{request.user?.username || 'usuario'}
                  </p>
                  {request.user?.email && (
                    <p className="solicitud-email">{request.user.email}</p>
                  )}
                </div>
              </div>

              <div className="solicitud-details">
                <div className="solicitud-detail-item">
                  <span className="detail-label">Monto solicitado:</span>
                  <span className="detail-value">
                    {request.base_amount?.toLocaleString('es-CO')} {request.base_currency || 'COP'}
                  </span>
                </div>
                <div className="solicitud-detail-item">
                  <span className="detail-label">Fecha de solicitud:</span>
                  <span className="detail-value">
                    {new Date(request.created_at).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="solicitud-actions">
                <button
                  className="solicitud-button reject"
                  onClick={() => handleReject(request.id)}
                  disabled={processingId === request.id}
                >
                  <IonIcon icon={closeCircleOutline} />
                  Rechazar
                </button>
                <button
                  className="solicitud-button approve"
                  onClick={() => handleApprove(request.id)}
                  disabled={processingId === request.id}
                >
                  <IonIcon icon={checkmarkCircleOutline} />
                  Aceptar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
