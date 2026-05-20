import React from 'react';
import { IonIcon } from '@ionic/react';
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  timeOutline,
  thumbsUpOutline,
  thumbsDownOutline,
  playOutline,
  rocketOutline,
  flameOutline,
  snowOutline,
  sunnyOutline,
  cashOutline,
  banOutline,
  settingsOutline,
  lockClosedOutline,
} from 'ionicons/icons';
import { blockchainService } from '@/services/blockchain.service';
import { GovernanceAction, ACTION_LABELS } from '@/services/governance.service';
import { BLOCKCHAIN_CONFIG } from '@/contracts/config';
import type { Proposal, ProposalChainState } from './types';

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Activa',
  EXECUTED: 'Ejecutada',
  DEFEATED: 'Rechazada',
};
const STATUS_ICON: Record<string, string> = {
  ACTIVE: timeOutline,
  EXECUTED: checkmarkCircleOutline,
  DEFEATED: closeCircleOutline,
};

const ACTION_VISUALS: Record<number, { icon: string; cls: string; short: string }> = {
  [GovernanceAction.ActivateVault]: { icon: sunnyOutline, cls: 'gov-action--vault', short: 'Activar bóveda' },
  [GovernanceAction.CloseVault]: { icon: lockClosedOutline, cls: 'gov-action--danger', short: 'Cerrar bóveda' },
  [GovernanceAction.FreezeFromDispute]: { icon: snowOutline, cls: 'gov-action--dispute', short: 'Congelar (disputa)' },
  [GovernanceAction.UnfreezeVault]: { icon: flameOutline, cls: 'gov-action--vault', short: 'Descongelar' },
  [GovernanceAction.ApproveAndExecuteMilestone]: { icon: rocketOutline, cls: 'gov-action--milestone', short: 'Hito' },
  [GovernanceAction.CancelMilestone]: { icon: banOutline, cls: 'gov-action--milestone', short: 'Cancelar hito' },
  [GovernanceAction.Disbursement]: { icon: cashOutline, cls: 'gov-action--treasury', short: 'Retiro' },
  [GovernanceAction.UpdateVotingPeriod]: { icon: settingsOutline, cls: 'gov-action--config', short: 'Config votación' },
  [GovernanceAction.UpdateQuorum]: { icon: settingsOutline, cls: 'gov-action--config', short: 'Config quórum' },
};

const formatDate = (s: string) =>
  new Date(s).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

interface Props {
  proposal: Proposal;
  chainState: ProposalChainState | undefined;
  userVote: number;
  votingPower: bigint | null;
  tokenBalance: bigint | null;
  projectType: string;
  account: unknown;
  busy: string | null;
  onVote: (id: string, support: boolean) => void;
  onExecute: (id: string) => void;
}

export const ProposalCard: React.FC<Props> = ({
  proposal: p,
  chainState: cs,
  userVote,
  votingPower,
  tokenBalance,
  projectType,
  account,
  busy,
  onVote,
  onExecute,
}) => {
  const yesVotes = cs ? cs.yesVotes.toString() : p.votes_for;
  const noVotes = cs ? cs.noVotes.toString() : p.votes_against;
  const nowSec = BigInt(Math.floor(Date.now() / 1000));
  const isExecuted = cs ? cs.executed : p.status === 'EXECUTED';
  const votingClosed = cs ? nowSec > cs.endTime : false;
  const isActive = !isExecuted && !votingClosed;
  const canExecute = !isExecuted && votingClosed && BigInt(yesVotes) > BigInt(noVotes);
  const alreadyVoted = userVote === 1 || userVote === 2;
  const displayStatus = isExecuted
    ? 'EXECUTED'
    : isActive
      ? 'ACTIVE'
      : BigInt(yesVotes) > BigInt(noVotes)
        ? 'ACTIVE'
        : 'DEFEATED';
  const actionLabel =
    typeof p.action === 'number' && !isNaN(p.action)
      ? ACTION_LABELS[p.action as GovernanceAction] ?? `Acción ${p.action}`
      : null;
  const actionVisual =
    typeof p.action === 'number' && !isNaN(p.action) ? ACTION_VISUALS[p.action] : undefined;
  const isDisbursement = p.action === GovernanceAction.Disbursement;
  const showActions = !!account && (isActive || canExecute || alreadyVoted);

  return (
    <div className="gov-card">
      <div className="gov-card__head">
        <span className="gov-card__id">Propuesta #{p.proposal_chain_id}</span>
        <span className={`gov-card__status gov-status--${displayStatus.toLowerCase()}`}>
          <IonIcon icon={STATUS_ICON[displayStatus] ?? timeOutline} />
          {STATUS_LABEL[displayStatus] ?? displayStatus}
        </span>
      </div>

      {(actionLabel || (isDisbursement && p.amount && p.amount !== '0')) && (
        <div className="gov-card__meta">
          {actionLabel && (
            <span className={`gov-action-badge ${actionVisual?.cls ?? ''}`}>
              {actionVisual && <IonIcon icon={actionVisual.icon} />}
              {actionVisual?.short ?? actionLabel}
            </span>
          )}
          {isDisbursement && p.amount && p.amount !== '0' && (
            <span className="gov-card__meta-chip">
              Monto:{' '}
              <strong>
                {blockchainService.formatUnitsExact(BigInt(p.amount), BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS)} USDC
              </strong>
            </span>
          )}
          {isDisbursement && p.recipient && p.recipient !== '0x0000000000000000000000000000000000000000' && (
            <span className="gov-card__meta-chip">
              Para:{' '}
              <strong>
                {p.recipient.slice(0, 6)}…{p.recipient.slice(-4)}
              </strong>
            </span>
          )}
        </div>
      )}

      {p.description && <p className="gov-card__desc">{p.description}</p>}

      <div className="gov-card__votes">
        <span className="gov-vote gov-vote--yes">
          <IonIcon icon={thumbsUpOutline} />
          {Number(yesVotes).toLocaleString('es-CO')} {projectType === 'TOKENIZATION' ? 'tokens a favor' : 'a favor'}
        </span>
        <span className="gov-vote gov-vote--no">
          <IonIcon icon={thumbsDownOutline} />
          {Number(noVotes).toLocaleString('es-CO')} {projectType === 'TOKENIZATION' ? 'tokens en contra' : 'en contra'}
        </span>
      </div>

      <span className="gov-card__date">Creada el {formatDate(p.created_at)}</span>

      {showActions && (
        <div className="gov-card__actions">
          {isActive && alreadyVoted && (
            <span className="gov-warn" style={{ background: '#dcfce7', color: '#166534' }}>
              Ya votaste {userVote === 1 ? 'Sí' : 'No'} en esta propuesta
            </span>
          )}
          {isActive && !alreadyVoted && votingPower !== null && votingPower === 0n && (
            <span className="gov-warn">
              {projectType === 'TOKENIZATION'
                ? tokenBalance && tokenBalance > 0n
                  ? 'Delega tus tokens para votar'
                  : 'No posees tokens del proyecto'
                : 'No eres miembro de la natillera'}
            </span>
          )}
          {isActive && !alreadyVoted && (
            <>
              <button
                className="gov-btn gov-btn--yes"
                disabled={busy === `vote-${p.proposal_chain_id}-true` || votingPower === 0n}
                onClick={() => onVote(p.proposal_chain_id, true)}
              >
                <IonIcon icon={thumbsUpOutline} /> Votar Sí
              </button>
              <button
                className="gov-btn gov-btn--no"
                disabled={busy === `vote-${p.proposal_chain_id}-false` || votingPower === 0n}
                onClick={() => onVote(p.proposal_chain_id, false)}
              >
                <IonIcon icon={thumbsDownOutline} /> Votar No
              </button>
            </>
          )}
          {canExecute && (
            <button
              className="gov-btn gov-btn--exec"
              disabled={busy === `execute-${p.proposal_chain_id}`}
              onClick={() => onExecute(p.proposal_chain_id)}
            >
              <IonIcon icon={playOutline} /> Ejecutar
            </button>
          )}
        </div>
      )}
    </div>
  );
};
