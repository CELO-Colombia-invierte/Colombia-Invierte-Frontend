import React, { useEffect, useRef, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { cloudUploadOutline, checkmarkCircleOutline, openOutline } from 'ionicons/icons';
import { projectsService } from '@/services/projects';
import { Project, ProjectType } from '@/models/projects/project.model';
import { getBlockExplorerAddressUrl, BLOCKCHAIN_CONFIG } from '@/contracts/config';
import { useBlockchain } from '@/hooks/use-blockchain';
import './DeployProjectCard.css';

type DeployStatus = 'idle' | 'loading' | 'pending' | 'deployed';

interface DeployProjectCardProps {
  project: Project;
  onPublished?: (updatedProject: Project) => void;
}

export const DeployProjectCard: React.FC<DeployProjectCardProps> = ({
  project,
  onPublished,
}) => {
  const [status, setStatus] = useState<DeployStatus>('idle');
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
          setStatus('deployed');
          const refreshed = await projectsService.findOne(projectId);
          onPublished?.(refreshed);
        }
      } catch {
        // silenciar errores de polling
      }
    }, 5000);
  };

  const { deployNatillera, deployTokenizacion, account } = useBlockchain();

  const handlePublish = async () => {
    if (!account) {
      setError('Por favor conecta tu wallet primero antes de publicar el contrato');
      return;
    }

    setError(null);
    setStatus('loading');
    try {
      let result: { txHash: string; contractAddress: string };

      if (project.type === ProjectType.NATILLERA) {
        if (!project.natillera_details) {
          throw new Error('El proyecto no tiene detalles de natillera');
        }

        const details = project.natillera_details;

        result = await deployNatillera({
          token: BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS,
          monthlyContribution: BigInt(details.monthly_fee_amount) * BigInt(10 ** BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS),
          totalMonths: BigInt(details.duration_months),
          maxMembers: BigInt(details.max_participants || 0),
          startTime: BigInt(Math.floor(new Date(details.payment_deadline_at || Date.now()).getTime() / 1000)),
        });
      } else if (project.type === ProjectType.TOKENIZATION) {
        if (!project.tokenization_details) {
          throw new Error('El proyecto no tiene detalles de tokenización');
        }

        const details = project.tokenization_details;

        result = await deployTokenizacion({
          paymentToken: BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS,
          pricePerToken: BigInt(details.price_per_token_amount) * BigInt(10 ** BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS),
          totalTokens: BigInt(details.total_tokens),
          saleStart: BigInt(Math.floor(new Date(details.presale_starts_at || Date.now()).getTime() / 1000)),
          saleDuration: BigInt(30 * 24 * 60 * 60), // TODO: Definir duración correcta o usar un valor por defecto
        });
      } else {
        throw new Error('Tipo de proyecto no soportado');
      }

      setStatus('pending');

      // Registrar el contrato en el backend usando V1
      const updatedProject = await projectsService.registerContract(project.id, {
        contractAddress: result.contractAddress,
        txHash: result.txHash,
      });

      if (updatedProject.contract_address) {
        setContractAddress(updatedProject.contract_address);
        setStatus('deployed');
        onPublished?.(updatedProject);
      } else {
        setStatus('pending');
        startPolling(project.id);
      }
    } catch (err) {
      setStatus('idle');
      console.error('Deploy error:', err);
      // Extraer un mensaje de error más limpio si es posible
      const msg = err instanceof Error ? err.message : 'Error al publicar';
      // Limpiar mensaje largo de thirdweb
      const userMsg = msg.includes('user rejected') || msg.includes('cancel')
        ? 'Transacción rechazada por el usuario'
        : msg;
      setError(userMsg);
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

        {status === 'pending' && (
          <div className="deploy-card__pending">
            <p className="deploy-card__pending-text">
              Publicando en blockchain — esperando confirmación...
            </p>
          </div>
        )}

        {error && <p className="deploy-card__error">{error}</p>}

        {status !== 'pending' && (
          <button
            className="deploy-card__btn"
            onClick={handlePublish}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Publicando en blockchain...' : 'Publicar proyecto'}
          </button>
        )}
      </div>
    </div>
  );
};
