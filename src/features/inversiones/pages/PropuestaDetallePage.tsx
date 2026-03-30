import React, { useEffect, useState, useCallback } from 'react';
import { IonPage, IonContent, IonSpinner, useIonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Propuesta } from '@/types/propuesta';
import { propuestasService } from '@/services/propuestas/propuestas.service';
import { useProposalVotes } from '@/hooks/use-proposal-votes';
import { VotingResults } from '../components/propuestas/VotingResults';
import { WithdrawBlockedModal } from '../components/propuestas/WithdrawBlockedModal';
import './PropuestaDetallePage.css';
import { IonIcon } from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons'; 


const PropuestaDetallePage: React.FC = () => {
  const { propuestaId } = useParams<{ propuestaId: string }>();
  const history = useHistory();
  const { user } = useAuth();
  const [present] = useIonToast();

  const [propuesta, setPropuesta] = useState<Propuesta | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [showWithdrawBlockedModal, setShowWithdrawBlockedModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await propuestasService.getById(propuestaId);
        setPropuesta(data);
      } catch {
        await present({ message: 'Error al cargar la propuesta', duration: 3000, color: 'danger' });
        history.goBack();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [propuestaId]);

  // Real-time vote updates
  const handleVoteUpdate = useCallback((event: { proposalId: string; votes_yes: number; votes_no: number; total_members: number; status: string }) => {
    if (propuesta && event.proposalId === propuesta.id) {
      setPropuesta((prev) => prev ? {
        ...prev,
        votes_yes: event.votes_yes,
        votes_no: event.votes_no,
        total_members: event.total_members,
        status: event.status,
      } : prev);
    }
  }, [propuesta?.id]);

  useProposalVotes(handleVoteUpdate);

  const handleVote = async (answer: 'YES' | 'NO') => {
    if (!propuesta) return;
    setVoting(true);
    try {
      const updated = await propuestasService.vote(propuesta.id, answer);
      setPropuesta({ ...updated, user_vote: answer });
      await present({ message: 'Voto registrado exitosamente', duration: 2000, color: 'success' });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al registrar el voto';
      await present({ message: msg, duration: 3000, color: 'danger' });
    } finally {
      setVoting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!propuesta) return;
    setWithdrawing(true);
    try {
      await propuestasService.withdraw(propuesta.id);
      await present({ message: 'Retiro iniciado exitosamente', duration: 2500, color: 'success' });
      const data = await propuestasService.getById(propuesta.id);
      setPropuesta(data);
    } catch {
      await present({ message: 'Error al retirar el dinero', duration: 3000, color: 'danger' });
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <div className="propuesta-detalle-loading">
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!propuesta) return null;

  const formatMonto = (amount: number | null | undefined) =>
    (amount ?? 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

  const isEncargado = user?.id === propuesta.responsible_user.id;
  const isPending = propuesta.status === 'PENDING';
  const isApproved = propuesta.status === 'APPROVED';
  const isRejected = propuesta.status === 'REJECTED';
  const hasVoted = propuesta.user_vote != null;
  const canVote = propuesta.can_vote ?? true;

  const getStatusIndicator = () => {
    if (isPending) {
      return (
        <div className="propuesta-status pending">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Votación en proceso</span>
        </div>
      );
    }
    if (isRejected) {
      return (
        <div className="propuesta-status rejected">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>
            {isEncargado
              ? 'No puedes retirar el dinero'
              : `${propuesta.responsible_user.display_name} no puede retirar el dinero`}
          </span>
        </div>
      );
    }
    if (isApproved) {
      return (
        <div className="propuesta-status approved">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>
            {isEncargado
              ? 'Ya puedes retirar el dinero'
              : `${propuesta.responsible_user.display_name} ya puede retirar el dinero`}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <IonPage>
      <IonContent fullscreen className="propuesta-detalle-page">
        <div className="propuesta-detalle-header">
          <button className="header-back-btn " onClick={() => history.goBack()}>
              <IonIcon icon={arrowBackOutline} />
          </button>
          <h1 className="propuesta-detalle-titulo">Propuesta</h1>
        </div>

        <div className="propuesta-detalle-content">
          {propuesta.background_image_url && (
            <img
              src={propuesta.background_image_url}
              alt={propuesta.title}
              className="propuesta-detalle-imagen"
            />
          )}

          <h2 className="propuesta-detalle-name">{propuesta.title}</h2>
          <p className="propuesta-detalle-desc">{propuesta.description}</p>

          <div className="propuesta-detalle-data">
            <div className="propuesta-data-item">
              <span className="propuesta-data-label">Encargado para el retiro de dinero:</span>
              <span className="propuesta-data-value">{propuesta.responsible_user.display_name}</span>
            </div>
            <div className="propuesta-data-item">
              <span className="propuesta-data-label">Monto a retirar:</span>
              <span className="propuesta-data-value">{formatMonto(propuesta.withdrawal_amount)}</span>
            </div>
            {propuesta.estimated_profit != null && (
              <div className="propuesta-data-item">
                <span className="propuesta-data-label">Ganancia de dinero estimado:</span>
                <span className="propuesta-data-value">{formatMonto(propuesta.estimated_profit)}</span>
              </div>
            )}
          </div>

          <VotingResults propuesta={propuesta} onVote={handleVote} voting={voting} />

          {getStatusIndicator()}

          {isPending && !canVote && (
            <div className="propuesta-no-vote-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Te uniste después de que se creó esta propuesta</span>
            </div>
          )}

          {isPending && canVote && !hasVoted && (
            <div className="propuesta-detalle-voting">
              <button
                className="propuesta-vote-btn yes"
                onClick={() => handleVote('YES')}
                disabled={voting}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {voting ? 'Votando...' : 'Sí, estoy de acuerdo'}
              </button>
              <button
                className="propuesta-vote-btn no"
                onClick={() => handleVote('NO')}
                disabled={voting}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                {voting ? 'Votando...' : 'No, no estoy de acuerdo'}
              </button>
            </div>
          )}
        </div>

        {isEncargado && (
          <div className="propuesta-detalle-footer">
            <button
              className={`propuesta-detalle-withdraw-btn ${isApproved ? 'active' : 'disabled'}`}
              onClick={isApproved ? handleWithdraw : () => setShowWithdrawBlockedModal(true)}
              disabled={withdrawing}
            >
              {withdrawing ? 'Retirando...' : 'Retirar dinero'}
            </button>
          </div>
        )}

        <WithdrawBlockedModal
          isOpen={showWithdrawBlockedModal}
          onClose={() => setShowWithdrawBlockedModal(false)}
          status={isPending ? 'PENDING' : 'REJECTED'}
        />
      </IonContent>
    </IonPage>
  );
};

export default PropuestaDetallePage;
