import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  checkmarkCircleOutline,
  lockClosedOutline,
  globeOutline,
  calendarOutline,
  walletOutline,
  trophyOutline,
} from 'ionicons/icons';
import { Project } from '@/models/projects';
import { useBlockchain } from '@/hooks/use-blockchain';
import { blockchainService } from '@/services/blockchain.service';
import './ProjectDetailTabs.css';

interface ResumenTabProps {
  project: Project;
  isOwner: boolean;
  showJoinButton?: boolean;
  onJoinAction?: () => void;
  joinStatus?: 'pending' | 'approved' | null;
  isMember?: boolean;
}

export const ResumenTab: React.FC<ResumenTabProps> = ({
  project,
  isOwner,
  showJoinButton,
  onJoinAction,
  joinStatus,
  isMember = false,
}) => {
  const history = useHistory();
  const { account, claimFinalNatillera } = useBlockchain();
  const [hasPaidCurrentCycle, setHasPaidCurrentCycle] = useState<boolean | null>(null);
  const [v2Matured, setV2Matured] = useState(false);
  const [v2Claimed, setV2Claimed] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!account?.address || !isMember || project.type !== 'NATILLERA') return;

    if (project.natillera_address) {
      const checkV2 = async () => {
        try {
          const state = await blockchainService.getNatilleraV2State(project.natillera_address!);
          setV2Matured(state.isMatured);
          if (state.isMatured) {
            const claimed = await blockchainService.hasNatilleraV2Claimed(project.natillera_address!, account.address);
            setV2Claimed(claimed);
          }
          const paid = await blockchainService.hasNatilleraV2PaidMonth(
            project.natillera_address!,
            account.address,
            state.currentMonth,
          );
          setHasPaidCurrentCycle(paid);
        } catch {
          // silenciar
        }
      };
      checkV2();
    } else if (project.contract_address) {
      const checkV1 = async () => {
        try {
          const [state, config] = await Promise.all([
            blockchainService.getNatilleraState(project.contract_address!),
            blockchainService.getNatilleraConfig(project.contract_address!),
          ]);
          const deposits = await blockchainService.getDeposits(project.contract_address!, account.address);
          const required = config.monthlyContribution * (BigInt(state.currentCycle) + 1n);
          setHasPaidCurrentCycle(deposits >= required);
        } catch {
          setHasPaidCurrentCycle(null);
        }
      };
      checkV1();
    }
  }, [account?.address, project.contract_address, project.natillera_address, isMember]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleGoToPayment = () => {
    history.push(`/pago/${project.id}`);
  };

  const handleClaimFinal = async () => {
    if (!project.natillera_address) return;
    setClaiming(true);
    try {
      await claimFinalNatillera(project.natillera_address);
      setV2Claimed(true);
    } catch {
      // silenciar
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="resumen-tab">
      <div className="resumen-section">
        <div className="resumen-header">
          <h1 className="resumen-title">{project.name}</h1>
          {project.owner_user && (
            <div className="resumen-owner">
              <span className="owner-label">{project.owner_user.username}</span>
              {isOwner && (
                <IonIcon
                  icon={checkmarkCircleOutline}
                  className="verified-badge"
                />
              )}
            </div>
          )}
        </div>

        <div className="resumen-badges">
          <div className="info-badge">
            <IonIcon
              icon={
                project.visibility === 'PUBLIC'
                  ? globeOutline
                  : lockClosedOutline
              }
              className="badge-icon"
            />
            <span>
              {project.visibility === 'PUBLIC' ? 'Público' : 'Privado'}
            </span>
          </div>
          <div className="info-badge">
            <IonIcon icon={calendarOutline} className="badge-icon" />
            <span>Creado el {formatDate(project.created_at)}</span>
          </div>
        </div>

        {project.description_rich && (
          <div className="resumen-content-block">
            <h3 className="content-block-title">Descripción de proyecto</h3>
            <div
              className="content-block-text"
              dangerouslySetInnerHTML={{ __html: project.description_rich }}
            />
          </div>
        )}

        {project.highlights_rich && (
          <div className="resumen-content-block">
            <h3 className="content-block-title">Aspectos destacados</h3>
            <div
              className="content-block-text"
              dangerouslySetInnerHTML={{ __html: project.highlights_rich }}
            />
          </div>
        )}
      </div>

      {showJoinButton && (
        <div className="resumen-actions">
          <button
            className="action-button secondary"
            onClick={() => window.history.back()}
          >
            Tal vez en otro momento.
          </button>
          <button
            className="action-button primary"
            onClick={onJoinAction}
            disabled={joinStatus === 'pending' || joinStatus === 'approved'}
          >
            {joinStatus === 'pending'
              ? 'Solicitud Enviada'
              : joinStatus === 'approved'
                ? 'Ya eres miembro'
                : `Unirme a la ${project.type === 'NATILLERA' ? 'Natillera' : 'Tokenización'}`}
          </button>
        </div>
      )}

      {isMember && !isOwner && !showJoinButton && project.type === 'NATILLERA' && v2Matured && !v2Claimed && (
        <div className="resumen-actions">
          <button
            className="action-button primary"
            onClick={handleClaimFinal}
            disabled={claiming}
          >
            <IonIcon icon={trophyOutline} className="button-icon" />
            {claiming ? 'Reclamando...' : 'Reclamar pozo final'}
          </button>
        </div>
      )}

      {isMember && !isOwner && !showJoinButton && project.type === 'NATILLERA' && !v2Matured && (() => {
        if (hasPaidCurrentCycle === true) return null;
        const deadline = project.natillera_details?.payment_deadline_at;
        const isPaymentDue = hasPaidCurrentCycle === false
          ? true
          : (deadline ? new Date() >= new Date(deadline) : false);
        if (!isPaymentDue) return null;
        return (
          <div className="resumen-actions">
            <button
              className="action-button payment-button-highlighted"
              onClick={handleGoToPayment}
            >
              <IonIcon icon={walletOutline} className="button-icon" />
              Realizar Pago
            </button>
          </div>
        );
      })()}
    </div>
  );
};
