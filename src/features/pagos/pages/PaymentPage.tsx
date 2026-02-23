import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonIcon, useIonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { arrowBackOutline, checkmarkCircleOutline, openOutline } from 'ionicons/icons';
import { ConnectButton } from 'thirdweb/react';
import { inAppWallet, createWallet } from 'thirdweb/wallets';
import { thirdwebClient } from '@/app/App';
import { projectsService } from '@/services/projects';
import { Project } from '@/models/projects';
import { useBlockchain } from '@/hooks/use-blockchain';
import { blockchainService } from '@/services/blockchain.service';
import { BLOCKCHAIN_CONFIG, CHAIN, getBlockExplorerTxUrl } from '@/contracts/config';
import './PaymentPage.css';

const wallets = [
  inAppWallet({ auth: { options: ['email', 'google', 'apple'] } }),
  createWallet('io.metamask'),
];

type PayStep = 'idle' | 'approving' | 'depositing' | 'done';

const PaymentPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [present] = useIonToast();
  const { account, approveToken, depositToNatillera } = useBlockchain();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [usdtBalance, setUsdtBalance] = useState<bigint>(BigInt(0));
  const [monthlyContribution, setMonthlyContribution] = useState<bigint>(BigInt(0));
  // Token que el contrato Natillera espera recibir (leído del contrato, no hardcodeado)
  const [contractPaymentToken, setContractPaymentToken] = useState<string>(BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS);
  const [tokenMismatch, setTokenMismatch] = useState(false);
  const [payStep, setPayStep] = useState<PayStep>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    fetchProject();
  }, [id]);

  // Recargar saldo cuando cambia la cuenta o el token del contrato
  useEffect(() => {
    if (account?.address) {
      loadUsdtBalance(contractPaymentToken);
    }
  }, [account, contractPaymentToken]);

  useEffect(() => {
    if (project?.contract_address) {
      loadContractConfig();
    }
  }, [project]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await projectsService.findOne(id);
      setProject(data);
    } catch {
      await present({ message: 'Error al cargar el proyecto', duration: 3000, color: 'danger' });
      history.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadUsdtBalance = async (tokenAddress: string) => {
    if (!account?.address) return;
    try {
      const balance = await blockchainService.getTokenBalance(tokenAddress, account.address);
      setUsdtBalance(balance);
    } catch {
      // silenciar
    }
  };

  const loadContractConfig = async () => {
    if (!project?.contract_address) return;
    try {
      const config = await blockchainService.getNatilleraConfig(project.contract_address);
      setMonthlyContribution(config.monthlyContribution);
      // Usar el token que el contrato realmente espera, no el configurado en el frontend
      if (config.paymentToken && config.paymentToken !== '0x0000000000000000000000000000000000000000') {
        setContractPaymentToken(config.paymentToken);
        const normalizedContract = config.paymentToken.toLowerCase();
        const normalizedExpected = BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS.toLowerCase();
        setTokenMismatch(normalizedContract !== normalizedExpected);
      }
    } catch {
      // silenciar
    }
  };

  const handlePay = async () => {
    if (!project?.contract_address || !account) {
      await present({ message: 'Wallet no conectada', duration: 2000, color: 'warning' });
      return;
    }

    try {
      const allowance = await blockchainService.getTokenAllowance(
        contractPaymentToken,
        account.address,
        project.contract_address,
      );

      if (allowance < monthlyContribution) {
        setPayStep('approving');
        await approveToken(
          contractPaymentToken,
          project.contract_address,
          monthlyContribution,
        );
      }

      setPayStep('depositing');
      const hash = await depositToNatillera(project.contract_address);
      setTxHash(hash);
      setPayStep('done');
    } catch (err) {
      setPayStep('idle');
      const msg = err instanceof Error ? err.message : 'Error al procesar el pago';
      await present({ message: msg, duration: 4000, color: 'danger' });
    }
  };

  const formatUsdt = (value: bigint): string =>
    blockchainService.formatUnits(value, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS);

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <div className="loading-container"><p>Cargando...</p></div>
        </IonContent>
      </IonPage>
    );
  }

  if (!project) return null;

  const currency = project.natillera_details?.monthly_fee_currency || 'COP';
  const hasEnoughBalance = usdtBalance >= monthlyContribution;
  const isPaying = payStep === 'approving' || payStep === 'depositing';

  if (payStep === 'done' && txHash) {
    return (
      <IonPage>
        <IonContent className="payment-page">
          <div className="payment-header">
            <button className="payment-back-btn" onClick={() => history.push(`/inversiones/${id}`)}>
              <IonIcon icon={arrowBackOutline} />
            </button>
            <h1 className="payment-title">{project.name}</h1>
          </div>
          <div className="payment-content">
            <div className="payment-success">
              <IonIcon icon={checkmarkCircleOutline} className="payment-success-icon" />
              <p className="payment-success-title">¡Pago realizado!</p>
              <p className="payment-success-subtitle">
                Tu cuota fue registrada en blockchain exitosamente.
              </p>
              <a
                href={getBlockExplorerTxUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="payment-tx-link"
              >
                Ver transacción <IonIcon icon={openOutline} />
              </a>
            </div>
            <div className="payment-actions">
              <button
                className="payment-button primary"
                onClick={() => history.push(`/inversiones/${id}`)}
              >
                Volver al proyecto
              </button>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="payment-page">
        <div className="payment-header">
          <button className="payment-back-btn" onClick={() => history.goBack()}>
            <IonIcon icon={arrowBackOutline} />
          </button>
          <h1 className="payment-title">{project.name}</h1>
        </div>

        <div className="payment-content">
          <h2 className="payment-section-title">Detalles del pago</h2>
          <div className="payment-details">
            <div className="payment-detail-row">
              <span className="payment-detail-label">Cuota mensual</span>
              <span className="payment-detail-value">
                {project.natillera_details?.monthly_fee_amount?.toLocaleString('es-CO')} {currency}
              </span>
            </div>
            {monthlyContribution > BigInt(0) && (
              <div className="payment-detail-row">
                <span className="payment-detail-label">En USDT</span>
                <span className="payment-detail-value">{formatUsdt(monthlyContribution)} USDT</span>
              </div>
            )}
            {account && (
              <div className="payment-detail-row">
                <span className="payment-detail-label">Tu saldo</span>
                <span className={`payment-detail-value${!hasEnoughBalance ? ' payment-detail-value--error' : ''}`}>
                  {formatUsdt(usdtBalance)} USDT
                </span>
              </div>
            )}
          </div>

          {!project.contract_address && (
            <div className="payment-notice payment-notice--warning">
              Este proyecto aún no está desplegado en blockchain. El pago estará disponible una vez publicado.
            </div>
          )}

          {tokenMismatch && (
            <div className="payment-notice payment-notice--warning">
              Este proyecto fue creado con una versión anterior. Para pagar, crea un nuevo proyecto.
            </div>
          )}

          {!account && (
            <div className="payment-connect-wallet">
              <p className="payment-connect-label">Conecta tu wallet para pagar</p>
              <ConnectButton
                client={thirdwebClient}
                chain={CHAIN}
                wallets={wallets}
              />
            </div>
          )}

          {account && !hasEnoughBalance && monthlyContribution > BigInt(0) && (
            <div className="payment-notice payment-notice--error">
              Saldo insuficiente. Necesitas {formatUsdt(monthlyContribution)} USDT.
            </div>
          )}

          {/* Tarjeta - próximamente */}
          <div className="payment-method-section payment-method-section--disabled">
            <div className="payment-method-header">
              <div className="payment-method-radio">
                <div className="radio-outer" />
              </div>
              <span className="payment-method-title">Tarjeta de débito / crédito</span>
              <span className="payment-coming-soon">Próximamente</span>
            </div>
            <div className="payment-method-icons">
              <span className="payment-card-label">Visa</span>
              <span className="payment-card-label">Mastercard</span>
              <span className="payment-more">+99</span>
            </div>
          </div>

          <div className="payment-actions">
            <button
              className="payment-button secondary"
              onClick={() => history.goBack()}
              disabled={isPaying}
            >
              Regresar
            </button>
            <button
              className="payment-button primary"
              onClick={handlePay}
              // TODO: re-habilitar estas condiciones cuando el flujo de día de pago esté listo:
              // disabled={isPaying || !account || !hasEnoughBalance || !project.contract_address}
              disabled={isPaying || !account || tokenMismatch}
            >
              {payStep === 'approving'
                ? 'Aprobando USDT...'
                : payStep === 'depositing'
                  ? 'Procesando pago...'
                  : 'Pagar con cripto'}
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PaymentPage;
