import React from 'react';
import { Propuesta } from '@/types/propuesta';
import './VotingResults.css';

interface VotingResultsProps {
  propuesta: Propuesta;
  onVote?: (answer: 'YES' | 'NO') => void;
  voting?: boolean;
}

export const VotingResults: React.FC<VotingResultsProps> = ({ propuesta, onVote, voting }) => {
  const total = propuesta.votes_yes + propuesta.votes_no;
  const yesPercent = total > 0 ? (propuesta.votes_yes / total) * 100 : 0;
  const noPercent = total > 0 ? (propuesta.votes_no / total) * 100 : 0;
  const isPending = propuesta.status === 'PENDING';
  const canInteract = !voting && isPending && (propuesta.can_vote ?? true) && !!onVote;
  const userVote = propuesta.user_vote;

  return (
    <div className="voting-results">
      <p className="voting-results-label">Respuestas:</p>

      <button
        className={`voting-option${canInteract ? '' : ' voting-option--disabled'}${userVote === 'YES' ? ' voting-option--selected' : ''}`}
        onClick={() => canInteract && userVote !== 'YES' && onVote?.('YES')}
        disabled={!canInteract}
      >
        <span className={`voting-radio ${userVote === 'YES' ? 'voting-radio--selected' : ''}`} />
        <div className="voting-option-body">
          <div className="voting-option-header">
            <span className="voting-option-text">Sí, estoy de acuerdo</span>
            <span className="voting-option-count yes">{propuesta.votes_yes}</span>
          </div>
          <div className="voting-bar-track">
            <div className="voting-bar-fill yes" style={{ width: `${yesPercent}%` }} />
          </div>
        </div>
      </button>

      <button
        className={`voting-option${canInteract ? '' : ' voting-option--disabled'}${userVote === 'NO' ? ' voting-option--selected' : ''}`}
        onClick={() => canInteract && userVote !== 'NO' && onVote?.('NO')}
        disabled={!canInteract}
      >
        <span className={`voting-radio ${userVote === 'NO' ? 'voting-radio--selected' : ''}`} />
        <div className="voting-option-body">
          <div className="voting-option-header">
            <span className="voting-option-text">No, no estoy de acuerdo</span>
            <span className="voting-option-count no">{propuesta.votes_no}</span>
          </div>
          <div className="voting-bar-track">
            <div className="voting-bar-fill no" style={{ width: `${noPercent}%` }} />
          </div>
        </div>
      </button>

      <p className="voting-total">
        Votaron: {total}/{propuesta.total_members}
      </p>
    </div>
  );
};
