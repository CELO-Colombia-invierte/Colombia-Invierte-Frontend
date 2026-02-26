import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { checkmarkCircleOutline, timeOutline, rocketOutline, cashOutline } from 'ionicons/icons';
import { Project } from '@/models/projects';
import { apiService } from '@/services/api/api.service';
import { BLOCKCHAIN_CONFIG } from '@/contracts/config';
import { blockchainService } from '@/services/blockchain.service';
import './ProjectDetailTabs.css';

interface Milestone {
  id: string;
  milestone_chain_id: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'EXECUTED';
  amount: string;
  approved_at: string | null;
  executed_at: string | null;
}

interface MilestonesTabProps {
  project: Project;
}

export const MilestonesTab: React.FC<MilestonesTabProps> = ({ project }) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await apiService.get<Milestone[]>(`/projects/${project.id}/milestones`);
        setMilestones(response.data);
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

  const formatUsdc = (amount: string) =>
    blockchainService.formatUnits(BigInt(amount || '0'), BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS);

  const statusLabel: Record<string, string> = {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobado',
    EXECUTED: 'Ejecutado',
  };

  const statusClass: Record<string, string> = {
    PENDING: 'badge-pending',
    APPROVED: 'badge-active',
    EXECUTED: 'badge-done',
  };

  const statusIcon: Record<string, string> = {
    PENDING: timeOutline,
    APPROVED: rocketOutline,
    EXECUTED: checkmarkCircleOutline,
  };

  if (loading) {
    return (
      <div className="milestones-tab">
        <h2 className="milestones-title">Hitos</h2>
        <p className="chain-state-loading">Cargando hitos...</p>
      </div>
    );
  }

  return (
    <div className="milestones-tab">
      <h2 className="milestones-title">Hitos del proyecto</h2>

      {milestones.length === 0 ? (
        <div className="historial-empty">
          <IonIcon icon={rocketOutline} className="empty-icon" />
          <p className="empty-text">Sin hitos aún</p>
          <p className="empty-subtext">Los hitos del proyecto aparecerán aquí</p>
        </div>
      ) : (
        <div className="milestones-list">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="milestone-item">
              <div className="milestone-item-number">{index + 1}</div>
              <div className="milestone-item-content">
                <div className="milestone-item-header">
                  <span className={`chain-stat-badge ${statusClass[milestone.status] ?? 'badge-pending'}`}>
                    <IonIcon icon={statusIcon[milestone.status] ?? timeOutline} />
                    {statusLabel[milestone.status] ?? milestone.status}
                  </span>
                  <span className="milestone-amount">
                    <IonIcon icon={cashOutline} />
                    {formatUsdc(milestone.amount)} USDC
                  </span>
                </div>
                <p className="milestone-description">{milestone.description}</p>
                {milestone.approved_at && (
                  <span className="milestone-date">Aprobado: {formatDate(milestone.approved_at)}</span>
                )}
                {milestone.executed_at && (
                  <span className="milestone-date">Ejecutado: {formatDate(milestone.executed_at)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
