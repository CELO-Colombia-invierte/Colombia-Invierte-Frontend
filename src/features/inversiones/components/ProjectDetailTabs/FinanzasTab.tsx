import React, { useState } from 'react';
import { ConnectButton } from 'thirdweb/react';
import { inAppWallet, createWallet } from 'thirdweb/wallets';
import { thirdwebClient } from '@/app/App';
import { CHAIN } from '@/contracts/config';
import { IonIcon } from '@ionic/react';
import {
  informationCircleOutline,
  linkOutline,
  reloadOutline,
  giftOutline,
} from 'ionicons/icons';
import { Project } from '@/models/projects';
import {
  blockchainService,
  NatilleraState,
  NatilleraV2State,
  TokenizacionState,
  RevenueModuleState,
  decodeContractRevert,
} from '@/services/blockchain.service';
import {
  BLOCKCHAIN_CONFIG,
  getBlockExplorerAddressUrl,
  getBlockExplorerTxUrl,
} from '@/contracts/config';
import { useBlockchain } from '@/hooks/use-blockchain';
import { projectsService } from '@/services/projects/projects.service';
import { buildFinancialItems } from './FinanzasTab/financialItems';
import { useChainData } from './FinanzasTab/useChainData';
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
  const {
    chainState,
    chainLoading,
    projectTokenDecimals,
    pendingRewards,
    vaultBalance,
    userInvestment,
    userUsdcBalance,
    projectCreator,
    tokenSupply,
    userTokenBalance,
    projectFunds,
    milestonesCommitted,
    loadChainState,
  } = useChainData(project, account);

  const [claiming, setClaiming] = useState(false);
  const [investAmount, setInvestAmount] = useState('');
  const [investing, setInvesting] = useState(false);
  const [investTxHash, setInvestTxHash] = useState<string | null>(null);
  const [investError, setInvestError] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [depositTxHash, setDepositTxHash] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [finalizeTxHash, setFinalizeTxHash] = useState<string | null>(null);

  const isV2 = !!(project.natillera_address || project.revenue_address);

  const handleInvest = async (revenueAddress: string) => {
    setInvestError(null);
    setInvestTxHash(null);
    let amount: bigint;
    try {
      amount = blockchainService.parseUnits(investAmount, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS);
    } catch {
      setInvestError(`Monto inválido: "${investAmount}". Usa solo números y punto decimal (ej: 3 o 3.5).`);
      return;
    }
    if (amount <= 0n) {
      setInvestError('Ingresa un monto mayor a 0');
      return;
    }
    if (chainState && project.type === 'TOKENIZATION' && isV2) {
      const s = chainState as RevenueModuleState;
      const remaining = s.fundingTarget > s.totalRaised ? s.fundingTarget - s.totalRaised : 0n;
      if (remaining === 0n) {
        setInvestError('La tokenización ya alcanzó su objetivo de financiación.');
        return;
      }
      if (amount > remaining) {
        const remainingFmt = blockchainService.formatUnitsExact(remaining, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS);
        setInvestError(`El monto excede el cupo restante. Máximo disponible: ${remainingFmt} USDC`);
        return;
      }
      if (s.tokenPrice > 0n) {
        const remainder = amount % s.tokenPrice;
        if (remainder !== 0n) {
          const snapped = amount - remainder;
          const priceFmt = blockchainService.formatUnitsExact(s.tokenPrice, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS);
          if (snapped <= 0n) {
            setInvestError(`El monto debe ser múltiplo del precio por token (${priceFmt} USDC). Mínimo a invertir: ${priceFmt} USDC.`);
            return;
          }
          const suggestedDown = blockchainService.formatUnitsExact(snapped, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS);
          const suggestedUp = blockchainService.formatUnitsExact(snapped + s.tokenPrice, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS);
          setInvestError(
            `El monto debe ser múltiplo del precio por token (${priceFmt} USDC). Usa ${suggestedDown} o ${suggestedUp} USDC.`,
          );
          return;
        }
      }
    }
    if (userUsdcBalance !== null && amount > userUsdcBalance) {
      setInvestError('Saldo USDC insuficiente.');
      return;
    }
    setInvesting(true);
    try {
      if (!project.vault_address) {
        setInvestError('El proyecto no tiene vault_address. Intenta recargar.');
        setInvesting(false);
        return;
      }
      const txHash = await investInProject(revenueAddress, amount, project.vault_address);
      setInvestTxHash(txHash);
      setInvestAmount('');
      await loadChainState();
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      const isGas = msg.includes('insufficient funds') || msg.includes('gas');
      setInvestError(isGas ? 'Sin CELO para gas. Usa faucet.celo.org/alfajores' : msg || 'Error al invertir');
    } finally {
      setInvesting(false);
    }
  };

  const handleDepositRevenue = async () => {
    if (!account || !project.revenue_address || !project.vault_address) {
      setDepositError('Faltan datos del proyecto on-chain.');
      return;
    }
    setDepositError(null);
    setDepositTxHash(null);
    let amount: bigint;
    try {
      amount = blockchainService.parseUnits(depositAmount, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS);
    } catch {
      setDepositError(`Monto inválido: "${depositAmount}". Usa solo números y punto decimal.`);
      return;
    }
    if (amount <= 0n) {
      setDepositError('El monto debe ser mayor a 0');
      return;
    }
    if (userUsdcBalance !== null && amount > userUsdcBalance) {
      setDepositError('Saldo USDC insuficiente para depositar este monto.');
      return;
    }
    setDepositing(true);
    try {
      const txHash = await blockchainService.depositRevenue(
        account,
        project.revenue_address,
        project.vault_address,
        amount,
      );
      setDepositTxHash(txHash);
      setDepositAmount('');
      await loadChainState();
    } catch (err) {
      const friendly = decodeContractRevert(err) ?? (err as Error).message ?? 'Error al depositar';
      setDepositError(friendly);
    } finally {
      setDepositing(false);
    }
  };

  const handleFinalizeSale = async () => {
    if (!account || !project.revenue_address) return;
    setFinalizeError(null);
    setFinalizeTxHash(null);
    setFinalizing(true);
    try {
      const [onChainCreator, feeMgr, state] = await Promise.all([
        blockchainService.getProjectCreator(project.revenue_address),
        blockchainService.getFeeManagerOf(project.revenue_address),
        blockchainService.getRevenueState(project.revenue_address),
      ]);
      if (onChainCreator.toLowerCase() !== account.address.toLowerCase()) {
        setFinalizeError(
          `Tu wallet (${account.address.slice(0, 6)}…${account.address.slice(-4)}) no es el creator on-chain de este proyecto (${onChainCreator.slice(0, 6)}…${onChainCreator.slice(-4)}). Conecta la wallet correcta.`,
        );
        return;
      }
      const SUCCESSFUL = 2;
      if (state !== SUCCESSFUL) {
        const saleEnd = await blockchainService.getSaleEnd(project.revenue_address);
        const endDate = new Date(Number(saleEnd) * 1000);
        const nowSec = Math.floor(Date.now() / 1000);
        const remaining = Number(saleEnd) - nowSec;
        const human =
          remaining > 0
            ? `Faltan ${Math.ceil(remaining / 60)} minuto(s) (cierra el ${endDate.toLocaleString('es-CO')})`
            : 'La venta ya cerró por tiempo. Recarga la página — el contrato debería pasar a Successful automáticamente.';
        setFinalizeError(
          `La venta aún no se puede finalizar: cupo restante es menor que el precio de un token y no se alcanzó fundingTarget exacto. ${human}`,
        );
        return;
      }
      const treasury = await blockchainService.getFeeTreasury(feeMgr);
      if (/^0x0+$/.test(treasury)) {
        setFinalizeError(
          `El FeeManager (${feeMgr}) no tiene treasury configurado. El contrato revertirá. Contacta al equipo de blockchain.`,
        );
        return;
      }
      const txHash = await blockchainService.tryFinalizeSale(account, project.revenue_address);
      setFinalizeTxHash(txHash);
      try {
        await projectsService.finalizeSale(project.id);
      } catch {}
      await loadChainState();
    } catch (err) {
      const friendly = decodeContractRevert(err);
      if (friendly && /no autorizado/i.test(friendly)) {
        const creator = await blockchainService.getProjectCreator(project.revenue_address!);
        setFinalizeError(
          `Unauthorized() del contrato. msg.sender on-chain no es el projectCreator. projectCreator=${creator}. account UI=${account.address}. Si difieren, hay account abstraction o cambiaste de wallet.`,
        );
      } else {
        setFinalizeError(friendly ?? (err as Error).message ?? 'Error al finalizar la venta');
      }
    } finally {
      setFinalizing(false);
    }
  };

  const handleTopupUsdc = () => {
    if (!account) return;
    try {
      window.navigator.clipboard?.writeText(account.address);
    } catch {
    }
    window.open('https://faucet.circle.com/', '_blank', 'noopener,noreferrer');
  };

  const handleClaimRendimientos = async () => {
    if (!project.revenue_address) return;
    setClaiming(true);
    try {
      await claimRendimientos(project.revenue_address);
      await loadChainState();
    } catch {
    } finally {
      setClaiming(false);
    }
  };

  const formatUsdc = (value: bigint): string =>
    blockchainService.formatUnits(value, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS);

  const formatTokens = (value: bigint): string => {
    if (projectTokenDecimals !== null && projectTokenDecimals > 0) {
      return blockchainService.formatUnits(value, projectTokenDecimals);
    }
    return Number(value).toLocaleString('es-CO');
  };

  const financialItems = buildFinancialItems(project);

  return (
    <div className="finanzas-tab">
      <h2 className="finanzas-title">Información financiera</h2>

      <div className="finanzas-items">
        {financialItems.map((item, index) => (
          <div key={index} className="finanzas-item">
            <div className="finanzas-icon">{item.iconComponent}</div>
            <div className="finanzas-content">
              <div className="finanzas-label-wrapper">
                <span className="finanzas-label">{item.label}</span>
                <div className="finanzas-tooltip">
                  <IonIcon icon={informationCircleOutline} />
                  <span className="tooltip-text">{item.tooltip}</span>
                </div>
              </div>
              <span className="finanzas-value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      {(project.contract_address || project.natillera_address || project.revenue_address) && (
        <div className="chain-state-section">
          <div className="chain-state-header">
            <h3 className="chain-state-title">Estado en blockchain</h3>
            <div className="chain-state-header-right">
              {project.vault_address && (
                <a
                  href={getBlockExplorerAddressUrl(project.vault_address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chain-explorer-link"
                >
                  <IonIcon icon={linkOutline} />
                  Celoscan
                </a>
              )}
              {!project.vault_address && project.contract_address && (
                <a
                  href={getBlockExplorerAddressUrl(project.contract_address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chain-explorer-link"
                >
                  <IonIcon icon={linkOutline} />
                  Celoscan
                </a>
              )}
              <button className="chain-refresh-btn" onClick={loadChainState} disabled={chainLoading}>
                <IonIcon icon={reloadOutline} className={chainLoading ? 'spinning' : ''} />
              </button>
            </div>
          </div>

          {chainLoading && !chainState && (
            <p className="chain-state-loading">Cargando datos on-chain...</p>
          )}

          {chainState && project.type === 'NATILLERA' && isV2 && (() => {
            const s = chainState as NatilleraV2State;
            return (
              <div className="chain-state-grid">
                {vaultBalance !== null && (
                  <div className="chain-stat-card">
                    <span className="chain-stat-label">Total recaudado</span>
                    <span className="chain-stat-value">{formatUsdc(vaultBalance)} USDC</span>
                  </div>
                )}
                <div className="chain-stat-card">
                  <span className="chain-stat-label">Mes actual</span>
                  <span className="chain-stat-value">
                    {Number(s.currentMonth) + 1} / {Number(s.duration)}
                  </span>
                </div>
                <div className="chain-stat-card">
                  <span className="chain-stat-label">Cuota mensual</span>
                  <span className="chain-stat-value">{formatUsdc(s.quota)} USDC</span>
                </div>
                <div className="chain-stat-card">
                  <span className="chain-stat-label">Estado</span>
                  <span className={`chain-stat-badge ${s.isMatured ? 'badge-done' : 'badge-active'}`}>
                    {s.isMatured ? 'Madurada' : 'Activa'}
                  </span>
                </div>
              </div>
            );
          })()}

          {chainState && project.type === 'NATILLERA' && !isV2 && (() => {
            const s = chainState as NatilleraState;
            const totalMonths = project.natillera_details?.duration_months ?? 0;
            return (
              <div className="chain-state-grid">
                <div className="chain-stat-card">
                  <span className="chain-stat-label">Total recaudado</span>
                  <span className="chain-stat-value">{formatUsdc(s.totalCollected)} USDC</span>
                </div>
                <div className="chain-stat-card">
                  <span className="chain-stat-label">Ciclo actual</span>
                  <span className="chain-stat-value">
                    {Number(s.currentCycle) + 1}
                    {totalMonths ? ` / ${totalMonths}` : ''}
                  </span>
                </div>
                <div className="chain-stat-card">
                  <span className="chain-stat-label">Estado</span>
                  <span className={`chain-stat-badge ${s.isFinalized ? 'badge-done' : 'badge-active'}`}>
                    {s.isFinalized ? 'Finalizada' : 'Activa'}
                  </span>
                </div>
              </div>
            );
          })()}

          {chainState && project.type === 'TOKENIZATION' && isV2 && (() => {
            const s = chainState as RevenueModuleState;
            const remaining = s.fundingTarget > s.totalRaised ? s.fundingTarget - s.totalRaised : 0n;
            const cap = userUsdcBalance !== null && userUsdcBalance < remaining ? userUsdcBalance : remaining;
            const maxAllowed = s.tokenPrice > 0n ? cap - (cap % s.tokenPrice) : cap;
            const dust = s.tokenPrice > 0n && remaining > 0n && remaining < s.tokenPrice;
            const isCreator =
              !!account && !!projectCreator && account.address.toLowerCase() === projectCreator.toLowerCase();

            const committed = milestonesCommitted ?? 0n;
            const vaultNow = vaultBalance ?? 0n;
            const treasuryFee = s.saleFinalized && projectFunds !== null && s.totalRaised > projectFunds
              ? s.totalRaised - projectFunds
              : 0n;
            const pf = projectFunds ?? 0n;
            const alreadyWithdrawn = s.saleFinalized && projectFunds !== null && pf > vaultNow
              ? pf - vaultNow
              : 0n;
            const projectFundsRemaining = pf > alreadyWithdrawn ? pf - alreadyWithdrawn : 0n;
            const disponibleHitos = projectFundsRemaining > committed ? projectFundsRemaining - committed : 0n;
            const rendimientosPool = vaultNow > projectFundsRemaining ? vaultNow - projectFundsRemaining : 0n;
            return (
              <>
                <div className="chain-state-grid">
                  <div className="chain-stat-card">
                    <span className="chain-stat-label">Total recaudado</span>
                    <span className="chain-stat-value">{formatUsdc(s.totalRaised)} USDC</span>
                  </div>
                  <div className="chain-stat-card">
                    <span className="chain-stat-label">Objetivo</span>
                    <span className="chain-stat-value">{formatUsdc(s.fundingTarget)} USDC</span>
                  </div>
                  <div className="chain-stat-card">
                    <span className="chain-stat-label">Estado</span>
                    <span className={`chain-stat-badge ${s.saleFinalized ? 'badge-done' : 'badge-active'}`}>
                      {s.saleFinalized ? 'Finalizada' : 'Activa'}
                    </span>
                  </div>
                  {s.saleFinalized && projectFunds !== null && (
                    <>
                      <div className="chain-stat-card">
                        <span className="chain-stat-label">Comisión al treasury</span>
                        <span className="chain-stat-value">{formatUsdc(treasuryFee)} USDC</span>
                      </div>
                      <div className="chain-stat-card">
                        <span className="chain-stat-label">Saldo total del vault</span>
                        <span className="chain-stat-value">{formatUsdc(vaultNow)} USDC</span>
                      </div>
                      <div className="chain-stat-card">
                        <span className="chain-stat-label">Ya retirado del vault</span>
                        <span className="chain-stat-value">{formatUsdc(alreadyWithdrawn)} USDC</span>
                      </div>
                      <div className="chain-stat-card">
                        <span className="chain-stat-label">Comprometido en hitos pendientes</span>
                        <span className="chain-stat-value">{formatUsdc(committed)} USDC</span>
                      </div>
                      <div className="chain-stat-card">
                        <span className="chain-stat-label">Disponible para hitos</span>
                        <span className="chain-stat-value">{formatUsdc(disponibleHitos)} USDC</span>
                      </div>
                      <div className="chain-stat-card">
                        <span className="chain-stat-label">Rendimientos en pool</span>
                        <span className="chain-stat-value">{formatUsdc(rendimientosPool)} USDC</span>
                      </div>
                    </>
                  )}
                </div>

                {account && pendingRewards !== null && pendingRewards > 0n && (
                  <div className="chain-rewards-section">
                    <div className="chain-rewards-info">
                      <IonIcon icon={giftOutline} />
                      <span>
                        Rendimientos disponibles: <strong>{formatUsdc(pendingRewards)} USDC</strong>
                      </span>
                    </div>
                    <button className="chain-rewards-btn" onClick={handleClaimRendimientos} disabled={claiming}>
                      {claiming ? 'Cobrando...' : 'Cobrar rendimientos'}
                    </button>
                  </div>
                )}

                {account && s.saleFinalized && userTokenBalance !== null && userTokenBalance > 0n && tokenSupply !== null && tokenSupply > 0n && (
                  (() => {
                    const sharePctNum = Number((userTokenBalance * 10000n) / tokenSupply) / 100;
                    const shareOfPool = (userTokenBalance * rendimientosPool) / tokenSupply;
                    const userInv = userInvestment ?? 0n;
                    const rewards = pendingRewards ?? 0n;
                    const expectedAnnual = Number(project.tokenization_details?.expected_annual_return_pct ?? 0) || 0;
                    const realRoiPct = userInv > 0n
                      ? Number((rewards * 10000n) / userInv) / 100
                      : 0;
                    const fulfillmentPct = expectedAnnual > 0
                      ? (realRoiPct / expectedAnnual) * 100
                      : 0;
                    return (
                      <div className="rev-distribution-info">
                        <h4 className="rev-distribution-title">Tu posición en el proyecto</h4>
                        <div className="rev-distribution-grid">
                          <div className="rev-stat">
                            <span className="rev-stat-label">Tu inversión</span>
                            <span className="rev-stat-value">{formatUsdc(userInv)} USDC</span>
                          </div>
                          <div className="rev-stat">
                            <span className="rev-stat-label">Tus tokens</span>
                            <span className="rev-stat-value">
                              {userTokenBalance.toString()} de {tokenSupply.toString()} ({sharePctNum.toFixed(2)}%)
                            </span>
                          </div>
                          <div className="rev-stat">
                            <span className="rev-stat-label">Pool total de rendimientos</span>
                            <span className="rev-stat-value">{formatUsdc(rendimientosPool)} USDC</span>
                          </div>
                          <div className="rev-stat">
                            <span className="rev-stat-label">Tu parte del pool</span>
                            <span className="rev-stat-value">≈ {formatUsdc(shareOfPool)} USDC</span>
                          </div>
                          <div className="rev-stat">
                            <span className="rev-stat-label">Por cobrar ahora</span>
                            <span className="rev-stat-value">{formatUsdc(rewards)} USDC</span>
                          </div>
                          <div className="rev-stat">
                            <span className="rev-stat-label">Esperado anual (promesa)</span>
                            <span className="rev-stat-value">{expectedAnnual.toFixed(2)}%</span>
                          </div>
                          <div className="rev-stat">
                            <span className="rev-stat-label">Real acumulado</span>
                            <span className="rev-stat-value">{realRoiPct.toFixed(2)}%</span>
                          </div>
                          <div className="rev-stat">
                            <span className="rev-stat-label">Cumplimiento</span>
                            <span
                              className="rev-stat-value"
                              style={{
                                color:
                                  fulfillmentPct >= 100
                                    ? '#059669'
                                    : fulfillmentPct >= 50
                                    ? '#d97706'
                                    : '#dc2626',
                              }}
                            >
                              {expectedAnnual > 0 ? `${fulfillmentPct.toFixed(0)}%` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}

                {isCreator && !s.saleFinalized && (
                  <div className="rev-deposit-panel">
                    <h4 className="rev-deposit-title">Finalizar venta</h4>
                    <p className="rev-deposit-help">
                      Cierra la venta y cobra el 30% de comisión al treasury. El neto queda retenido en el vault
                      y se libera por hitos aprobados en gobernanza. No envía fondos a ninguna otra wallet.
                    </p>
                    {finalizeError && <p className="invest-error">{finalizeError}</p>}
                    <button
                      className="invest-btn"
                      onClick={handleFinalizeSale}
                      disabled={finalizing}
                    >
                      {finalizing ? 'Finalizando...' : 'Finalizar venta y cobrar comisión'}
                    </button>
                    {finalizeTxHash && (
                      <a
                        className="invest-tx-link"
                        href={getBlockExplorerTxUrl(finalizeTxHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver transacción en Celoscan
                      </a>
                    )}
                  </div>
                )}

                {isCreator && s.saleFinalized && (
                  <div className="rev-deposit-panel">
                    <h4 className="rev-deposit-title">Depositar rendimientos</h4>
                    {s.distributionEnd > 0n && BigInt(Math.floor(Date.now() / 1000)) > s.distributionEnd ? (
                      <p className="rev-deposit-closed">
                        🔒 La ventana de distribución ya cerró ({new Date(Number(s.distributionEnd) * 1000).toLocaleDateString('es-CO')}). Ya no se aceptan más depósitos.
                      </p>
                    ) : (
                      <>
                        <p className="rev-deposit-help">
                          El monto que deposites se reparte proporcionalmente entre los token holders. Quedan{' '}
                          {tokenSupply ? tokenSupply.toString() : '?'} tokens emitidos.
                        </p>
                        {userUsdcBalance !== null && (
                          <p className="invest-balance">Tu saldo USDC: {formatUsdc(userUsdcBalance)} USDC</p>
                        )}
                        <div className="invest-input-row">
                          <input
                            type="number"
                            className="invest-input"
                            placeholder="Monto a depositar (USDC)"
                            value={depositAmount}
                            onChange={(e) => {
                              setDepositAmount(e.target.value);
                              setDepositError(null);
                            }}
                            min="0"
                            step="any"
                          />
                        </div>
                        {depositError && <p className="invest-error">{depositError}</p>}
                        <button
                          className="invest-btn"
                          onClick={handleDepositRevenue}
                          disabled={depositing || !depositAmount || parseFloat(depositAmount) <= 0}
                        >
                          {depositing ? 'Depositando...' : 'Depositar rendimientos'}
                        </button>
                        {depositTxHash && (
                          <a
                            className="invest-tx-link"
                            href={getBlockExplorerTxUrl(depositTxHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Ver transacción en Celoscan
                          </a>
                        )}
                      </>
                    )}
                  </div>
                )}

                {!s.saleFinalized && project.vault_address && (
                  <div className="invest-section">
                    <h4 className="invest-title">Invertir en este proyecto</h4>
                    {!account ? (
                      <>
                        <p className="invest-balance">Conecta tu wallet para invertir</p>
                        <ConnectButton
                          client={thirdwebClient}
                          chain={CHAIN}
                          locale="es_ES"
                          wallets={[
                            inAppWallet({ auth: { options: ['email', 'google', 'apple'] } }),
                            createWallet('io.metamask'),
                          ]}
                          connectButton={{
                            style: {
                              width: '100%',
                              borderRadius: '12px',
                              height: '48px',
                              fontSize: '15px',
                              fontWeight: '600',
                            },
                          }}
                        />
                      </>
                    ) : (
                      <>
                        {userInvestment !== null && userInvestment > 0n && (
                          <p className="invest-current">
                            Tu inversión actual: <strong>{formatUsdc(userInvestment)} USDC</strong>
                          </p>
                        )}
                        {userUsdcBalance !== null && (
                          <p className="invest-balance">
                            Balance disponible: {formatUsdc(userUsdcBalance)} USDC
                            <button
                              type="button"
                              className="invest-max-btn"
                              onClick={handleTopupUsdc}
                              style={{
                                marginLeft: 8,
                                padding: '2px 10px',
                                fontSize: 12,
                                borderRadius: 8,
                                border: '1px solid #4F6BFF',
                                background: 'transparent',
                                color: '#4F6BFF',
                                cursor: 'pointer',
                              }}
                            >
                              Recargar USDC
                            </button>
                          </p>
                        )}
                        <p className="invest-balance">
                          Cupo invertible:{' '}
                          <strong>
                            {blockchainService.formatUnitsExact(maxAllowed > 0n ? maxAllowed : remaining, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS)} USDC
                          </strong>
                          {maxAllowed > 0n && maxAllowed < remaining && (
                            <span style={{ marginLeft: 6, fontSize: 12, color: '#7a5300' }}>
                              (sobran {blockchainService.formatUnitsExact(remaining - maxAllowed, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS)} USDC menores al precio de un token)
                            </span>
                          )}
                          {maxAllowed > 0n && !dust && (
                            <button
                              type="button"
                              className="invest-max-btn"
                              onClick={() => {
                                setInvestAmount(
                                  blockchainService.formatUnitsExact(maxAllowed, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS),
                                );
                                setInvestError(null);
                              }}
                              style={{
                                marginLeft: 8,
                                padding: '2px 10px',
                                fontSize: 12,
                                borderRadius: 8,
                                border: '1px solid #4F6BFF',
                                background: 'transparent',
                                color: '#4F6BFF',
                                cursor: 'pointer',
                              }}
                            >
                              Máximo
                            </button>
                          )}
                        </p>
                        {dust && (
                          <p
                            style={{
                              background: '#fff8e6',
                              border: '1px solid #f5c451',
                              borderRadius: 8,
                              padding: 10,
                              color: '#7a5300',
                              fontSize: 13,
                              marginTop: 8,
                            }}
                          >
                            La tokenización ya está prácticamente completa. El cupo restante (
                            {blockchainService.formatUnitsExact(remaining, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS)}{' '}
                            USDC) es menor que el precio de un token (
                            {blockchainService.formatUnitsExact(s.tokenPrice, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS)}{' '}
                            USDC), por lo que no se aceptan más inversiones en este proyecto.
                          </p>
                        )}
                        {!dust && (
                          <>
                            <div className="invest-input-row">
                              <input
                                type="number"
                                className="invest-input"
                                placeholder="Monto en USDC"
                                value={investAmount}
                                onChange={(e) => {
                                  setInvestAmount(e.target.value);
                                  setInvestError(null);
                                }}
                                min="0"
                                step="any"
                              />
                              {investAmount && s.tokenPrice > 0n && (() => {
                                try {
                                  const amt = blockchainService.parseUnits(
                                    investAmount,
                                    BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS,
                                  );
                                  const tokens = amt / s.tokenPrice;
                                  const exceeds = amt > remaining;
                                  return (
                                    <span
                                      className="invest-tokens-preview"
                                      style={exceeds ? { color: '#c0392b' } : undefined}
                                    >
                                      {exceeds ? '⚠ excede cupo' : `≈ ${Number(tokens).toLocaleString('es-CO')} tokens`}
                                    </span>
                                  );
                                } catch {
                                  return null;
                                }
                              })()}
                            </div>
                            {investError && <p className="invest-error">{investError}</p>}
                            <button
                              className="invest-btn"
                              onClick={() => handleInvest(project.revenue_address!)}
                              disabled={investing || !investAmount || parseFloat(investAmount) <= 0}
                            >
                              {investing ? 'Procesando...' : 'Invertir'}
                            </button>
                          </>
                        )}
                        {investTxHash && (
                          <a
                            className="invest-tx-link"
                            href={getBlockExplorerTxUrl(investTxHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Ver transacción en Celoscan
                          </a>
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            );
          })()}

          {chainState && project.type === 'TOKENIZATION' && !isV2 && (() => {
            const s = chainState as TokenizacionState;
            return (
              <div className="chain-state-grid">
                <div className="chain-stat-card">
                  <span className="chain-stat-label">Fondos recaudados</span>
                  <span className="chain-stat-value">{formatUsdc(s.fundsCollected)} USDC</span>
                </div>
                <div className="chain-stat-card">
                  <span className="chain-stat-label">Tokens vendidos</span>
                  <span className="chain-stat-value">{formatTokens(s.tokensSold)}</span>
                </div>
                <div className="chain-stat-card">
                  <span className="chain-stat-label">Estado venta</span>
                  <span
                    className={`chain-stat-badge ${
                      s.isSaleActive ? 'badge-active' : s.saleFinalized ? 'badge-done' : 'badge-pending'
                    }`}
                  >
                    {s.isSaleActive ? 'Activa' : s.saleFinalized ? 'Finalizada' : 'No iniciada'}
                  </span>
                </div>
              </div>
            );
          })()}
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
