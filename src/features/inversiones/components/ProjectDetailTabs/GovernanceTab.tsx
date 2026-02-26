import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { checkmarkCircleOutline, closeCircleOutline, timeOutline, thumbsUpOutline, thumbsDownOutline } from 'ionicons/icons';
import { Project } from '@/models/projects';
import { apiService } from '@/services/api/api.service';
import './ProjectDetailTabs.css';

interface Proposal {
  id: string;
  proposal_chain_id: string;
  description: string;
  status: 'ACTIVE' | 'EXECUTED' | 'DEFEATED';
  votes_for: string;
  votes_against: string;
  created_at: string;
}

interface GovernanceTabProps {
  project: Project;
}

export const GovernanceTab: React.FC<GovernanceTabProps> = ({ project }) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await apiService.get<Proposal[]>(`/projects/${project.id}/proposals`);
        setProposals(response.data);
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

  const statusLabel: Record<string, string> = {
    ACTIVE: 'Activa',
    EXECUTED: 'Ejecutada',
    DEFEATED: 'Rechazada',
  };

  const statusClass: Record<string, string> = {
    ACTIVE: 'badge-active',
    EXECUTED: 'badge-done',
    DEFEATED: 'badge-rejected',
  };

  const statusIcon: Record<string, string> = {
    ACTIVE: timeOutline,
    EXECUTED: checkmarkCircleOutline,
    DEFEATED: closeCircleOutline,
  };

  if (loading) {
    return (
      <div className="governance-tab">
        <h2 className="governance-title">Gobernanza</h2>
        <p className="chain-state-loading">Cargando propuestas...</p>
      </div>
    );
  }

  return (
    <div className="governance-tab">
      <h2 className="governance-title">Gobernanza</h2>

      {proposals.length === 0 ? (
        <div className="historial-empty">
          <IonIcon icon={timeOutline} className="empty-icon" />
          <p className="empty-text">Sin propuestas aún</p>
          <p className="empty-subtext">Las propuestas de gobernanza aparecerán aquí</p>
        </div>
      ) : (
        <div className="governance-list">
          {proposals.map(proposal => (
            <div key={proposal.id} className="governance-item">
              <div className="governance-item-header">
                <span className="governance-item-id">#{proposal.proposal_chain_id}</span>
                <span className={`chain-stat-badge ${statusClass[proposal.status] ?? 'badge-pending'}`}>
                  <IonIcon icon={statusIcon[proposal.status] ?? timeOutline} />
                  {statusLabel[proposal.status] ?? proposal.status}
                </span>
              </div>
              <p className="governance-item-description">{proposal.description}</p>
              <div className="governance-item-votes">
                <span className="governance-vote governance-vote--for">
                  <IonIcon icon={thumbsUpOutline} />
                  {Number(proposal.votes_for).toLocaleString('es-CO')} a favor
                </span>
                <span className="governance-vote governance-vote--against">
                  <IonIcon icon={thumbsDownOutline} />
                  {Number(proposal.votes_against).toLocaleString('es-CO')} en contra
                </span>
              </div>
              <span className="governance-item-date">{formatDate(proposal.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
