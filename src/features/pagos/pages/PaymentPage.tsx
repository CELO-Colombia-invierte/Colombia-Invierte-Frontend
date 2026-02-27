import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonIcon, useIonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { arrowBackOutline, checkmarkCircleOutline, openOutline } from 'ionicons/icons';
import { ConnectButton } from 'thirdweb/react';
import { inAppWallet, createWallet } from 'thirdweb/wallets';
import { thirdwebClient } from '@/app/App';
import { projectsService } from '@/services/projects';
import { apiService } from '@/services/api/api.service';
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
  const { account, approveToken, depositToNatillera, payQuota, joinNatilleraOnChain } = useBlockchain();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [usdtBalance, setUsdtBalance] = useState<bigint>(BigInt(0));
  const [celoBalance, setCeloBalance] = useState<bigint>(BigInt(0));
  const [monthlyContribution, setMonthlyContribution] = useState<bigint>(BigInt(0));
  const [contractPaymentToken, setContractPaymentToken] = useState<string>(BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS);
  const [tokenMismatch, setTokenMismatch] = useState(false);
  const [currentMonthId, setCurrentMonthId] = useState<bigint>(BigInt(0));
  const [contractLoaded, setContractLoaded] = useState(false);
  const [payStep, setPayStep] = useState<PayStep>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [fundingUsdc, setFundingUsdc] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (account?.address) {
      loadUsdtBalance(contractPaymentToken);
      loadCeloBalance(account.address);
    }
  }, [account, contractPaymentToken]);

  useEffect(() => {
    if (!project) return;
    if (project.natillera_address) {
      loadV2ContractConfig(project.natillera_address);
    } else if (project.contract_address) {
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

  const loadCeloBalance = async (address: string) => {
    try {
      const balance = await blockchainService.getNativeBalance(address);
      setCeloBalance(balance);
    } catch {
      // silenciar
    }
  };

  const loadV2ContractConfig = async (natilleraAddress: string) => {
    try {
      const state = await blockchainService.getNatilleraV2State(natilleraAddress);
      setMonthlyContribution(state.quota);
      setCurrentMonthId(state.currentMonth);
    } catch {
      // silenciar
    } finally {
      setContractLoaded(true);
    }
  };

  const loadContractConfig = async () => {
    if (!project?.contract_address) return;
    try {
      const config = await blockchainService.getNatilleraConfig(project.contract_address);
      setMonthlyContribution(config.monthlyContribution);
      if (config.paymentToken && config.paymentToken !== '0x0000000000000000000000000000000000000000') {
        setContractPaymentToken(config.paymentToken);
        const normalizedContract = config.paymentToken.toLowerCase();
        const normalizedExpected = BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS.toLowerCase();
        setTokenMismatch(normalizedContract !== normalizedExpected);
      }
    } catch {
      // silenciar
    } finally {
      setContractLoaded(true);
    }
  };

  const handleDevFundUsdc = async () => {
    setFundingUsdc(true);
    try {
      await apiService.post('/me/dev/fund-usdc');
      await present({ message: '10 USDC y 0.01 CELO enviados a tu wallet. Recarga la página en unos segundos.', duration: 4000, color: 'success' });
      if (account?.address) {
        setTimeout(() => {
          loadUsdtBalance(contractPaymentToken);
          loadCeloBalance(account.address);
        }, 3000);
      }
    } catch (err) {
      const msg = (err as any)?.message ?? 'Error al enviar USDC';
      await present({ message: msg, duration: 4000, color: 'danger' });
    } finally {
      setFundingUsdc(false);
    }
  };

  const handlePay = async () => {
    if (!account) {
      await present({ message: 'Wallet no conectada', duration: 2000, color: 'warning' });
      return;
    }
    const isV2 = !!project?.natillera_address;
    if (!isV2 && !project?.contract_address) {
      await present({ message: 'Proyecto no desplegado en blockchain', duration: 2000, color: 'warning' });
      return;
    }

    try {
      if (isV2) {
        const natilleraAddress = project!.natillera_address!;
        const vaultAddress = project!.vault_address!;

        // Asegurar registro on-chain antes de pagar (idempotente: ignora AlreadyJoined)
        try {
          await joinNatilleraOnChain(natilleraAddress);
        } catch {
          // Ya estaba unido o no aplica — continuar
        }

        const allowance = await blockchainService.getTokenAllowance(
          BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS,
          account.address,
          vaultAddress,
        );
        if (allowance < monthlyContribution) {
          setPayStep('approving');
          await approveToken(BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS, vaultAddress, monthlyContribution);
        }

        setPayStep('depositing');
        const hash = await payQuota(natilleraAddress, vaultAddress, currentMonthId, monthlyContribution);
        setTxHash(hash);
        setPayStep('done');
      } else {
        const contractAddress = project!.contract_address!;

        const allowance = await blockchainService.getTokenAllowance(
          contractPaymentToken,
          account.address,
          contractAddress,
        );
        if (allowance < monthlyContribution) {
          setPayStep('approving');
          await approveToken(contractPaymentToken, contractAddress, monthlyContribution);
        }

        setPayStep('depositing');
        const hash = await depositToNatillera(contractAddress);
        setTxHash(hash);
        setPayStep('done');
      }
    } catch (err) {
      setPayStep('idle');
      let msg = (err as any)?.message ?? 'Error al procesar el pago';
      if (msg.includes('insufficient funds for gas') || msg.includes('error_forwarding_sequencer')) {
        msg = 'Sin CELO para gas. Obtén CELO de prueba en faucet.celo.org/sepolia';
      } else if (msg.includes('NotMember') || msg.includes('0x291fc442')) {
        msg = 'Tu wallet no está registrada en este proyecto. Ve a "Resumen" y únete primero.';
      } else if (msg.includes('AlreadyPaid') || msg.includes('0xd70a0e30') || msg.includes('AlreadyDeposited')) {
        msg = 'Ya realizaste el pago de este ciclo. El próximo pago estará disponible el siguiente mes.';
      }
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
  const hasEnoughBalance = contractLoaded && usdtBalance >= monthlyContribution && monthlyContribution > BigInt(0);
  const MIN_CELO_FOR_GAS = BigInt('3000000000000000'); // 0.003 CELO mínimo para gas
  const hasEnoughGas = celoBalance >= MIN_CELO_FOR_GAS;
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

          {!project.contract_address && !project.natillera_address && (
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

          {account && (!hasEnoughBalance || !hasEnoughGas) && monthlyContribution > BigInt(0) && (
            <div className="payment-connect-wallet">
              <p className="payment-connect-label">
                {!hasEnoughBalance
                  ? `Saldo insuficiente. Necesitas ${formatUsdt(monthlyContribution)} USDT. Agrega fondos a tu wallet:`
                  : 'Sin CELO para gas. Obtén fondos de prueba:'}
              </p>
              {!hasEnoughBalance && (
                <ConnectButton
                  client={thirdwebClient}
                  chain={CHAIN}
                  wallets={wallets}
                />
              )}
              <button
                className="payment-button secondary"
                onClick={handleDevFundUsdc}
                disabled={fundingUsdc}
                style={{ marginTop: '8px', width: '100%' }}
              >
                {fundingUsdc ? 'Enviando fondos...' : 'Obtener 10 USDC + gas de prueba'}
              </button>
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
              disabled={isPaying || !account || !hasEnoughBalance || !hasEnoughGas || (!project.contract_address && !project.natillera_address) || tokenMismatch}
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
