import React, { useState, useEffect, useRef } from 'react';
import { IonIcon } from '@ionic/react';
import { cloudUploadOutline, checkmarkCircleOutline, openOutline } from 'ionicons/icons';
import { useConnectModal } from 'thirdweb/react';
import { inAppWallet, createWallet } from 'thirdweb/wallets';
import { thirdwebClient } from '@/app/App';
import { projectsService } from '@/services/projects';
import { blockchainService } from '@/services/blockchain.service';
import { Project, ProjectType } from '@/models/projects/project.model';
import { BLOCKCHAIN_CONFIG, CHAIN, getBlockExplorerTxUrl } from '@/contracts/config';
import { useBlockchain } from '@/hooks/use-blockchain';
import './DeployProjectCard.css';

const wallets = [
  inAppWallet({ auth: { options: ['email', 'google', 'apple'] } }),
  createWallet('io.metamask'),
];

type DeployStatus = 'idle' | 'connecting' | 'deploying' | 'registering' | 'deployed';

interface DeployProjectCardProps {
  project: Project;
  onPublished?: (updatedProject: Project) => void;
}

export const DeployProjectCard: React.FC<DeployProjectCardProps> = ({
  project,
  onPublished,
}) => {
  const { account } = useBlockchain();
  const { connect } = useConnectModal();
  const [status, setStatus] = useState<DeployStatus>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pendingDeploy = useRef(false);

  useEffect(() => {
    if (account && pendingDeploy.current) {
      pendingDeploy.current = false;
      performDeploy(account);
    }
  }, [account]);

  const copToUsdc = (cop: number): bigint => {
    const usdc = (cop / BLOCKCHAIN_CONFIG.COP_TO_USDT_RATE).toFixed(
      BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS,
    );
    return blockchainService.parseUnits(usdc, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS);
  };

  const buildNatilleraParams = () => {
    const d = project.natillera_details!;
    return {
      settlementToken: BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS,
      quota: copToUsdc(d.monthly_fee_amount),
      duration: BigInt(d.duration_months),
      maxMembers: BigInt(d.max_participants ?? 20),
    };
  };

  const buildTokenizacionParams = () => {
    const d = project.tokenization_details!;
    const tokenPrice = copToUsdc(d.price_per_token_amount);
    const fundingTarget = tokenPrice * BigInt(d.total_tokens);
    return {
      settlementToken: BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS,
      fundingTarget,
      minimumCap: fundingTarget / 2n,
      tokenPrice,
      saleDuration: BigInt(30 * 24 * 60 * 60),
      name: d.token_name,
      symbol: d.token_symbol,
    };
  };

  const performDeploy = async (acc: NonNullable<typeof account>) => {
    setError(null);
    setStatus('deploying');
    try {
      const addresses = project.type === ProjectType.NATILLERA
        ? await blockchainService.deployNatilleraV2(acc, buildNatilleraParams())
        : await blockchainService.deployTokenizacionV2(acc, buildTokenizacionParams());

      setStatus('registering');
      const updatedProject = await projectsService.registerV2Contract(project.id, addresses);

      setTxHash(addresses.tx_hash);
      setStatus('deployed');
      onPublished?.(updatedProject);
    } catch (err) {
      setStatus('idle');
      setError(err instanceof Error ? err.message : 'Error al publicar el proyecto');
    }
  };

  const handlePublish = async () => {
    if (account) {
      performDeploy(account);
      return;
    }

    setStatus('connecting');
    pendingDeploy.current = true; // Set BEFORE awaiting so the useEffect catches it
    try {
      await connect({
        client: thirdwebClient,
        chain: CHAIN,
        wallets,
      });
    } catch {
      pendingDeploy.current = false;
      setStatus('idle');
    }
  };

  if (status === 'deployed' && txHash) {
    return (
      <div className="deploy-card deploy-card--deployed">
        <IonIcon icon={checkmarkCircleOutline} className="deploy-card__icon deploy-card__icon--success" />
        <div className="deploy-card__body">
          <p className="deploy-card__title">¡Proyecto publicado!</p>
          <p className="deploy-card__subtitle">Tu proyecto ya está visible para los participantes.</p>
          <a
            href={getBlockExplorerTxUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="deploy-card__link"
          >
            Ver registro de publicación <IonIcon icon={openOutline} />
          </a>
        </div>
      </div>
    );
  }

  const isInProgress = status === 'connecting' || status === 'deploying' || status === 'registering';

  const buttonLabel = () => {
    if (status === 'connecting') return 'Verificando identidad...';
    if (status === 'deploying') return 'Publicando...';
    if (status === 'registering') return 'Guardando...';
    return 'Publicar proyecto';
  };

  return (
    <div className="deploy-card">
      <IonIcon icon={cloudUploadOutline} className="deploy-card__icon" />
      <div className="deploy-card__body">
        <p className="deploy-card__title">Tu proyecto aún no está publicado</p>
        <p className="deploy-card__subtitle">
          Publícalo para que los participantes puedan invertir. Solo toma un momento.
        </p>

        {error && <p className="deploy-card__error">{error}</p>}

        <button
          className="deploy-card__btn"
          onClick={handlePublish}
          disabled={isInProgress}
        >
          {buttonLabel()}
        </button>
      </div>
    </div>
  );
};
