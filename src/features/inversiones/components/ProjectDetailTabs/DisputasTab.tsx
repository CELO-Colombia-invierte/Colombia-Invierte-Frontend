import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { warningOutline, checkmarkCircleOutline, timeOutline } from 'ionicons/icons';
import { Project } from '@/models/projects';
import { apiService } from '@/services/api/api.service';
import './ProjectDetailTabs.css';

interface Dispute {
  id: string;
  dispute_chain_id: string;
  opener_address: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED';
  resolution: string | null;
  opened_at: string;
  resolved_at: string | null;
}

interface DisputasTabProps {
  project: Project;
}

export const DisputasTab: React.FC<DisputasTabProps> = ({ project }) => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await apiService.get<Dispute[]>(`/projects/${project.id}/disputes`);
        setDisputes(response.data);
      } catch {
        // silenciar
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [project.id]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const formatAddress = (address: string) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '—';

  if (loading) {
    return (
      <div className="disputas-tab">
        <h2 className="disputas-title">Disputas</h2>
        <p className="chain-state-loading">Cargando disputas...</p>
      </div>
    );
  }

  return (
    <div className="disputas-tab">
      <h2 className="disputas-title">Disputas</h2>

      {disputes.length === 0 ? (
        <div className="historial-empty">
          <IonIcon icon={checkmarkCircleOutline} className="empty-icon" />
          <p className="empty-text">Sin disputas</p>
          <p className="empty-subtext">No hay disputas abiertas en este proyecto</p>
        </div>
      ) : (
        <div className="disputas-list">
          {disputes.map(dispute => (
            <div key={dispute.id} className="disputa-item">
              <div className="disputa-item-header">
                <div className="disputa-item-meta">
                  <span className="disputa-item-id">#{dispute.dispute_chain_id}</span>
                  <span className="disputa-opener">{formatAddress(dispute.opener_address)}</span>
                </div>
                <span className={`chain-stat-badge ${dispute.status === 'OPEN' ? 'badge-warning' : 'badge-done'}`}>
                  <IonIcon icon={dispute.status === 'OPEN' ? warningOutline : checkmarkCircleOutline} />
                  {dispute.status === 'OPEN' ? 'Abierta' : 'Resuelta'}
                </span>
              </div>
              <p className="disputa-reason">{dispute.reason}</p>
              {dispute.resolution && (
                <p className="disputa-resolution">
                  <strong>Resolución:</strong> {dispute.resolution}
                </p>
              )}
              <div className="disputa-dates">
                <span className="disputa-date">
                  <IonIcon icon={timeOutline} /> Abierta: {formatDate(dispute.opened_at)}
                </span>
                {dispute.resolved_at && (
                  <span className="disputa-date">
                    <IonIcon icon={checkmarkCircleOutline} /> Resuelta: {formatDate(dispute.resolved_at)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
