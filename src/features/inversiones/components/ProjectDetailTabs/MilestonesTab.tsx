import React, { useEffect, useState } from 'react';
import { IonIcon, IonButton, IonSpinner } from '@ionic/react';
import { checkmarkCircleOutline, timeOutline, rocketOutline, cashOutline, openOutline, addOutline } from 'ionicons/icons';
import { Project } from '@/models/projects';
import { apiService } from '@/services/api/api.service';
import { governanceService, GovernanceAction } from '@/services/governance.service';
import type { Proposal } from './GovernanceTab/types';
import { BLOCKCHAIN_CONFIG } from '@/contracts/config';
import { blockchainService, decodeContractRevert } from '@/services/blockchain.service';
import { useActiveAccount } from 'thirdweb/react';
import './ProjectDetailTabs.css';

interface Milestone {
  id: string;
  milestone_chain_id: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'EXECUTED';
  amount: string;
  recipient?: string;
  approved_at: string | null;
  executed_at: string | null;
  optimistic?: boolean;
}

interface MilestonesTabProps {
  project: Project;
  isOwner?: boolean;
}

const CELOSCAN_TX = (hash: string) => `https://sepolia.celoscan.io/tx/${hash}`;

export const MilestonesTab: React.FC<MilestonesTabProps> = ({ project, isOwner = false }) => {
  const account = useActiveAccount();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [txHashes, setTxHashes] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [saleFinalized, setSaleFinalized] = useState<boolean | null>(null);
  const [projectFunds, setProjectFunds] = useState<bigint>(0n);
  const [committed, setCommitted] = useState<bigint>(0n);

  const [showForm, setShowForm] = useState(false);
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  // Hitos recien propuestos on-chain que aun no indexa el backend.
  const [optimistic, setOptimistic] = useState<Milestone[]>([]);

  const loadMilestones = async () => {
    try {
      const response = await apiService.get<Milestone[]>(`/projects/${project.id}/milestones`);
      const real = response.data ?? [];
      setMilestones(real);
      // Cuando el indexer ya registró el hito, quitamos su card optimista.
      setOptimistic((prev) =>
        prev.filter((o) => !real.some((r) => r.description.trim() === o.description.trim())),
      );
    } catch {
    }
  };

  const loadOnChainState = async () => {
    if (!project.revenue_address) return;
    try {
      const state = await blockchainService.getRevenueModuleState(project.revenue_address);
      setSaleFinalized(state.saleFinalized);
    } catch {
      setSaleFinalized(null);
    }
    try {
      const funds = await blockchainService.getProjectFunds(project.revenue_address);
      setProjectFunds(funds);
    } catch {
      setProjectFunds(0n);
    }
    if (project.milestones_address) {
      try {
        const c = await blockchainService.getMilestonesCommitted(
          project.milestones_address,
          BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS,
        );
        setCommitted(c);
      } catch {
        setCommitted(0n);
      }
    }
  };

  const loadProposals = async () => {
    try {
      const response = await apiService.get<Proposal[]>(`/projects/${project.id}/governance/proposals`);
      setProposals(response.data ?? []);
    } catch {
      setProposals([]);
    }
  };

  const findApprovalProposal = (milestoneChainId: string) =>
    proposals.find(
      (p) => p.action === GovernanceAction.ApproveAndExecuteMilestone && p.target_id === milestoneChainId,
    );

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadMilestones(), loadOnChainState(), loadProposals()]);
      setLoading(false);
    };
    init();
  }, [project.id]);

  // Mientras haya cards optimistas, reconsultamos el backend hasta que el
  // indexer registre el hito y la card optimista se reemplace por la real.
  useEffect(() => {
    if (optimistic.length === 0) return;
    let attempts = 0;
    const iv = setInterval(() => {
      attempts += 1;
      loadMilestones();
      if (attempts >= 30) clearInterval(iv);
    }, 4000);
    return () => clearInterval(iv);
  }, [optimistic.length]);


  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const formatUsdc = (amount: bigint | string) => {
    const asBig =
      typeof amount === 'bigint'
        ? amount
        : BigInt((amount || '0').toString().split('.')[0] || '0');
    return blockchainService.formatUnits(asBig, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS);
  };

  const statusLabel: Record<string, string> = { PENDING: 'Pendiente', APPROVED: 'Aprobado', EXECUTED: 'Ejecutado' };
  const statusClass: Record<string, string> = { PENDING: 'badge-pending', APPROVED: 'badge-active', EXECUTED: 'badge-done' };
  const statusIcon: Record<string, string> = { PENDING: timeOutline, APPROVED: rocketOutline, EXECUTED: checkmarkCircleOutline };

  const disponible = projectFunds > committed ? projectFunds - committed : 0n;

  const canPropose =
    isOwner &&
    !!project.milestones_address &&
    !!project.revenue_address &&
    saleFinalized === true &&
    disponible > 0n;

  const handlePropose = async () => {
    setActionError(null);
    if (!account) {
      setActionError('Conecta tu wallet para proponer un hito.');
      return;
    }
    if (!project.milestones_address) {
      setActionError('Este proyecto no tiene MilestonesModule desplegado.');
      return;
    }

    if (!formDescription.trim()) {
      setActionError('La descripción es requerida.');
      return;
    }
    let amount: bigint;
    try {
      amount = blockchainService.parseUnits(formAmount, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS);
    } catch {
      setActionError('Monto inválido.');
      return;
    }
    if (amount <= 0n) {
      setActionError('El monto debe ser mayor a 0.');
      return;
    }
    if (amount > disponible) {
      setActionError(`El monto excede el disponible (${formatUsdc(disponible)} USDC).`);
      return;
    }

    setActionLoading('propose');
    try {
      const desc = formDescription.trim();
      const txHash = await blockchainService.proposeMilestoneCustom(
        account,
        project.milestones_address,
        desc,
        account.address,
        amount,
      );
      setTxHashes(prev => ({ ...prev, propose: txHash }));
      // Card optimista: el hito ya está en cadena; se muestra al instante
      // y el polling la reemplaza por la real cuando el indexer la registre.
      setOptimistic(prev => [
        ...prev,
        {
          id: `optimistic-${txHash}`,
          milestone_chain_id: '',
          description: desc,
          status: 'PENDING',
          amount: amount.toString(),
          recipient: account.address,
          approved_at: null,
          executed_at: null,
          optimistic: true,
        },
      ]);
      setFormDescription('');
      setFormAmount('');
      setShowForm(false);
      await Promise.all([loadMilestones(), loadOnChainState()]);
    } catch (err) {
      setActionError(decodeContractRevert(err) ?? (err instanceof Error ? err.message : 'Error al proponer hito'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleProposeApproval = async (milestone: Milestone) => {
    if (!account || !project.governance_address) {
      setActionError('Conecta tu wallet o el proyecto no tiene gobernanza.');
      return;
    }
    const existing = findApprovalProposal(milestone.milestone_chain_id);
    if (existing && existing.status === 'ACTIVE') {
      setActionError('Ya existe una propuesta activa de aprobación para este hito.');
      return;
    }
    setActionLoading(`propose-approval-${milestone.id}`);
    setActionError(null);
    try {
      const params = governanceService.buildMilestoneApprovalProposal({
        projectId: project.id,
        governanceAddress: project.governance_address,
        milestoneChainId: milestone.milestone_chain_id,
        description: `Aprobar y ejecutar hito #${milestone.milestone_chain_id}: ${milestone.description.slice(0, 80)}`,
      });
      await governanceService.createProposal(account, params);
      await Promise.all([loadMilestones(), loadProposals()]);
    } catch (err) {
      setActionError(decodeContractRevert(err) ?? (err instanceof Error ? err.message : 'Error al proponer'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleVote = async (milestone: Milestone, proposalChainId: string, support: boolean) => {
    if (!account || !project.governance_address) return;
    setActionLoading(`vote-${milestone.id}-${support}`);
    setActionError(null);
    try {
      await governanceService.vote(account, project.governance_address, proposalChainId, support);
      await loadProposals();
    } catch (err) {
      setActionError(decodeContractRevert(err) ?? (err instanceof Error ? err.message : 'Error al votar'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleExecuteProposal = async (milestone: Milestone, proposalChainId: string) => {
    if (!account || !project.governance_address) return;
    setActionLoading(`exec-prop-${milestone.id}`);
    setActionError(null);
    try {
      const txHash = await governanceService.execute(account, project.governance_address, proposalChainId);
      setTxHashes((prev) => ({ ...prev, [milestone.id]: txHash }));
      await Promise.all([loadMilestones(), loadProposals()]);
    } catch (err) {
      setActionError(decodeContractRevert(err) ?? (err instanceof Error ? err.message : 'Error al ejecutar propuesta'));
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
      try {
        await apiService.post(`/milestones/${milestone.id}/execute`, {});
      } catch {}
      await loadMilestones();
    } catch (err) {
      setActionError(decodeContractRevert(err) ?? (err instanceof Error ? err.message : 'Error al ejecutar hito'));
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

      {saleFinalized === false && (
        <div className="chain-error-banner" style={{ marginBottom: 12 }}>
          <p>Los hitos se habilitan una vez que finalices la venta desde la pestaña Finanzas.</p>
        </div>
      )}

      {saleFinalized === true && (
        <div className="chain-state-grid" style={{ marginBottom: 12 }}>
          <div className="chain-stat-card">
            <span className="chain-stat-label">Recaudado neto</span>
            <span className="chain-stat-value">{formatUsdc(projectFunds)} USDC</span>
          </div>
          <div className="chain-stat-card">
            <span className="chain-stat-label">Comprometido en hitos</span>
            <span className="chain-stat-value">{formatUsdc(committed)} USDC</span>
          </div>
          <div className="chain-stat-card">
            <span className="chain-stat-label">Disponible</span>
            <span className="chain-stat-value">{formatUsdc(disponible)} USDC</span>
          </div>
        </div>
      )}

      {actionError && (
        <div className="chain-error-banner" style={{ marginBottom: 12 }}>
          <p>{actionError}</p>
        </div>
      )}

      {canPropose && !showForm && (
        <IonButton
          expand="block"
          className="milestone-action-btn"
          onClick={() => { setShowForm(true); setActionError(null); }}
        >
          <IonIcon icon={addOutline} slot="start" /> Nuevo hito
        </IonButton>
      )}

      {canPropose && showForm && (
        <div className="milestone-propose-section">
          <h4 style={{ margin: '0 0 8px' }}>Crear hito</h4>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Descripción</label>
          <textarea
            rows={3}
            value={formDescription}
            onChange={e => setFormDescription(e.target.value)}
            placeholder="Ej. Compra de materiales fase 1"
            style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ddd', marginBottom: 10 }}
          />
          <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Monto en USDC</label>
          <input
            type="number"
            value={formAmount}
            onChange={e => setFormAmount(e.target.value)}
            placeholder="0.00"
            style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ddd', marginBottom: 10 }}
          />
          <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 12px' }}>
            Los fondos del hito se liberan a tu wallet conectada (creador del proyecto).
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <IonButton
              expand="block"
              className="milestone-action-btn"
              onClick={handlePropose}
              disabled={actionLoading === 'propose'}
            >
              {actionLoading === 'propose' ? (
                <><IonSpinner name="crescent" />&nbsp;Proponiendo...</>
              ) : (
                'Proponer hito'
              )}
            </IonButton>
            <IonButton
              expand="block"
              fill="outline"
              onClick={() => { setShowForm(false); setActionError(null); }}
            >
              Cancelar
            </IonButton>
          </div>
          {txHashes['propose'] && (
            <a href={CELOSCAN_TX(txHashes['propose'])} target="_blank" rel="noreferrer" className="milestone-tx-link">
              <IonIcon icon={openOutline} /> Ver transacción
            </a>
          )}
        </div>
      )}

      {milestones.length === 0 && optimistic.length === 0 ? (
        <div className="historial-empty">
          <IonIcon icon={rocketOutline} className="empty-icon" />
          <p className="empty-text">Sin hitos aún</p>
          <p className="empty-subtext">Los hitos del proyecto aparecerán aquí</p>
        </div>
      ) : (
        <div className="milestones-list">
          {[...milestones, ...optimistic].map((milestone, index) => {
            if (milestone.optimistic) {
              return (
                <div key={milestone.id} className="milestone-item milestone-item-optimistic">
                  <div className="milestone-item-number">{index + 1}</div>
                  <div className="milestone-item-content">
                    <div className="milestone-item-header">
                      <span className="chain-stat-badge badge-pending">
                        <IonSpinner name="crescent" style={{ width: 14, height: 14 }} />
                        &nbsp;Confirmando en cadena…
                      </span>
                      <span className="milestone-amount">
                        <IonIcon icon={cashOutline} />
                        {formatUsdc(milestone.amount)} USDC
                      </span>
                    </div>
                    <p className="milestone-description">{milestone.description}</p>
                    <span className="milestone-date">
                      El hito ya quedó registrado en la blockchain. La card se actualizará en unos segundos.
                    </span>
                  </div>
                </div>
              );
            }
            return (
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
                {milestone.status === 'PENDING' && (() => {
                  const proposal = findApprovalProposal(milestone.milestone_chain_id);
                  const proposeBusy = actionLoading === `propose-approval-${milestone.id}`;
                  const execBusy = actionLoading === `exec-prop-${milestone.id}`;
                  if (!proposal) {
                    return (
                      <div className="milestone-vote-section">
                        <p className="milestone-vote-hint">Para liberar estos fondos cualquier inversor con tokens puede iniciar la aprobación en gobernanza.</p>
                        <IonButton
                          expand="block"
                          className="milestone-action-btn"
                          onClick={() => handleProposeApproval(milestone)}
                          disabled={proposeBusy || !account}
                        >
                          {proposeBusy ? (<><IonSpinner name="crescent" />&nbsp;Proponiendo…</>) : 'Proponer aprobación'}
                        </IonButton>
                      </div>
                    );
                  }
                  if (proposal.status === 'ACTIVE') {
                    const yesBusy = actionLoading === `vote-${milestone.id}-true`;
                    const noBusy = actionLoading === `vote-${milestone.id}-false`;
                    return (
                      <div className="milestone-vote-section">
                        <div className="milestone-vote-tally">
                          <span className="milestone-vote-yes">👍 {proposal.votes_for ?? '0'}</span>
                          <span className="milestone-vote-no">👎 {proposal.votes_against ?? '0'}</span>
                        </div>
                        <div className="milestone-vote-row">
                          <IonButton
                            expand="block"
                            color="success"
                            onClick={() => handleVote(milestone, proposal.proposal_chain_id, true)}
                            disabled={yesBusy || !account}
                          >
                            {yesBusy ? 'Votando…' : 'Votar Sí'}
                          </IonButton>
                          <IonButton
                            expand="block"
                            color="medium"
                            onClick={() => handleVote(milestone, proposal.proposal_chain_id, false)}
                            disabled={noBusy || !account}
                          >
                            {noBusy ? 'Votando…' : 'Votar No'}
                          </IonButton>
                        </div>
                        <IonButton
                          expand="block"
                          fill="outline"
                          onClick={() => handleExecuteProposal(milestone, proposal.proposal_chain_id)}
                          disabled={execBusy || !account}
                        >
                          {execBusy ? 'Ejecutando…' : 'Ejecutar (si terminó la votación)'}
                        </IonButton>
                      </div>
                    );
                  }
                  return (
                    <p className="milestone-vote-hint">
                      Propuesta {proposal.status === 'EXECUTED' ? 'ejecutada' : 'rechazada'} en gobernanza.
                    </p>
                  );
                })()}
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
                      <a href={CELOSCAN_TX(txHashes[milestone.id])} target="_blank" rel="noreferrer" className="milestone-tx-link">
                        <IonIcon icon={openOutline} /> Ver transacción
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
