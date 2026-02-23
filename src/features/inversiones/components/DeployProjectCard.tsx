import React, { useEffect, useRef, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { cloudUploadOutline, checkmarkCircleOutline, openOutline } from 'ionicons/icons';
import { ConnectButton } from 'thirdweb/react';
import type { Account } from 'thirdweb/wallets';
import { thirdwebClient } from '@/app/App';
import { CHAIN } from '@/contracts/config';
import { blockchainService } from '@/services/blockchain.service';
import { projectsService } from '@/services/projects';
import { Project, ProjectType, ProjectVisibility, Currency } from '@/models/projects/project.model';
import { BLOCKCHAIN_CONFIG, getBlockExplorerTxUrl, getBlockExplorerAddressUrl } from '@/contracts/config';
import './DeployProjectCard.css';

// Tasa COP → USDT para MVP/testnet
const COP_TO_USDT = BLOCKCHAIN_CONFIG.COP_TO_USDT_RATE;
const USDT_DECIMALS = BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS;
// Duración de venta fija para Tokenizacion: 30 días
const DEFAULT_SALE_DURATION_SECONDS = BigInt(30 * 24 * 60 * 60);

function copToUsdt(cop: number): bigint {
  return BigInt(Math.round((cop / COP_TO_USDT) * 10 ** USDT_DECIMALS));
}

function usdToUsdt(usd: number): bigint {
  return BigInt(Math.round(usd * 10 ** USDT_DECIMALS));
}

type DeployStatus = 'idle' | 'loading' | 'pending' | 'deployed';

interface DeployProjectCardProps {
  project: Project;
  account: Account | undefined;
  onPublished?: (updatedProject: Project) => void;
}

export const DeployProjectCard: React.FC<DeployProjectCardProps> = ({
  project,
  account,
  onPublished,
}) => {
  const [status, setStatus] = useState<DeployStatus>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const startPolling = (projectId: string) => {
    pollingRef.current = setInterval(async () => {
      try {
        const data = await projectsService.getBlockchainData(projectId);
        if (data.isDeployed && data.contractAddress) {
          setContractAddress(data.contractAddress);
          if (pollingRef.current) clearInterval(pollingRef.current);
          // Publicar el proyecto al confirmar el deploy en blockchain
          const updatedProject = await projectsService.update(projectId, {
            visibility: ProjectVisibility.PUBLIC,
          });
          setStatus('deployed');
          onPublished?.(updatedProject);
        }
      } catch {
        // silenciar errores de polling
      }
    }, 5000);
  };

  const buildNatilleraParams = () => {
    const details = project.natillera_details!;
    const monthlyContribution = details.monthly_fee_currency === Currency.COP
      ? copToUsdt(details.monthly_fee_amount)
      : usdToUsdt(details.monthly_fee_amount);

    return {
      token: BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS,
      monthlyContribution,
      totalMonths: BigInt(details.duration_months),
      maxMembers: BigInt(details.max_participants ?? 12),
      // El contrato requiere que startTime sea futuro. Usamos +5 min de buffer.
      startTime: BigInt(Math.floor(Date.now() / 1000) + 300),
    };
  };

  const buildTokenizacionParams = () => {
    const details = project.tokenization_details!;
    const pricePerToken = details.price_per_token_currency === Currency.COP
      ? copToUsdt(details.price_per_token_amount)
      : usdToUsdt(details.price_per_token_amount);

    const saleStart = details.public_sale_starts_at
      ? BigInt(Math.floor(new Date(details.public_sale_starts_at).getTime() / 1000))
      : BigInt(Math.floor(Date.now() / 1000));

    return {
      paymentToken: BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS,
      pricePerToken,
      totalTokens: BigInt(Math.round(details.total_tokens)),
      saleStart,
      saleDuration: DEFAULT_SALE_DURATION_SECONDS,
    };
  };

  const handleDeploy = async () => {
    if (!account) {
      setError('Conecta tu wallet para publicar el proyecto.');
      return;
    }

    setError(null);
    setStatus('loading');

    try {
      let hash: string;

      if (project.type === ProjectType.NATILLERA) {
        hash = await blockchainService.deployNatillera(account, buildNatilleraParams());
      } else {
        hash = await blockchainService.deployTokenizacion(account, buildTokenizacionParams());
      }

      setTxHash(hash);
      setStatus('pending');
      startPolling(project.id);
    } catch (err) {
      setStatus('idle');
      console.error('Deploy error:', err);
      const msg = err instanceof Error ? err.message : 'Error al desplegar';
      setError(msg);
    }
  };

  if (status === 'deployed' && contractAddress) {
    return (
      <div className="deploy-card deploy-card--deployed">
        <IonIcon icon={checkmarkCircleOutline} className="deploy-card__icon deploy-card__icon--success" />
        <div className="deploy-card__body">
          <p className="deploy-card__title">Contrato desplegado</p>
          <p className="deploy-card__address">{contractAddress}</p>
          <a
            href={getBlockExplorerAddressUrl(contractAddress)}
            target="_blank"
            rel="noopener noreferrer"
            className="deploy-card__link"
          >
            Ver en Celoscan <IonIcon icon={openOutline} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="deploy-card">
      <IonIcon icon={cloudUploadOutline} className="deploy-card__icon" />
      <div className="deploy-card__body">
        <p className="deploy-card__title">Tu proyecto está privado</p>
        <p className="deploy-card__subtitle">
          Publícalo para que los participantes puedan invertir de forma segura y transparente. Al publicar se desplegará el contrato en blockchain.
        </p>

        {status === 'pending' && txHash && (
          <div className="deploy-card__pending">
            <p className="deploy-card__pending-text">
              Transacción enviada — esperando confirmación...
            </p>
            <a
              href={getBlockExplorerTxUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="deploy-card__link"
            >
              Ver en Celoscan <IonIcon icon={openOutline} />
            </a>
          </div>
        )}

        {error && <p className="deploy-card__error">{error}</p>}

        {status !== 'pending' && (
          <button
            className="deploy-card__btn"
            onClick={handleDeploy}
            disabled={status === 'loading' || !account}
          >
            {status === 'loading' ? 'Preparando transacción...' : 'Publicar proyecto'}
          </button>
        )}

        {!account && (
          <ConnectButton
            client={thirdwebClient}
            chain={CHAIN}
            connectButton={{ label: 'Conectar wallet' }}
            detailsButton={{ displayBalanceToken: undefined }}
          />
        )}
      </div>
    </div>
  );
};
