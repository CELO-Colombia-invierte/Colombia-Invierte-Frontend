import React from 'react';
import { Propuesta } from '@/types/propuesta';
import './VotingResults.css';

interface VotingResultsProps {
  propuesta: Propuesta;
}

export const VotingResults: React.FC<VotingResultsProps> = ({ propuesta }) => {
  const total = propuesta.votes_yes + propuesta.votes_no;
  const yesPercent = total > 0 ? (propuesta.votes_yes / total) * 100 : 0;
  const noPercent = total > 0 ? (propuesta.votes_no / total) * 100 : 0;

  return (
    <div className="voting-results">
      <p className="voting-results-label">Respuestas:</p>

      <div className="voting-option">
        <div className="voting-option-header">
          <span className="voting-option-text">Sí, estoy de acuerdo</span>
          <span className="voting-option-count yes">{propuesta.votes_yes}</span>
        </div>
        <div className="voting-bar-track">
          <div className="voting-bar-fill yes" style={{ width: `${yesPercent}%` }} />
        </div>
      </div>

      <div className="voting-option">
        <div className="voting-option-header">
          <span className="voting-option-text">No, no estoy de acuerdo</span>
          <span className="voting-option-count no">{propuesta.votes_no}</span>
        </div>
        <div className="voting-bar-track">
          <div className="voting-bar-fill no" style={{ width: `${noPercent}%` }} />
        </div>
      </div>

      <p className="voting-total">
        Votaron: {total}/{propuesta.total_members}
      </p>
    </div>
  );
};
