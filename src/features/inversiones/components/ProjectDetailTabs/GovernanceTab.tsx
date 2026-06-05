import React, { useState } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { timeOutline, addOutline, lockClosedOutline } from 'ionicons/icons';
import { Project } from '@/models/projects';
import { useBlockchain } from '@/hooks/use-blockchain';
import { blockchainService, decodeContractRevert } from '@/services/blockchain.service';
import { governanceService, GovernanceAction } from '@/services/governance.service';
import { BLOCKCHAIN_CONFIG } from '@/contracts/config';
import { copToUsdcRaw } from '@/utils/money';
import { useGovernanceData } from './GovernanceTab/useGovernanceData';
import { ProposalForm } from './GovernanceTab/ProposalForm';
import { ProposalCard } from './GovernanceTab/ProposalCard';
import type { ProposalFormState } from './GovernanceTab/types';
import { VaultFrozenBanner } from './VaultFrozenBanner';
import './ProjectDetailTabs.css';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

interface GovernanceTabProps {
  project: Project;
}

export const GovernanceTab: React.FC<GovernanceTabProps> = ({ project }) => {
  const { account } = useBlockchain();
  const {
    proposals,
    optimisticProposals,
    addOptimisticProposal,
    loading,
    projectCreator,
    votingPower,
    tokenBalance,
    chainState,
    userVotes,
    vaultFrozen,
    vaultClosed,
    loadProposals,
    loadVotingState,
  } = useGovernanceData(project, account);

  const [showCreate, setShowCreate] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProposalFormState>({
    action: GovernanceAction.Disbursement,
    amount: '',
    recipient: '',
    description: '',
    targetId: '',
  });

  const handleAction = async (op: () => Promise<unknown>, busyKey: string) => {
    setBusy(busyKey);
    setError(null);
    try {
      await op();
      await loadProposals(true);
    } catch (err) {
      setError(decodeContractRevert(err) ?? 'No se pudo completar la acción. Intenta de nuevo.');
    } finally {
      setBusy(null);
    }
  };

  const handleDelegate = async () => {
    if (!account) return;
    let tokenAddr = project.token_address;
    if (!tokenAddr && project.revenue_address) {
      try {
        tokenAddr = await blockchainService.getProjectTokenAddress(project.revenue_address);
      } catch {
        setError('No se pudo obtener el token del proyecto.');
        return;
      }
    }
    if (!tokenAddr) {
      setError('Este proyecto no tiene un ProjectToken asociado.');
      return;
    }
    await handleAction(async () => {
      await blockchainService.delegateToSelf(account, tokenAddr!);
      await loadVotingState();
    }, 'delegate');
  };

  const resetForm = () =>
    setForm({ action: GovernanceAction.Disbursement, amount: '', recipient: '', description: '', targetId: '' });

  const handleCreate = async () => {
    if (!account || !project.governance_address) return;

    let amount: bigint = 0n;
    let targetId = 0n;
    let recipient = form.recipient;

    if (form.action === GovernanceAction.Disbursement) {
      if (vaultFrozen) {
        setError('El fondo del proyecto está en pausa por un reclamo. No se pueden proponer retiros hasta que el grupo lo reactive.');
        return;
      }
      if (!projectCreator) {
        setError('No se pudo leer el responsable del proyecto. Intenta recargar.');
        return;
      }
      recipient = projectCreator;
      if (!form.amount) {
        setError('El monto es requerido para un retiro.');
        return;
      }
      try {
        amount = copToUsdcRaw(Number(form.amount));
      } catch {
        setError('Monto inválido');
        return;
      }
    } else if (
      form.action === GovernanceAction.FreezeFromDispute ||
      form.action === GovernanceAction.ApproveAndExecuteMilestone ||
      form.action === GovernanceAction.CancelMilestone
    ) {
      if (!form.targetId) {
        setError('Falta seleccionar el elemento para esta acción.');
        return;
      }
      targetId = BigInt(form.targetId);
    } else if (
      form.action === GovernanceAction.UpdateQuorum ||
      form.action === GovernanceAction.UpdateVotingPeriod
    ) {
      if (!form.amount) {
        setError('El nuevo valor es requerido.');
        return;
      }
      amount =
        form.action === GovernanceAction.UpdateVotingPeriod
          ? BigInt(Math.round(Number(form.amount) * 86400))
          : BigInt(form.amount);
    }

    const desc = form.description;
    await handleAction(async () => {
      await governanceService.createProposal(account, {
        projectId: project.id,
        governanceAddress: project.governance_address!,
        action: form.action,
        targetId,
        amount,
        recipient: recipient || ZERO_ADDRESS,
        token: form.action === GovernanceAction.Disbursement ? BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS : ZERO_ADDRESS,
        description: form.description,
      });
      // Card optimista: la propuesta ya está en cadena; el polling la
      // reemplaza por la real cuando el indexer la registre.
      addOptimisticProposal(desc);
      setShowCreate(false);
      resetForm();
    }, 'create');
  };

  const handleVote = (chainId: string, support: boolean) => {
    if (!account || !project.governance_address) return;
    return handleAction(
      () => governanceService.vote(account, project.governance_address!, chainId, support),
      `vote-${chainId}-${support}`,
    );
  };

  const handleExecute = (chainId: string) => {
    if (!account || !project.governance_address) return;
    return handleAction(
      () => governanceService.execute(account, project.governance_address!, chainId),
      `execute-${chainId}`,
    );
  };

  if (loading) {
    return (
      <div className="historial-tab">
        <h2 className="governance-title">Decisiones del grupo</h2>
        <p className="chain-state-loading">Cargando decisiones...</p>
      </div>
    );
  }

  return (
    <div className="historial-tab">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 className="governance-title" style={{ margin: 0 }}>
          Decisiones del grupo
        </h2>
        {account && project.governance_address && (
          <button
            className="invest-btn"
            style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}
            onClick={() => {
              setShowCreate((s) => !s);
              setError(null);
            }}
          >
            <IonIcon icon={addOutline} /> {showCreate ? 'Cancelar' : 'Nueva votación'}
          </button>
        )}
      </div>

      {error && <p className="invest-error" style={{ marginBottom: 12 }}>{error}</p>}

      {vaultClosed && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '10px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, color: '#991b1b', fontSize: 13 }}>
          <IonIcon icon={lockClosedOutline} style={{ fontSize: 18, flexShrink: 0 }} />
          <span>Este proyecto fue cerrado. El dinero restante se devolvió a los inversores. Ya no se pueden crear nuevas votaciones de retiro.</span>
        </div>
      )}
      {!vaultClosed && vaultFrozen && (
        <div style={{ marginBottom: 12 }}>
          <VaultFrozenBanner message="El fondo del proyecto está en pausa por un reclamo. Los retiros están bloqueados; aún puedes crear y votar acciones como reactivar el fondo." />
        </div>
      )}

      {account && project.type === 'TOKENIZATION' && tokenBalance !== null && tokenBalance > 0n && votingPower === 0n && (
        <div style={{ marginBottom: 12, padding: 12, background: '#fff8e6', border: '1px solid #f5c451', borderRadius: 8 }}>
          <p style={{ margin: '0 0 8px', fontSize: 13, color: '#7a5300' }}>
            Tienes participación en este proyecto, pero aún no has activado tu voto. Actívalo una vez para poder
            participar en las decisiones del grupo.
          </p>
          <button
            className="invest-btn"
            style={{ width: 'auto', padding: '6px 14px', fontSize: 13 }}
            onClick={handleDelegate}
            disabled={busy === 'delegate'}
          >
            {busy === 'delegate' ? 'Activando...' : 'Activar mi voto'}
          </button>
        </div>
      )}

      {showCreate && (
        <ProposalForm
          form={form}
          setForm={setForm}
          projectCreator={projectCreator}
          busy={busy}
          onSubmit={handleCreate}
        />
      )}

      {proposals.length === 0 && optimisticProposals.length === 0 ? (
        <div className="historial-empty">
          <IonIcon icon={timeOutline} className="empty-icon" />
          <p className="empty-text">Sin decisiones aún</p>
          <p className="empty-subtext">Las decisiones del grupo aparecerán aquí</p>
        </div>
      ) : (
        <div className="gov-list">
          {proposals.map((p) => (
            <ProposalCard
              key={p.id}
              proposal={p}
              chainState={chainState[p.proposal_chain_id]}
              userVote={userVotes[p.proposal_chain_id] ?? 0}
              votingPower={votingPower}
              tokenBalance={tokenBalance}
              projectType={project.type}
              account={account}
              busy={busy}
              onVote={handleVote}
              onExecute={handleExecute}
            />
          ))}
          {optimisticProposals.map((p) => (
            <div key={p.id} className="gov-card gov-card-optimistic">
              <div className="gov-card__head">
                <span className="gov-card__id">Propuesta nueva</span>
                <span className="gov-card__status gov-status--active">
                  <IonSpinner name="crescent" style={{ width: 14, height: 14 }} />
                  &nbsp;Confirmando…
                </span>
              </div>
              {p.description && <p className="gov-card__desc">{p.description}</p>}
              <span className="gov-card__date">
                Tu votación ya quedó registrada. Se actualizará en unos segundos.
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
