import React, { useEffect, useRef, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { cloudUploadOutline, checkmarkCircleOutline, openOutline } from 'ionicons/icons';
import { projectsService } from '@/services/projects';
import { Project } from '@/models/projects/project.model';
import { getBlockExplorerAddressUrl } from '@/contracts/config';
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

  const handlePublish = async () => {
    setError(null);
    setStatus('loading');
    try {
      const updatedProject = await projectsService.publish(project.id);
      if (updatedProject.contract_address) {
        setContractAddress(updatedProject.contract_address);
        setStatus('deployed');
        onPublished?.(updatedProject);
      } else {
        // Deploy en curso, hacer polling
        setStatus('pending');
        startPolling(project.id);
      }
    } catch (err) {
      setStatus('idle');
      console.error('Deploy error:', err);
      const msg = err instanceof Error ? err.message : 'Error al publicar';
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
