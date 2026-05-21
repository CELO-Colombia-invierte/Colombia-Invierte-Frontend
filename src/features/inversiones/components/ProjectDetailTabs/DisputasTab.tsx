import React, { useEffect, useState } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { warningOutline, checkmarkCircleOutline, timeOutline, addOutline, snowOutline, closeCircleOutline } from 'ionicons/icons';
import { Project } from '@/models/projects';
import { apiService } from '@/services/api/api.service';
import { useBlockchain } from '@/hooks/use-blockchain';
import { blockchainService, decodeContractRevert } from '@/services/blockchain.service';
import { governanceService, GovernanceAction } from '@/services/governance.service';
import type { Proposal } from './GovernanceTab/types';
import './ProjectDetailTabs.css';

interface Dispute {
  id: string;
  dispute_chain_id: string;
  opener_address: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED' | 'FROZEN';
  resolution: string | null;
  opened_at: string;
  resolved_at: string | null;
  optimistic?: boolean;
}

interface DisputasTabProps {
  project: Project;
}

export const DisputasTab: React.FC<DisputasTabProps> = ({ project }) => {
  const { account } = useBlockchain();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  // Disputas recien abiertas on-chain que aun no indexa el backend.
  const [optimisticDisputes, setOptimisticDisputes] = useState<Dispute[]>([]);

  const loadProposals = async () => {
    try {
      const response = await apiService.get<Proposal[]>(`/projects/${project.id}/governance/proposals`);
      setProposals(response.data ?? []);
    } catch {
      setProposals([]);
    }
  };

  const hasOpenProposal = (action: GovernanceAction, disputeChainId: string) =>
    proposals.some(
      (p) =>
        p.action === action &&
        p.status === 'ACTIVE' &&
        (action === GovernanceAction.CloseVault || p.target_id === disputeChainId),
    );

  const loadDisputes = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await apiService.get<Dispute[]>(`/projects/${project.id}/disputes`);
      const real = response.data ?? [];
      setDisputes(real);
      // Cuando el indexer ya registró la disputa, quitamos su card optimista.
      setOptimisticDisputes((prev) =>
        prev.filter((o) => !real.some((r) => r.reason.trim() === o.reason.trim())),
      );
    } catch {
      setDisputes([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
    loadProposals();
  }, [project.id]);

  // Mientras haya cards optimistas, reconsultamos hasta que el indexer
  // registre la disputa y la card optimista se reemplace por la real.
  useEffect(() => {
    if (optimisticDisputes.length === 0) return;
    let attempts = 0;
    const iv = setInterval(() => {
      attempts += 1;
      loadDisputes(true);
      if (attempts >= 30) clearInterval(iv);
    }, 4000);
    return () => clearInterval(iv);
  }, [optimisticDisputes.length]);

  const handleOpenDispute = async () => {
    if (!account || !project.disputes_address || !reason.trim()) {
      setError('Conecta wallet, escribe la razón y verifica que el proyecto sea V2.');
      return;
    }
    const myAddress = account.address.toLowerCase();
    try {
      const response = await apiService.get<Dispute[]>(`/projects/${project.id}/disputes`);
      const fresh = response.data ?? [];
      const mineOpen = fresh.filter(
        (d) => d.status !== 'RESOLVED' && d.opener_address?.toLowerCase() === myAddress,
      );
      setDisputes(fresh);
      if (mineOpen.length > 0) {
        const ids = mineOpen.map((d) => `#${d.dispute_chain_id}`).join(', ');
        setError(`Ya tienes una disputa abierta (${ids}). Espera a que la gobernanza actúe antes de abrir otra.`);
        return;
      }
    } catch {
      setError('No se pudo verificar tus disputas existentes. Intenta de nuevo.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const r = reason.trim();
      await governanceService.openDispute(account, {
        projectId: project.id,
        disputesAddress: project.disputes_address,
        reason: r,
      });
      // Card optimista: la disputa ya está en cadena; el polling la
      // reemplaza por la real cuando el indexer la registre.
      setOptimisticDisputes((prev) => [
        ...prev,
        {
          id: `optimistic-${Date.now()}`,
          dispute_chain_id: '',
          opener_address: account.address,
          reason: r,
          status: 'OPEN',
          resolution: null,
          opened_at: new Date().toISOString(),
          resolved_at: null,
          optimistic: true,
        },
      ]);
      setReason('');
      setShowCreate(false);
      await loadDisputes();
    } catch (err) {
      setError(decodeContractRevert(err) ?? (err as Error).message ?? 'Error al abrir disputa');
    } finally {
      setBusy(false);
    }
  };

  const handleProposeFreeze = async (dispute: Dispute) => {
    if (!account || !project.governance_address) return;
    if (hasOpenProposal(GovernanceAction.FreezeFromDispute, dispute.dispute_chain_id)) {
      setError('Ya existe una propuesta activa para congelar la bóveda por esta disputa. Ve a Gobernanza para votarla.');
      return;
    }
    if (project.disputes_address) {
      const exists = await blockchainService.checkDisputeExists(
        project.disputes_address,
        dispute.dispute_chain_id,
      );
      if (!exists) {
        setError('Esta disputa no existe on-chain o ya fue resuelta. Abre una disputa nueva para poder proponer congelación.');
        return;
      }
    }
    setActionBusy(`freeze-${dispute.id}`);
    setError(null);
    try {
      const params = governanceService.buildFreezeProposal({
        projectId: project.id,
        governanceAddress: project.governance_address,
        disputeChainId: dispute.dispute_chain_id,
        description: `Congelar bóveda por disputa #${dispute.dispute_chain_id}: ${dispute.reason.slice(0, 80)}`,
      });
      await governanceService.createProposal(account, params);
      await Promise.all([loadDisputes(true), loadProposals()]);
    } catch (err) {
      setError(decodeContractRevert(err) ?? (err as Error).message ?? 'Error al proponer congelación');
    } finally {
      setActionBusy(null);
    }
  };

  const handleProposeClose = async (dispute: Dispute) => {
    if (!account || !project.governance_address) return;
    if (hasOpenProposal(GovernanceAction.CloseVault, dispute.dispute_chain_id)) {
      setError('Ya existe una propuesta activa para cerrar la bóveda. Ve a Gobernanza para votarla.');
      return;
    }
    if (!window.confirm('Esta propuesta intentará cerrar la bóveda del proyecto y devolver lo que quede a los inversores proporcionalmente. ¿Continuar?')) return;
    setActionBusy(`close-${dispute.id}`);
    setError(null);
    try {
      const params = governanceService.buildCloseVaultProposal({
        projectId: project.id,
        governanceAddress: project.governance_address,
        description: `Cerrar bóveda por disputa #${dispute.dispute_chain_id}: ${dispute.reason.slice(0, 80)}`,
      });
      await governanceService.createProposal(account, params);
      await Promise.all([loadDisputes(true), loadProposals()]);
    } catch (err) {
      setError(decodeContractRevert(err) ?? (err as Error).message ?? 'Error al proponer cierre');
    } finally {
      setActionBusy(null);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const formatAddress = (address: string) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '—';

  const statusBadge = (s: Dispute['status']) => {
    if (s === 'OPEN') return { cls: 'disputa-pill disputa-pill--warn', label: 'Abierta', icon: warningOutline };
    if (s === 'FROZEN') return { cls: 'disputa-pill disputa-pill--frozen', label: 'Bóveda congelada', icon: snowOutline };
    return { cls: 'disputa-pill disputa-pill--done', label: 'Resuelta', icon: checkmarkCircleOutline };
  };

  const shortChainId = (id: string) => {
    if (!id) return '—';
    if (id.length <= 10) return id;
    return `${id.slice(0, 6)}…${id.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="historial-tab">
        <h2 className="disputas-title">Disputas</h2>
        <p className="chain-state-loading">Cargando disputas...</p>
      </div>
    );
  }

  return (
    <div className="historial-tab">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 className="disputas-title" style={{ margin: 0 }}>Disputas</h2>
        {account && project.disputes_address && (() => {
          const myAddress = account.address.toLowerCase();
          const hasMyOpen = disputes.some(
            (d) => d.status !== 'RESOLVED' && d.opener_address?.toLowerCase() === myAddress,
          );
          return (
            <button
              className="invest-btn"
              style={{ width: 'auto', padding: '8px 14px', fontSize: 13, opacity: hasMyOpen && !showCreate ? 0.5 : 1 }}
              onClick={() => { setShowCreate((s) => !s); setError(null); }}
              disabled={hasMyOpen && !showCreate}
              title={hasMyOpen ? 'Ya tienes una disputa abierta en este proyecto' : ''}
            >
              <IonIcon icon={addOutline} /> {showCreate ? 'Cancelar' : 'Abrir disputa'}
            </button>
          );
        })()}
      </div>

      {error && <p className="invest-error" style={{ marginBottom: 12 }}>{error}</p>}

      {showCreate && (
        <div className="disputa-item" style={{ marginBottom: 16 }}>
          <h4 style={{ margin: '0 0 8px' }}>Nueva disputa</h4>
          <p style={{ fontSize: 12, color: '#666', margin: '0 0 12px' }}>
            Solo los stakeholders del proyecto pueden abrir una disputa. Una vez abierta podrás congelar la bóveda o proponer su cierre desde la tarjeta de la disputa.
          </p>
          <textarea
            placeholder="Describe brevemente qué pasó y por qué abres la disputa"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: 8, marginBottom: 10, borderRadius: 8, border: '1px solid #ddd' }}
          />
          <button
            className="invest-btn"
            onClick={handleOpenDispute}
            disabled={busy || !reason.trim()}
          >
            {busy ? 'Abriendo...' : 'Abrir disputa'}
          </button>
        </div>
      )}

      {disputes.length === 0 && optimisticDisputes.length === 0 ? (
        <div className="historial-empty">
          <IonIcon icon={checkmarkCircleOutline} className="empty-icon" />
          <p className="empty-text">Sin disputas</p>
          <p className="empty-subtext">No hay disputas abiertas en este proyecto</p>
        </div>
      ) : (
        <div className="disputas-list">
          {optimisticDisputes.map((d) => (
            <article key={d.id} className="disputa-card disputa-card--open">
              <header className="disputa-card-header">
                <div className="disputa-card-id">
                  <IonIcon icon={warningOutline} />
                  <span>Disputa nueva</span>
                </div>
                <span className="disputa-pill disputa-pill--warn">
                  <IonSpinner name="crescent" style={{ width: 14, height: 14 }} />
                  &nbsp;Confirmando…
                </span>
              </header>
              <blockquote className="disputa-card-reason">{d.reason}</blockquote>
              <p className="disputa-help-note">
                La disputa ya quedó registrada en la blockchain. La card se actualizará en unos segundos.
              </p>
            </article>
          ))}
          {disputes.map(dispute => {
            const badge = statusBadge(dispute.status);
            const isOpen = dispute.status === 'OPEN';
            const isFrozen = dispute.status === 'FROZEN';
            const canAct = account && dispute.status !== 'RESOLVED';
            return (
              <article key={dispute.id} className={`disputa-card disputa-card--${dispute.status.toLowerCase()}`}>
                <header className="disputa-card-header">
                  <div className="disputa-card-id">
                    <IonIcon icon={warningOutline} />
                    <span>Disputa #{shortChainId(dispute.dispute_chain_id)}</span>
                  </div>
                  <span className={badge.cls}>
                    <IonIcon icon={badge.icon} />
                    {badge.label}
                  </span>
                </header>

                <div className="disputa-card-opener">
                  <span className="disputa-card-opener-label">Abierta por</span>
                  <code className="disputa-card-address">{formatAddress(dispute.opener_address)}</code>
                </div>

                <blockquote className="disputa-card-reason">
                  {dispute.reason}
                </blockquote>

                {dispute.resolution && (
                  <div className="disputa-card-resolution">
                    <span className="disputa-card-resolution-label">Resolución</span>
                    <p>{dispute.resolution}</p>
                  </div>
                )}

                <footer className="disputa-card-footer">
                  <div className="disputa-card-dates">
                    <span className="disputa-card-date">
                      <IonIcon icon={timeOutline} /> {formatDate(dispute.opened_at)}
                    </span>
                    {dispute.resolved_at && (
                      <span className="disputa-card-date">
                        <IonIcon icon={checkmarkCircleOutline} /> Resuelta {formatDate(dispute.resolved_at)}
                      </span>
                    )}
                  </div>
                </footer>

                {canAct && (
                  <div className="disputa-card-actions">
                    {project.governance_address && (isOpen || isFrozen) && (() => {
                      const freezePending = hasOpenProposal(GovernanceAction.FreezeFromDispute, dispute.dispute_chain_id);
                      const closePending = hasOpenProposal(GovernanceAction.CloseVault, dispute.dispute_chain_id);
                      return (
                        <section className="disputa-action-group">
                          <h5 className="disputa-action-group-title">Gobernanza</h5>
                          <div className="disputa-action-row">
                            {isOpen && (
                              <button
                                className="disputa-btn disputa-btn--info"
                                onClick={() => handleProposeFreeze(dispute)}
                                disabled={actionBusy === `freeze-${dispute.id}` || freezePending}
                                title={freezePending ? 'Ya existe una propuesta activa de congelación' : ''}
                              >
                                <IonIcon icon={snowOutline} />
                                {actionBusy === `freeze-${dispute.id}`
                                  ? 'Proponiendo…'
                                  : freezePending
                                  ? 'Propuesta de congelación activa'
                                  : 'Congelar bóveda'}
                              </button>
                            )}
                            <button
                              className="disputa-btn disputa-btn--danger"
                              onClick={() => handleProposeClose(dispute)}
                              disabled={actionBusy === `close-${dispute.id}` || closePending}
                              title={closePending ? 'Ya existe una propuesta activa de cierre' : ''}
                            >
                              <IonIcon icon={closeCircleOutline} />
                              {actionBusy === `close-${dispute.id}`
                                ? 'Proponiendo…'
                                : closePending
                                ? 'Propuesta de cierre activa'
                                : 'Cerrar proyecto'}
                            </button>
                          </div>
                          {(freezePending || closePending) && (
                            <p className="disputa-help-note">
                              {freezePending && closePending
                                ? 'Ya hay propuestas activas de congelar y cerrar. '
                                : freezePending
                                ? 'Ya hay una propuesta activa de congelación. '
                                : 'Ya hay una propuesta activa de cierre. '}
                              Anda al tab <strong>Gobernanza</strong> para votar.
                            </p>
                          )}
                        </section>
                      );
                    })()}

                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
