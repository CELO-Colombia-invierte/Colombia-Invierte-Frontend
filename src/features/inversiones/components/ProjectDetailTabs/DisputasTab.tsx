import React, { useEffect, useRef, useState } from 'react';
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

// Colapsa filas duplicadas de una misma disputa. El bug: el write-through del
// frontend crea una fila con dispute_chain_id '0' y el indexer crea otra con el
// id real. Aquí descartamos la fila huérfana '0' si ya existe la real.
const rankDispute = (d: Dispute) =>
  d.status === 'RESOLVED' || d.status === 'FROZEN' ? 1 : 0;

// Una disputa solo tiene id on-chain real cuando el indexer la reconcilió. Antes
// de eso el write-through la guarda con '0', y proponer contra ese '0' genera
// propuestas con target_id incorrecto (apuntan a la disputa equivocada).
const isRealChainId = (cid: string) => !!cid && cid !== '0';

const dedupeDisputes = (list: Dispute[]): Dispute[] => {
  const isReal = isRealChainId;
  const reasonKey = (d: Dispute) =>
    `${d.reason.trim()}|${(d.opener_address || '').toLowerCase()}`;

  const byChain = new Map<string, Dispute>();
  const orphans: Dispute[] = [];
  for (const d of list) {
    if (isReal(d.dispute_chain_id)) {
      const cur = byChain.get(d.dispute_chain_id);
      if (!cur || rankDispute(d) > rankDispute(cur)) byChain.set(d.dispute_chain_id, d);
    } else {
      orphans.push(d);
    }
  }
  const realKeys = new Set(Array.from(byChain.values()).map(reasonKey));
  const keptOrphans = orphans.filter((d) => !realKeys.has(reasonKey(d)));

  return [...byChain.values(), ...keptOrphans].sort(
    (a, b) => new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime(),
  );
};

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
  // Lock síncrono de reentrancia: los updates de estado de React son async, así
  // que setActionBusy/busy no bloquean un doble clic en el mismo frame. Este ref
  // sí, evitando disparar dos transacciones propose()/dispute() on-chain.
  const actionLock = useRef(false);

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
      const real = dedupeDisputes(response.data ?? []);
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
      setError('Entra a tu cuenta, escribe el motivo y verifica que el proyecto esté activo.');
      return;
    }
    if (actionLock.current) return;
    actionLock.current = true;
    const myAddress = account.address.toLowerCase();
    try {
      try {
        const response = await apiService.get<Dispute[]>(`/projects/${project.id}/disputes`);
        const fresh = dedupeDisputes(response.data ?? []);
        const mineOpen = fresh.filter(
          (d) => d.status !== 'RESOLVED' && d.opener_address?.toLowerCase() === myAddress,
        );
        setDisputes(fresh);
        if (mineOpen.length > 0) {
          const ids = mineOpen.map((d) => `#${d.dispute_chain_id}`).join(', ');
          setError(`Ya tienes un reclamo abierto (${ids}). Espera a que el grupo decida antes de abrir otro.`);
          return;
        }
      } catch {
        setError('No se pudo verificar tus reclamos. Intenta de nuevo.');
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
    } finally {
      actionLock.current = false;
    }
  };

  const handleProposeFreeze = async (dispute: Dispute) => {
    if (!account || !project.governance_address) return;
    if (!isRealChainId(dispute.dispute_chain_id)) {
      setError('Tu reclamo se está procesando. Espera unos segundos e intenta de nuevo.');
      return;
    }
    if (hasOpenProposal(GovernanceAction.FreezeFromDispute, dispute.dispute_chain_id)) {
      setError('Ya hay una votación activa para pausar el fondo por este reclamo. Ve a Decisiones para votar.');
      return;
    }
    if (actionLock.current) return;
    actionLock.current = true;
    // Marcamos ocupado antes de cualquier await para que el botón se deshabilite ya.
    setActionBusy(`freeze-${dispute.id}`);
    setError(null);
    try {
      if (project.disputes_address) {
        const exists = await blockchainService.checkDisputeExists(
          project.disputes_address,
          dispute.dispute_chain_id,
        );
        if (!exists) {
          setError('Este reclamo ya no está activo o fue resuelto. Abre un reclamo nuevo para poder pausar el fondo.');
          return;
        }
      }
      const params = governanceService.buildFreezeProposal({
        projectId: project.id,
        governanceAddress: project.governance_address,
        disputeChainId: dispute.dispute_chain_id,
        description: `Pausar el fondo por reclamo #${dispute.dispute_chain_id}: ${dispute.reason.slice(0, 80)}`,
      });
      await governanceService.createProposal(account, params);
      await Promise.all([loadDisputes(true), loadProposals()]);
    } catch (err) {
      setError(decodeContractRevert(err) ?? (err as Error).message ?? 'No se pudo crear la votación para pausar el fondo');
    } finally {
      setActionBusy(null);
      actionLock.current = false;
    }
  };

  const handleProposeClose = async (dispute: Dispute) => {
    if (!account || !project.governance_address) return;
    if (!isRealChainId(dispute.dispute_chain_id)) {
      setError('Tu reclamo se está procesando. Espera unos segundos e intenta de nuevo.');
      return;
    }
    if (hasOpenProposal(GovernanceAction.CloseVault, dispute.dispute_chain_id)) {
      setError('Ya hay una votación activa para cerrar el proyecto. Ve a Decisiones para votar.');
      return;
    }
    if (!window.confirm('Esto creará una votación para cerrar el proyecto y devolver el dinero que quede a los inversores. ¿Continuar?')) return;
    if (actionLock.current) return;
    actionLock.current = true;
    setActionBusy(`close-${dispute.id}`);
    setError(null);
    try {
      const params = governanceService.buildCloseVaultProposal({
        projectId: project.id,
        governanceAddress: project.governance_address,
        description: `Cerrar el proyecto por reclamo #${dispute.dispute_chain_id}: ${dispute.reason.slice(0, 80)}`,
      });
      await governanceService.createProposal(account, params);
      await Promise.all([loadDisputes(true), loadProposals()]);
    } catch (err) {
      setError(decodeContractRevert(err) ?? (err as Error).message ?? 'No se pudo crear la votación para cerrar el proyecto');
    } finally {
      setActionBusy(null);
      actionLock.current = false;
    }
  };

  const handleResolve = async (dispute: Dispute) => {
    if (!account || !project.disputes_address) return;
    if (!isRealChainId(dispute.dispute_chain_id)) {
      setError('Tu reclamo se está procesando. Espera unos segundos e intenta de nuevo.');
      return;
    }
    if (!window.confirm('Se marcará este reclamo como resuelto. Podrás abrir uno nuevo después. ¿Continuar?')) return;
    if (actionLock.current) return;
    actionLock.current = true;
    setActionBusy(`resolve-${dispute.id}`);
    setError(null);
    try {
      await governanceService.resolveDispute(account, {
        projectId: project.id,
        disputesAddress: project.disputes_address,
        disputeChainId: dispute.dispute_chain_id,
        accepted: true,
      });
      await Promise.all([loadDisputes(true), loadProposals()]);
    } catch (err) {
      setError(decodeContractRevert(err) ?? (err as Error).message ?? 'No se pudo resolver el reclamo');
    } finally {
      setActionBusy(null);
      actionLock.current = false;
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const formatAddress = (address: string) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '—';

  const statusBadge = (s: Dispute['status']) => {
    if (s === 'OPEN') return { cls: 'disputa-pill disputa-pill--warn', label: 'Abierto', icon: warningOutline };
    if (s === 'FROZEN') return { cls: 'disputa-pill disputa-pill--frozen', label: 'Fondo en pausa', icon: snowOutline };
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
        <h2 className="disputas-title">Reclamos</h2>
        <p className="chain-state-loading">Cargando reclamos...</p>
      </div>
    );
  }

  return (
    <div className="historial-tab">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 className="disputas-title" style={{ margin: 0 }}>Reclamos</h2>
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
              title={hasMyOpen ? 'Ya tienes un reclamo abierto en este proyecto' : ''}
            >
              <IonIcon icon={addOutline} /> {showCreate ? 'Cancelar' : 'Abrir reclamo'}
            </button>
          );
        })()}
      </div>

      {error && <p className="invest-error" style={{ marginBottom: 12 }}>{error}</p>}

      {showCreate && (
        <div className="disputa-item" style={{ marginBottom: 16 }}>
          <h4 style={{ margin: '0 0 8px' }}>Nuevo reclamo</h4>
          <p style={{ fontSize: 12, color: '#666', margin: '0 0 12px' }}>
            Solo los participantes del proyecto pueden abrir un reclamo. Una vez abierto podrás pausar el fondo o pedir cerrar el proyecto desde la tarjeta del reclamo.
          </p>
          <textarea
            placeholder="Describe brevemente qué pasó y por qué abres el reclamo"
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
            {busy ? 'Abriendo...' : 'Abrir reclamo'}
          </button>
        </div>
      )}

      {disputes.length === 0 && optimisticDisputes.length === 0 ? (
        <div className="historial-empty">
          <IonIcon icon={checkmarkCircleOutline} className="empty-icon" />
          <p className="empty-text">Sin reclamos</p>
          <p className="empty-subtext">No hay reclamos abiertos en este proyecto</p>
        </div>
      ) : (
        <div className="disputas-list">
          {optimisticDisputes.map((d) => (
            <article key={d.id} className="disputa-card disputa-card--open">
              <header className="disputa-card-header">
                <div className="disputa-card-id">
                  <IonIcon icon={warningOutline} />
                  <span>Reclamo nuevo</span>
                </div>
                <span className="disputa-pill disputa-pill--warn">
                  <IonSpinner name="crescent" style={{ width: 14, height: 14 }} />
                  &nbsp;Procesando…
                </span>
              </header>
              <blockquote className="disputa-card-reason">{d.reason}</blockquote>
              <p className="disputa-help-note">
                Tu reclamo ya quedó registrado. Se actualizará en unos segundos.
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
                    <span>Reclamo #{shortChainId(dispute.dispute_chain_id)}</span>
                  </div>
                  <span className={badge.cls}>
                    <IonIcon icon={badge.icon} />
                    {badge.label}
                  </span>
                </header>

                <div className="disputa-card-opener">
                  <span className="disputa-card-opener-label">Abierto por</span>
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
                        <IonIcon icon={checkmarkCircleOutline} /> Resuelto {formatDate(dispute.resolved_at)}
                      </span>
                    )}
                  </div>
                </footer>

                {canAct && (
                  <div className="disputa-card-actions">
                    {project.governance_address && (isOpen || isFrozen) && (() => {
                      const reconciling = !isRealChainId(dispute.dispute_chain_id);
                      const freezePending = hasOpenProposal(GovernanceAction.FreezeFromDispute, dispute.dispute_chain_id);
                      const closePending = hasOpenProposal(GovernanceAction.CloseVault, dispute.dispute_chain_id);
                      return (
                        <section className="disputa-action-group">
                          <h5 className="disputa-action-group-title">Decisiones del grupo</h5>
                          <div className="disputa-action-row">
                            {isOpen && (
                              <button
                                className="disputa-btn disputa-btn--info"
                                onClick={() => handleProposeFreeze(dispute)}
                                disabled={actionBusy === `freeze-${dispute.id}` || freezePending || reconciling}
                                title={reconciling ? 'Tu reclamo se está procesando' : freezePending ? 'Ya hay una votación activa para pausar el fondo' : ''}
                              >
                                <IonIcon icon={snowOutline} />
                                {actionBusy === `freeze-${dispute.id}`
                                  ? 'Creando votación…'
                                  : freezePending
                                  ? 'Votación de pausa activa'
                                  : 'Pausar el fondo'}
                              </button>
                            )}
                            <button
                              className="disputa-btn disputa-btn--danger"
                              onClick={() => handleProposeClose(dispute)}
                              disabled={actionBusy === `close-${dispute.id}` || closePending || reconciling}
                              title={reconciling ? 'Tu reclamo se está procesando' : closePending ? 'Ya hay una votación activa para cerrar el proyecto' : ''}
                            >
                              <IonIcon icon={closeCircleOutline} />
                              {actionBusy === `close-${dispute.id}`
                                ? 'Creando votación…'
                                : closePending
                                ? 'Votación de cierre activa'
                                : 'Cerrar el proyecto'}
                            </button>
                          </div>
                          {reconciling ? (
                            <p className="disputa-help-note">
                              Tu reclamo se está procesando. Las acciones se habilitarán en unos segundos.
                            </p>
                          ) : (freezePending || closePending) && (
                            <p className="disputa-help-note">
                              {freezePending && closePending
                                ? 'Ya hay votaciones activas para pausar y cerrar. '
                                : freezePending
                                ? 'Ya hay una votación activa para pausar el fondo. '
                                : 'Ya hay una votación activa para cerrar el proyecto. '}
                              Ve a la pestaña <strong>Decisiones</strong> para votar.
                            </p>
                          )}
                        </section>
                      );
                    })()}

                    {project.disputes_address && (isOpen || isFrozen) && (
                      <section className="disputa-action-group">
                        <h5 className="disputa-action-group-title">Resolución</h5>
                        <div className="disputa-action-row">
                          <button
                            className="disputa-btn disputa-btn--success"
                            onClick={() => handleResolve(dispute)}
                            disabled={actionBusy === `resolve-${dispute.id}` || !isRealChainId(dispute.dispute_chain_id)}
                            title={!isRealChainId(dispute.dispute_chain_id) ? 'Tu reclamo se está procesando' : ''}
                          >
                            <IonIcon icon={checkmarkCircleOutline} />
                            {actionBusy === `resolve-${dispute.id}` ? 'Resolviendo…' : 'Marcar reclamo como resuelto'}
                          </button>
                        </div>
                        <p className="disputa-help-note">
                          Marca el reclamo como resuelto para cerrarlo y poder abrir otro.
                        </p>
                      </section>
                    )}
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
