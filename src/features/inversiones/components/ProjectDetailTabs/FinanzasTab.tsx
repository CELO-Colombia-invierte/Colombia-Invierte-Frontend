import React, { useEffect, useState } from 'react';
import { ConnectButton } from 'thirdweb/react';
import { inAppWallet, createWallet } from 'thirdweb/wallets';
import { thirdwebClient } from '@/app/App';
import { CHAIN } from '@/contracts/config';
import { IonIcon } from '@ionic/react';
import {
  cashOutline,
  trendingUpOutline,
  flameOutline,
  calendarOutline,
  informationCircleOutline,
  linkOutline,
  reloadOutline,
  giftOutline,
} from 'ionicons/icons';
import { Project } from '@/models/projects';
import { blockchainService, NatilleraState, NatilleraV2State, TokenizacionState, RevenueModuleState } from '@/services/blockchain.service';
import { BLOCKCHAIN_CONFIG, getBlockExplorerAddressUrl, getBlockExplorerTxUrl } from '@/contracts/config';
import { useBlockchain } from '@/hooks/use-blockchain';
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
  const [chainState, setChainState] = useState<NatilleraState | NatilleraV2State | TokenizacionState | RevenueModuleState | null>(null);
  const [chainLoading, setChainLoading] = useState(false);
  const [projectTokenDecimals, setProjectTokenDecimals] = useState<number | null>(null);
  const [pendingRewards, setPendingRewards] = useState<bigint | null>(null);
  const [vaultBalance, setVaultBalance] = useState<bigint | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [userInvestment, setUserInvestment] = useState<bigint | null>(null);
  const [userUsdcBalance, setUserUsdcBalance] = useState<bigint | null>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [investing, setInvesting] = useState(false);
  const [investTxHash, setInvestTxHash] = useState<string | null>(null);
  const [investError, setInvestError] = useState<string | null>(null);

  const isV2 = !!(project.natillera_address || project.revenue_address);

  const loadChainState = async () => {
    const hasV2 = project.natillera_address || project.revenue_address;
    const hasV1 = project.contract_address;
    if (!hasV2 && !hasV1) return;
    setChainLoading(true);
    try {
      if (project.natillera_address) {
        const state = await blockchainService.getNatilleraV2State(project.natillera_address);
        setChainState(state);
        if (project.vault_address) {
          const balance = await blockchainService.getTokenBalance(BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS, project.vault_address);
          setVaultBalance(balance);
        }
      } else if (project.revenue_address) {
        const state = await blockchainService.getRevenueModuleState(project.revenue_address);
        setChainState(state);
        if (account?.address) {
          const [rewards, investment, usdcBal] = await Promise.all([
            blockchainService.getPendingRewards(project.revenue_address, account.address),
            blockchainService.getInvestment(project.revenue_address, account.address),
            blockchainService.getTokenBalance(BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS, account.address),
          ]);
          setPendingRewards(rewards);
          setUserInvestment(investment);
          setUserUsdcBalance(usdcBal);
        }
      } else if (project.contract_address) {
        if (project.type === 'NATILLERA') {
          const state = await blockchainService.getNatilleraState(project.contract_address);
          setChainState(state);
        } else {
          const state = await blockchainService.getTokenizacionState(project.contract_address);
          setChainState(state);
          if (state.projectTokenAddress) {
            const decimals = await blockchainService.getTokenDecimals(state.projectTokenAddress);
            setProjectTokenDecimals(decimals);
          }
        }
      }
    } catch {
      // silenciar
    } finally {
      setChainLoading(false);
    }
  };

  const handleInvest = async (revenueAddress: string) => {
    setInvestError(null);
    setInvestTxHash(null);
    let amount: bigint;
    try {
      amount = blockchainService.parseUnits(investAmount, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS);
    } catch {
      setInvestError('Monto inválido');
      return;
    }
    if (amount <= 0n) { setInvestError('Ingresa un monto mayor a 0'); return; }
    setInvesting(true);
    try {
      const txHash = await investInProject(revenueAddress, amount);
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

  const handleClaimRendimientos = async () => {
    if (!project.revenue_address) return;
    setClaiming(true);
    try {
      await claimRendimientos(project.revenue_address);
      await loadChainState();
    } catch {
      // silenciar
    } finally {
      setClaiming(false);
    }
  };

  useEffect(() => {
    loadChainState();
  }, [project.contract_address, project.natillera_address, project.revenue_address, account?.address]);

  const formatUsdc = (value: bigint): string =>
    blockchainService.formatUnits(value, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS);

  const formatTokens = (value: bigint): string => {
    if (projectTokenDecimals !== null && projectTokenDecimals > 0) {
      return blockchainService.formatUnits(value, projectTokenDecimals);
    }
    return Number(value).toLocaleString('es-CO');
  };

  const formatCurrency = (amount: number): string => {
    return Number(amount).toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isNatillera = project.type === 'NATILLERA';
  const financialItems = [];

  if (isNatillera && project.natillera_details) {
    const details = project.natillera_details;

    financialItems.push({
      icon: cashOutline,
      label: 'Valor de la cuota mensual',
      value: `${formatCurrency(details.monthly_fee_amount)} ${details.monthly_fee_currency}`,
      tooltip: 'Cantidad que debes aportar cada mes',
      iconColor: '#10B981',
    });

    financialItems.push({
      icon: trendingUpOutline,
      label: 'Rendimiento anual esperado',
      value: `${details.expected_annual_return_pct}%`,
      tooltip: 'Porcentaje de retorno estimado al año',
      iconColor: '#667eea',
    });

    financialItems.push({
      icon: flameOutline,
      label: 'Cantidad de meses',
      value: `${details.duration_months} Meses`,
      tooltip: 'Duración total del proyecto de ahorro',
      iconColor: '#F59E0B',
    });

    financialItems.push({
      icon: calendarOutline,
      label: 'Fecha máxima de pago mensual',
      value: formatDate(details.payment_deadline_at),
      tooltip: 'Fecha límite para realizar el pago mensual',
      iconColor: '#8B5CF6',
    });
  } else if (project.tokenization_details) {
    const details = project.tokenization_details;

    financialItems.push({
      icon: cashOutline,
      label: 'Valor del Activo',
      value: `${formatCurrency(details.asset_value_amount)} ${details.asset_value_currency}`,
      tooltip: 'Valor total del activo tokenizado',
      iconColor: '#10B981',
    });

    financialItems.push({
      icon: trendingUpOutline,
      label: 'Rendimiento Esperado',
      value: `${details.expected_annual_return_pct}%`,
      tooltip: 'Porcentaje de retorno estimado',
      iconColor: '#667eea',
    });

    financialItems.push({
      icon: cashOutline,
      label: 'Precio por Token',
      value: `${formatCurrency(details.price_per_token_amount)} ${details.price_per_token_currency}`,
      tooltip: 'Costo de cada token individual',
      iconColor: '#8B5CF6',
    });

    financialItems.push({
      icon: flameOutline,
      label: 'Total de Tokens',
      value: formatCurrency(details.total_tokens),
      tooltip: 'Cantidad total de tokens disponibles',
      iconColor: '#F59E0B',
    });

    if (details.presale_enabled && details.presale_starts_at) {
      financialItems.push({
        icon: calendarOutline,
        label: 'Inicio de Preventa',
        value: formatDate(details.presale_starts_at),
        tooltip: 'Fecha de inicio de la preventa',
        iconColor: '#06B6D4',
      });
    }

    if (details.public_sale_starts_at) {
      financialItems.push({
        icon: calendarOutline,
        label: 'Venta Pública',
        value: formatDate(details.public_sale_starts_at),
        tooltip: 'Fecha de inicio de la venta pública',
        iconColor: '#8B5CF6',
      });
    }
  }

  return (
    <div className="finanzas-tab">
      <h2 className="finanzas-title">Información financiera</h2>

      <div className="finanzas-items">
        {financialItems.map((item, index) => (
          <div key={index} className="finanzas-item">
            <div className="finanzas-icon" style={{ color: item.iconColor }}>
              <IonIcon icon={item.icon} />
            </div>
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
              <button
                className="chain-refresh-btn"
                onClick={loadChainState}
                disabled={chainLoading}
              >
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
                  <span className="chain-stat-label">Miembros</span>
                  <span className="chain-stat-value">{Number(s.memberCount)}</span>
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
            const maxMembers = project.natillera_details?.max_participants ?? 0;
            return (
              <div className="chain-state-grid">
                <div className="chain-stat-card">
                  <span className="chain-stat-label">Total recaudado</span>
                  <span className="chain-stat-value">{formatUsdc(s.totalCollected)} USDC</span>
                </div>
                <div className="chain-stat-card">
                  <span className="chain-stat-label">Ciclo actual</span>
                  <span className="chain-stat-value">
                    {Number(s.currentCycle) + 1}{totalMonths ? ` / ${totalMonths}` : ''}
                  </span>
                </div>
                <div className="chain-stat-card">
                  <span className="chain-stat-label">Miembros</span>
                  <span className="chain-stat-value">
                    {s.memberCount}{maxMembers ? ` / ${maxMembers}` : ''}
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
                </div>
                {account && pendingRewards !== null && pendingRewards > 0n && (
                  <div className="chain-rewards-section">
                    <div className="chain-rewards-info">
                      <IonIcon icon={giftOutline} />
                      <span>Rendimientos disponibles: <strong>{formatUsdc(pendingRewards)} USDC</strong></span>
                    </div>
                    <button
                      className="chain-rewards-btn"
                      onClick={handleClaimRendimientos}
                      disabled={claiming}
                    >
                      {claiming ? 'Cobrando...' : 'Cobrar rendimientos'}
                    </button>
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
                          wallets={[inAppWallet({ auth: { options: ['email', 'google', 'apple'] } }), createWallet('io.metamask')]}
                          connectButton={{ style: { width: '100%', borderRadius: '12px', height: '48px', fontSize: '15px', fontWeight: '600' } }}
                        />
                      </>
                    ) : (
                      <>
                        {userInvestment !== null && userInvestment > 0n && (
                          <p className="invest-current">Tu inversión actual: <strong>{formatUsdc(userInvestment)} USDC</strong></p>
                        )}
                        {userUsdcBalance !== null && (
                          <p className="invest-balance">Balance disponible: {formatUsdc(userUsdcBalance)} USDC</p>
                        )}
                        <div className="invest-input-row">
                          <input
                            type="number"
                            className="invest-input"
                            placeholder="Monto en USDC"
                            value={investAmount}
                            onChange={(e) => { setInvestAmount(e.target.value); setInvestError(null); }}
                            min="0"
                            step="any"
                          />
                          {investAmount && s.tokenPrice > 0n && (() => {
                            try {
                              const amt = blockchainService.parseUnits(investAmount, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS);
                              const tokens = amt / s.tokenPrice;
                              return <span className="invest-tokens-preview">≈ {Number(tokens).toLocaleString('es-CO')} tokens</span>;
                            } catch { return null; }
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
                        {investTxHash && (
                          <a className="invest-tx-link" href={getBlockExplorerTxUrl(investTxHash)} target="_blank" rel="noopener noreferrer">
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
                  <span className={`chain-stat-badge ${s.isSaleActive ? 'badge-active' : s.saleFinalized ? 'badge-done' : 'badge-pending'}`}>
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
          <button
            className="action-button secondary"
            onClick={() => window.history.back()}
          >
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
