import React from 'react';
import { IonIcon } from '@ionic/react';
import { linkOutline, reloadOutline } from 'ionicons/icons';
import { Project } from '@/models/projects';
import { getBlockExplorerAddressUrl } from '@/contracts/config';

interface ChainStateHeaderProps {
  project: Project;
  chainLoading: boolean;
  onRefresh: () => void;
}

export const ChainStateHeader: React.FC<ChainStateHeaderProps> = ({ project, chainLoading, onRefresh }) => {
  const explorerAddress = project.vault_address || project.contract_address;
  return (
    <div className="chain-state-header">
      <h3 className="chain-state-title">Estado en blockchain</h3>
      <div className="chain-state-header-right">
        {explorerAddress && (
          <a
            href={getBlockExplorerAddressUrl(explorerAddress)}
            target="_blank"
            rel="noopener noreferrer"
            className="chain-explorer-link"
          >
            <IonIcon icon={linkOutline} />
            Celoscan
          </a>
        )}
        <button className="chain-refresh-btn" onClick={onRefresh} disabled={chainLoading}>
          <IonIcon icon={reloadOutline} className={chainLoading ? 'spinning' : ''} />
        </button>
      </div>
    </div>
  );
};
