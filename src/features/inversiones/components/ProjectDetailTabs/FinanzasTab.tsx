import React from 'react';
import { Project } from '@/models/projects';
import {
  NatilleraState,
  NatilleraV2State,
  TokenizacionState,
  RevenueModuleState,
} from '@/services/blockchain.service';
import { useBlockchain } from '@/hooks/use-blockchain';
import { useChainData } from './FinanzasTab/useChainData';
import { useFinanzasActions } from './FinanzasTab/useFinanzasActions';
import { FinancialItemsList } from './FinanzasTab/FinancialItemsList';
import { ChainStateHeader } from './FinanzasTab/ChainStateHeader';
import { NatilleraV2Stats } from './FinanzasTab/NatilleraV2Stats';
import { NatilleraV1Stats } from './FinanzasTab/NatilleraV1Stats';
import { TokenizacionV1Stats } from './FinanzasTab/TokenizacionV1Stats';
import { TokenizacionV2Section } from './FinanzasTab/TokenizacionV2Section';
import './ProjectDetailTabs.css';

interface FinanzasTabProps {
  project: Project;
  showJoinButton?: boolean;
  onJoinAction?: () => void;
  joinStatus?: 'pending' | 'approved' | null;
}

export const FinanzasTab: React.FC<FinanzasTabProps> = ({
  project,
  showJoinButton,
  onJoinAction,
  joinStatus,
}) => {
  const { account, claimRendimientos, investInProject } = useBlockchain();
  const isV2 = !!(project.natillera_address || project.revenue_address);
  const chain = useChainData(project, account);
  const actions = useFinanzasActions({
    project,
    isV2,
    account,
    chainState: chain.chainState,
    userUsdcBalance: chain.userUsdcBalance,
    loadChainState: chain.loadChainState,
    claimRendimientos,
    investInProject,
  });

  const { chainState, chainLoading } = chain;
  const hasChainData = project.contract_address || project.natillera_address || project.revenue_address;

  return (
    <div className="finanzas-tab">
      <h2 className="finanzas-title">Información financiera</h2>

      <FinancialItemsList project={project} />

      {hasChainData && (
        <div className="chain-state-section">
          <ChainStateHeader project={project} chainLoading={chainLoading} onRefresh={chain.loadChainState} />

          {chainLoading && !chainState && (
            <p className="chain-state-loading">Cargando datos on-chain...</p>
          )}

          {chainState && project.type === 'NATILLERA' && isV2 && (
            <NatilleraV2Stats state={chainState as NatilleraV2State} vaultBalance={chain.vaultBalance} />
          )}

          {chainState && project.type === 'NATILLERA' && !isV2 && (
            <NatilleraV1Stats
              state={chainState as NatilleraState}
              totalMonths={project.natillera_details?.duration_months ?? 0}
            />
          )}

          {chainState && project.type === 'TOKENIZATION' && isV2 && (
            <TokenizacionV2Section
              account={account}
              project={project}
              state={chainState as RevenueModuleState}
              chain={chain}
              actions={actions}
            />
          )}

          {chainState && project.type === 'TOKENIZATION' && !isV2 && (
            <TokenizacionV1Stats
              state={chainState as TokenizacionState}
              projectTokenDecimals={chain.projectTokenDecimals}
            />
          )}
        </div>
      )}

      {showJoinButton && (
        <div className="finanzas-actions">
          <button className="action-button secondary" onClick={() => window.history.back()}>
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
    </div>
  );
};
