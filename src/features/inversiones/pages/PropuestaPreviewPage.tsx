import React, { useState } from 'react';
import { IonPage, IonContent, useIonToast } from '@ionic/react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { toUnits } from 'thirdweb';
import { PropuestaFormData } from '@/types/propuesta';
import { propuestasService } from '@/services/propuestas/propuestas.service';
import { useBlockchain } from '@/hooks/use-blockchain';
import { projectsService } from '@/services/projects/projects.service';
import { BLOCKCHAIN_CONFIG } from '@/contracts/config';
import './PropuestaPreviewPage.css';

interface LocationState {
  formData: PropuestaFormData;
  projectId: string;
}

const PropuestaPreviewPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const [present] = useIonToast();
  const [submitting, setSubmitting] = useState(false);
  const { proposeOnChain } = useBlockchain();

  const formData = location.state?.formData;

  if (!formData) {
    history.goBack();
    return null;
  }

  const formatMonto = (amount: number | null | undefined) =>
    (amount ?? 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

  const handleEditar = () => {
    history.goBack();
  };

  const handleSubmit = async () => {
    console.log('[PROPOSE] handleSubmit start');
    setSubmitting(true);
    try {
      const chain = await projectsService.getBlockchainData(projectId);
      console.log('[PROPOSE] chain data:', chain);
      const propuesta = await propuestasService.create(projectId, formData);
      console.log('[PROPOSE] propuesta created:', propuesta.id, 'responsible:', propuesta.responsible_user);

      if (chain.governanceAddress) {
        const recipient = propuesta.responsible_user?.wallet_address;
        console.log('[PROPOSE] recipient wallet:', recipient);
        if (!recipient) {
          throw new Error('El encargado no tiene wallet registrada. No se puede firmar on-chain.');
        }
        const usdcAmount = formData.withdrawal_amount / BLOCKCHAIN_CONFIG.COP_TO_USDT_RATE;
        const amountBigInt = toUnits(
          usdcAmount.toFixed(BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS),
          BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS,
        );
        console.log('[PROPOSE] params:', {
          governance: chain.governanceAddress,
          action: 6,
          amount: amountBigInt.toString(),
          recipient,
          token: BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS,
          description: formData.title,
        });

        await present({
          message: 'Firma la propuesta en tu wallet para registrarla on-chain',
          duration: 2500,
        });
        console.log('[PROPOSE] calling proposeOnChain...');
        const { txHash, proposalId } = await proposeOnChain(
          chain.governanceAddress,
          6, // Action.Disbursement
          BigInt(0),
          amountBigInt,
          recipient,
          BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS,
          formData.title,
        );
        console.log('[PROPOSE] propose tx OK', { txHash, proposalId });
        await propuestasService.attachChain(propuesta.id, proposalId, txHash);
        console.log('[PROPOSE] attachChain OK');
      } else {
        console.warn('[PROPOSE] chain.governanceAddress is falsy — skipping on-chain propose');
      }

      await present({
        message: 'Propuesta enviada exitosamente',
        duration: 2500,
        color: 'success',
      });
      history.push(`/inversiones/${projectId}`);
    } catch (err) {
      console.error('[PROPOSE] error:', err);
      const anyErr = err as any;
      const fullMsg: string = (err instanceof Error ? err.message : '') + ' ' + JSON.stringify(anyErr ?? {});
      // Match "data":"0x..." specifically (revert payload)
      const dataMatch = fullMsg.match(/"data"\s*:\s*"(0x[a-fA-F0-9]+)"/);
      const selectorMatch = dataMatch ? dataMatch[1] : fullMsg.match(/0x[a-fA-F0-9]{8,}/)?.[0];
      console.error('[PROPOSE] revert data (full):', fullMsg);
      console.error('[PROPOSE] revert data field:', dataMatch?.[1]);
      console.error('[PROPOSE] first hex found:', selectorMatch);
      const SELECTORS: Record<string, string> = {
        '0x82b42900': 'Unauthorized',
        '0x0bd3e45f': 'InvalidDisbursement',
        '0xee032808': 'InvalidProposal',
        '0x194b573d': 'InvalidVaultState',
        '0xda9f8b34': 'VaultPaused',
        '0xd92e233d': 'ZeroAddress',
        '0x0dc10197': 'AlreadyExecuted',
        '0x7c9a1cf9': 'AlreadyVoted',
        '0xd5dd0c66': 'InvalidVote',
        '0x66b6cb4a': 'VotingClosed',
        '0x88c081c7': 'VotingStillOpen',
        '0xaa26a693': 'QuorumNotReached',
        '0x3ee5aeb5': 'ReentrancyGuardReentrantCall',
      };
      const hex = (selectorMatch || '').slice(0, 10).toLowerCase();
      console.error('[PROPOSE] decoded error:', SELECTORS[hex] ?? '(unknown selector ' + hex + ')');
      const msg = err instanceof Error ? err.message : 'Error al enviar la propuesta';
      await present({ message: msg, duration: 3000, color: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="preview-page">
        <div className="preview-header">
          <button className="preview-back" onClick={() => history.goBack()}>
            ←
          </button>
          <h1 className="preview-title">Previsualización</h1>
        </div>

        <div className="preview-content">
          <h2 className="preview-section-title">Resumen</h2>

          {formData.background_image_url && (
            <img
              src={formData.background_image_url}
              alt={formData.title}
              className="preview-image"
            />
          )}

          <div className="preview-title-row">
            <h3 className="preview-propuesta-title">{formData.title}</h3>
            <button className="preview-edit-btn" onClick={handleEditar}>
              Editar
            </button>
          </div>

          <p className="preview-description">{formData.description}</p>

          <div className="preview-details">
            <div className="preview-detail-item">
              <span className="preview-detail-label">Encargado para el retiro de dinero:</span>
              <span className="preview-detail-value">{formData.responsible_name}</span>
            </div>

            <div className="preview-detail-item">
              <span className="preview-detail-label">Monto a retirar:</span>
              <span className="preview-detail-value">{formatMonto(formData.withdrawal_amount)}</span>
            </div>

            {formData.estimated_profit !== undefined && (
              <div className="preview-detail-item">
                <span className="preview-detail-label">Ganancia de dinero estimado:</span>
                <span className="preview-detail-value">{formatMonto(formData.estimated_profit)}</span>
              </div>
            )}
          </div>

        </div>

        <div className="preview-footer">
          <button
            className="propuesta-btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Enviando...' : 'Hacer propuesta'}
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PropuestaPreviewPage;
