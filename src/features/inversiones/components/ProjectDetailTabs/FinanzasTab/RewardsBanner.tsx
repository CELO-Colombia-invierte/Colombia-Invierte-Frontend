import React from 'react';
import { IonIcon } from '@ionic/react';
import { giftOutline } from 'ionicons/icons';
import { formatUsdc } from './formatters';

interface RewardsBannerProps {
  pendingRewards: bigint;
  claiming: boolean;
  onClaim: () => void;
}

export const RewardsBanner: React.FC<RewardsBannerProps> = ({ pendingRewards, claiming, onClaim }) => (
  <div className="chain-rewards-section">
    <div className="chain-rewards-info">
      <IonIcon icon={giftOutline} />
      <span>
        Rendimientos disponibles: <strong>{formatUsdc(pendingRewards)}</strong>
      </span>
    </div>
    <button className="chain-rewards-btn" onClick={onClaim} disabled={claiming}>
      {claiming ? 'Cobrando...' : 'Cobrar rendimientos'}
    </button>
  </div>
);
