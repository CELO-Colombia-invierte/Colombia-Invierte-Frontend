import React from 'react';
import { Propuesta } from '@/types/propuesta';
import './PropuestaCard.css';

const CARD_COLORS = ['#E8580A', '#1a1a2e', '#00A86B', '#6b7280'];

interface PropuestaCardProps {
  propuesta: Propuesta;
  index: number;
  onClick: () => void;
}

export const PropuestaCard: React.FC<PropuestaCardProps> = ({ propuesta, index, onClick }) => {
  const hasImage = !!propuesta.background_image_url;
  const bgColor = CARD_COLORS[index % CARD_COLORS.length];

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });

  return (
    <div
      className="propuesta-card"
      style={
        hasImage
          ? { backgroundImage: `url(${propuesta.background_image_url})` }
          : { backgroundColor: bgColor }
      }
      onClick={onClick}
    >
      {hasImage && <div className="propuesta-card-overlay" />}
      <div className="propuesta-card-content">
        <div className="propuesta-card-header">
          <span className="propuesta-card-title">{propuesta.title}</span>
          <span className="propuesta-card-arrow">→</span>
        </div>
        <div className="propuesta-card-footer">
          <span className="propuesta-card-votes">
            Votaron: {propuesta.votes_yes + propuesta.votes_no}/{propuesta.total_members}
          </span>
          <span className="propuesta-card-date">Creado: {formatDate(propuesta.created_at)}</span>
        </div>
      </div>
    </div>
  );
};
