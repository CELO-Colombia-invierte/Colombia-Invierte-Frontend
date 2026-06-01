import React from 'react';
import { IonIcon } from '@ionic/react';
import { snowOutline } from 'ionicons/icons';

interface VaultFrozenBannerProps {
  message: string;
}

/**
 * Aviso reutilizable para cuando la bóveda del proyecto está congelada por una
 * disputa (ProjectVault.paused()) o no está operativa. Mientras esto sea así, el
 * contrato revierte toda acción `whenVaultOperational`.
 */
export const VaultFrozenBanner: React.FC<VaultFrozenBannerProps> = ({ message }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
      padding: '10px 12px',
      background: '#eef4ff',
      border: '1px solid #93c5fd',
      borderRadius: 8,
      color: '#1e3a8a',
      fontSize: 13,
    }}
  >
    <IonIcon icon={snowOutline} style={{ fontSize: 18, flexShrink: 0 }} />
    <span>{message}</span>
  </div>
);
