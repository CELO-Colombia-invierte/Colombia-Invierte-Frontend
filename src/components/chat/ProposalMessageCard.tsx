import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { PropuestaPreview } from '@/types/propuesta';
import { propuestasService } from '@/services/propuestas/propuestas.service';
import './ProposalMessageCard.css';

interface ProposalMessageCardProps {
  proposalId?: string;
  proposal?: PropuestaPreview;
  formattedTime: string;
  isMine: boolean;
}

export const ProposalMessageCard: React.FC<ProposalMessageCardProps> = ({
  proposalId,
  proposal: initialProposal,
  formattedTime,
  isMine,
}) => {
  const history = useHistory();
  const [proposal, setProposal] = useState<PropuestaPreview | undefined>(initialProposal);
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(initialProposal?.user_vote != null);

  useEffect(() => {
    if (proposalId) {
      propuestasService.getById(proposalId).then((data) => {
        setProposal({
          id: data.id,
          title: data.title,
          description: data.description,
          responsible_name: data.responsible_user.display_name,
          withdrawal_amount: data.withdrawal_amount,
          estimated_profit: data.estimated_profit,
          background_image_url: data.background_image_url,
          votes_yes: data.votes_yes,
          votes_no: data.votes_no,
          total_members: data.total_members,
          can_vote: data.can_vote,
          user_vote: data.user_vote,
          status: data.status,
        });
        if (data.user_vote != null) {
          setVoted(true);
        }
      }).catch(() => { });
    }
  }, [proposalId]);

  const handleVote = async (answer: 'YES' | 'NO') => {
    if (!proposal || voting || voted || proposal.status !== 'PENDING') return;
    setVoting(true);
    try {
      const updated = await propuestasService.vote(proposal.id, answer);
      setProposal((prev) => prev ? {
        ...prev,
        votes_yes: updated.votes_yes,
        votes_no: updated.votes_no,
        status: updated.status,
      } : prev);
      setVoted(true);
    } catch {
      setVoted(true);
    } finally {
      setVoting(false);
    }
  };

  if (!proposal) return null;

  const formatMonto = (amount: number) =>
    amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

  const total = proposal.votes_yes + proposal.votes_no;

  const handleVerPropuesta = () => {
    history.push(`/ver-propuesta/${proposal.id}`);
  };

  return (
    <div className={`proposal-message-card ${isMine ? 'mine' : 'theirs'}`}>
      {proposal.background_image_url && (
        <img
          src={proposal.background_image_url}
          alt={proposal.title}
          className="proposal-card-image"
        />
      )}

      <div className="proposal-card-body">
        <h4 className="proposal-card-title">{proposal.title}</h4>
        <p className="proposal-card-desc">
          {proposal.description.length > 80
            ? proposal.description.substring(0, 80) + '...'
            : proposal.description}
        </p>

        <div className="proposal-card-field">
          <span className="proposal-field-label">Encargado para el retiro de dinero:</span>
          <span className="proposal-field-value">{proposal.responsible_name}</span>
        </div>

        <div className="proposal-card-field">
          <span className="proposal-field-label">Monto a retirar</span>
          <span className="proposal-field-value">{formatMonto(proposal.withdrawal_amount)}</span>
        </div>

        {proposal.estimated_profit !== undefined && (
          <div className="proposal-card-field">
            <span className="proposal-field-label">Ganancia de dinero estimado:</span>
            <span className="proposal-field-value">{formatMonto(proposal.estimated_profit)}</span>
          </div>
        )}

        <div className="proposal-card-votes">
          {(() => {
            const total = proposal.votes_yes + proposal.votes_no;
            const yesPercent = total > 0 ? (proposal.votes_yes / total) * 100 : 0;
            const noPercent = total > 0 ? (proposal.votes_no / total) * 100 : 0;
            const canVote = !voting && !voted && proposal.status === 'PENDING' && (proposal.can_vote ?? true);
            const userVote = proposal.user_vote;
            return (
              <>
                <button
                  className={`proposal-vote-row${canVote ? '' : ' disabled'}${userVote === 'YES' ? ' voted-yes' : ''}`}
                  onClick={() => handleVote('YES')}
                  disabled={!canVote}
                >
                  <div className="proposal-vote-row-header">
                    <span className="proposal-vote-label">
                      {userVote === 'YES' && '✓ '}Sí, estoy de acuerdo
                    </span>
                    <span className="proposal-vote-count yes">{proposal.votes_yes}</span>
                  </div>
                  <div className="proposal-vote-bar-track">
                    <div className="proposal-vote-bar-fill yes" style={{ width: `${yesPercent}%` }} />
                  </div>
                </button>
                <button
                  className={`proposal-vote-row${canVote ? '' : ' disabled'}${userVote === 'NO' ? ' voted-no' : ''}`}
                  onClick={() => handleVote('NO')}
                  disabled={!canVote}
                >
                  <div className="proposal-vote-row-header">
                    <span className="proposal-vote-label">
                      {userVote === 'NO' && '✓ '}No, no estoy de acuerdo
                    </span>
                    <span className="proposal-vote-count no">{proposal.votes_no}</span>
                  </div>
                  <div className="proposal-vote-bar-track">
                    <div className="proposal-vote-bar-fill no" style={{ width: `${noPercent}%` }} />
                  </div>
                </button>
                <span className="proposal-card-time">{formattedTime} &middot; Votaron: {total}/{proposal.total_members}</span>
              </>
            );
          })()}
        </div>

        <div className="proposal-card-footer">

          <button className="proposal-card-link" onClick={handleVerPropuesta}>
            Ver propuesta •
          </button>
        </div>
      </div>
    </div>
  );
};
