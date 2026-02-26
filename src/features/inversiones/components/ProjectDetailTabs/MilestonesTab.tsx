import React, { useEffect, useState } from 'react';
import { IonIcon, IonButton, IonSpinner } from '@ionic/react';
import { checkmarkCircleOutline, timeOutline, rocketOutline, cashOutline, openOutline } from 'ionicons/icons';
import { Project } from '@/models/projects';
import { apiService } from '@/services/api/api.service';
import { BLOCKCHAIN_CONFIG } from '@/contracts/config';
import { blockchainService } from '@/services/blockchain.service';
import { useActiveAccount } from 'thirdweb/react';
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
  isOwner?: boolean;
}

const CELOSCAN_TX = (hash: string) => `https://alfajores.celoscan.io/tx/${hash}`;

export const MilestonesTab: React.FC<MilestonesTabProps> = ({ project, isOwner = false }) => {
  const account = useActiveAccount();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [txHashes, setTxHashes] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const loadMilestones = async () => {
    try {
      const response = await apiService.get<Milestone[]>(`/projects/${project.id}/milestones`);
      setMilestones(response.data);
    } catch {
      // silenciar
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadMilestones();
      setLoading(false);
    };
    init();
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

  const hasPendingOrApproved = milestones.some(m => m.status === 'PENDING' || m.status === 'APPROVED');
  const canPropose =
    isOwner &&
    !hasPendingOrApproved &&
    !!project.milestones_address &&
    !!project.vault_address;

  const handlePropose = async () => {
    if (!account || !project.milestones_address || !project.vault_address) return;
    setActionLoading('propose');
    setActionError(null);
    try {
      const txHash = await blockchainService.proposeMilestoneOnChain(
        account,
        project.milestones_address,
        'Hito de cierre — entrega de fondos al dueño',
        project.vault_address,
      );
      setTxHashes(prev => ({ ...prev, propose: txHash }));
      await loadMilestones();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al proponer hito');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExecute = async (milestone: Milestone) => {
    if (!account || !project.milestones_address) return;
    setActionLoading(milestone.id);
    setActionError(null);
    try {
      const txHash = await blockchainService.executeMilestone(
        account,
        project.milestones_address,
        BigInt(milestone.milestone_chain_id),
      );
      setTxHashes(prev => ({ ...prev, [milestone.id]: txHash }));
      await loadMilestones();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al solicitar fondos');
    } finally {
      setActionLoading(null);
    }
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

      {actionError && (
        <div className="chain-error-banner" style={{ marginBottom: '12px' }}>
          <p>{actionError}</p>
        </div>
      )}

      {canPropose && (
        <div className="milestone-propose-section">
          <p className="milestone-propose-hint">
            No hay hitos activos. Puedes proponer el hito de cierre para recibir los fondos recaudados.
          </p>
          <IonButton
            expand="block"
            className="milestone-action-btn"
            onClick={handlePropose}
            disabled={actionLoading === 'propose'}
          >
            {actionLoading === 'propose' ? (
              <><IonSpinner name="crescent" />&nbsp;Proponiendo...</>
            ) : (
              'Proponer hito de cierre'
            )}
          </IonButton>
          {txHashes['propose'] && (
            <a
              href={CELOSCAN_TX(txHashes['propose'])}
              target="_blank"
              rel="noreferrer"
              className="milestone-tx-link"
            >
              <IonIcon icon={openOutline} /> Ver transacción
            </a>
          )}
        </div>
      )}

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

                {isOwner && milestone.status === 'APPROVED' && (
                  <div className="milestone-execute-section">
                    <IonButton
                      expand="block"
                      color="success"
                      className="milestone-action-btn"
                      onClick={() => handleExecute(milestone)}
                      disabled={actionLoading === milestone.id}
                    >
                      {actionLoading === milestone.id ? (
                        <><IonSpinner name="crescent" />&nbsp;Procesando...</>
                      ) : (
                        'Solicitar fondos'
                      )}
                    </IonButton>
                    {txHashes[milestone.id] && (
                      <a
                        href={CELOSCAN_TX(txHashes[milestone.id])}
                        target="_blank"
                        rel="noreferrer"
                        className="milestone-tx-link"
                      >
                        <IonIcon icon={openOutline} /> Ver transacción
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
