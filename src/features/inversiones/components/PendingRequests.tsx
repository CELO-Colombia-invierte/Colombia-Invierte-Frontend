import React, { useEffect, useState } from 'react';
import { IonIcon, IonSpinner, useIonToast } from '@ionic/react';
import { checkmarkCircle, closeCircle, personCircle } from 'ionicons/icons';
import { projectMembershipService } from '@/services/projects/membership.service';
import { InvestmentPosition } from '@/models/membership/membership.model';
import './PendingRequests.css';

interface PendingRequestsProps {
  projectId: string;
  onRequestsChange?: () => void;
}

export const PendingRequests: React.FC<PendingRequestsProps> = ({
  projectId,
  onRequestsChange,
}) => {
  const [requests, setRequests] = useState<InvestmentPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [present] = useIonToast();

  useEffect(() => {
    fetchPendingRequests();
  }, [projectId]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const data = await projectMembershipService.getPendingRequests(projectId);
      setRequests(data);
    } catch (error: any) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (positionId: string) => {
    try {
      setProcessingId(positionId);
      await projectMembershipService.approveMembership(projectId, positionId);
      
      await present({
        message: 'Solicitud aprobada exitosamente',
        duration: 2000,
        color: 'success',
      });

      await fetchPendingRequests();
      
      if (onRequestsChange) {
        onRequestsChange();
      }
    } catch (error: any) {
      console.error('Error approving request:', error);
      await present({
        message: error.message || 'Error al aprobar la solicitud',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (positionId: string) => {
    try {
      setProcessingId(positionId);
      await projectMembershipService.rejectMembership(projectId, positionId);
      
      await present({
        message: 'Solicitud rechazada',
        duration: 2000,
        color: 'warning',
      });

      await fetchPendingRequests();
      
      if (onRequestsChange) {
        onRequestsChange();
      }
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      await present({
        message: error.message || 'Error al rechazar la solicitud',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    const formatted = Number(amount).toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `$${formatted} ${currency}`;
  };

  if (loading) {
    return (
      <div className="pending-requests-loading">
        <IonSpinner name="crescent" />
      </div>
    );
  }

  if (requests.length === 0) {
    return null;
  }

  const isCompact = requests.length > 3;

  return (
    <div className="pending-requests-container">
      <h2 className="pending-requests-title">
        Solicitudes Pendientes ({requests.length})
      </h2>
      
      <div className={`pending-requests-list ${isCompact ? 'compact' : ''}`}>
        {requests.map((request) => (
          <div key={request.id} className="pending-request-card">
            <div className="pending-request-user">
              <div className="pending-request-avatar">
                {request.user?.avatarUrl ? (
                  <img src={request.user.avatarUrl} alt={request.user.username} />
                ) : (
                  <IonIcon icon={personCircle} />
                )}
              </div>
              
              <div className="pending-request-info">
                <span className="pending-request-name">
                  {request.user?.displayName || request.user?.username || 'Usuario'}
                </span>
                <span className="pending-request-username">
                  @{request.user?.username || 'desconocido'}
                </span>
                <div className="pending-request-meta">
                  <span className="pending-request-amount">
                    {formatCurrency(request.base_amount, request.base_currency)}
                  </span>
                  <span className="pending-request-date">
                    • {formatDate(request.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pending-request-actions">
              <button
                className="pending-request-btn approve"
                onClick={() => handleApprove(request.id)}
                disabled={processingId !== null}
              >
                {processingId === request.id ? (
                  <IonSpinner name="crescent" />
                ) : (
                  <>
                    <IonIcon icon={checkmarkCircle} />
                    Aprobar
                  </>
                )}
              </button>
              
              <button
                className="pending-request-btn reject"
                onClick={() => handleReject(request.id)}
                disabled={processingId !== null}
              >
                {processingId === request.id ? (
                  <IonSpinner name="crescent" />
                ) : (
                  <>
                    <IonIcon icon={closeCircle} />
                    Rechazar
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
