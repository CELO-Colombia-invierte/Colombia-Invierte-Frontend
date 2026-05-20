import React from 'react';
import { ConnectButton } from 'thirdweb/react';
import { inAppWallet, createWallet } from 'thirdweb/wallets';
import type { Account } from 'thirdweb/wallets';
import { thirdwebClient } from '@/app/App';
import { CHAIN, BLOCKCHAIN_CONFIG, getBlockExplorerTxUrl } from '@/contracts/config';
import { blockchainService, RevenueModuleState } from '@/services/blockchain.service';
import { Project } from '@/models/projects';
import { formatUsdc } from './formatters';
import { RevenueDerived } from './tokenizationMath';

interface InvestPanelProps {
  account: Account | undefined;
  project: Project;
  state: RevenueModuleState;
  derived: RevenueDerived;
  userInvestment: bigint | null;
  userUsdcBalance: bigint | null;
  investAmount: string;
  investing: boolean;
  investTxHash: string | null;
  investError: string | null;
  setInvestAmount: (value: string) => void;
  setInvestError: (value: string | null) => void;
  onInvest: (revenueAddress: string) => void;
  onTopupUsdc: () => void;
}

const fmtExact = (value: bigint) =>
  blockchainService.formatUnitsExact(value, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS);

const maxBtnStyle: React.CSSProperties = {
  marginLeft: 8,
  padding: '2px 10px',
  fontSize: 12,
  borderRadius: 8,
  border: '1px solid #4F6BFF',
  background: 'transparent',
  color: '#4F6BFF',
  cursor: 'pointer',
};

export const InvestPanel: React.FC<InvestPanelProps> = ({
  account,
  project,
  state,
  derived,
  userInvestment,
  userUsdcBalance,
  investAmount,
  investing,
  investTxHash,
  investError,
  setInvestAmount,
  setInvestError,
  onInvest,
  onTopupUsdc,
}) => {
  const { remaining, maxAllowed, dust } = derived;
  return (
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
              <button type="button" className="invest-max-btn" onClick={onTopupUsdc} style={maxBtnStyle}>
                Recargar USDC
              </button>
            </p>
          )}
          <p className="invest-balance">
            Cupo invertible:{' '}
            <strong>{fmtExact(maxAllowed > 0n ? maxAllowed : remaining)} USDC</strong>
            {maxAllowed > 0n && maxAllowed < remaining && (
              <span style={{ marginLeft: 6, fontSize: 12, color: '#7a5300' }}>
                (sobran {fmtExact(remaining - maxAllowed)} USDC menores al precio de un token)
              </span>
            )}
            {maxAllowed > 0n && !dust && (
              <button
                type="button"
                className="invest-max-btn"
                onClick={() => {
                  setInvestAmount(fmtExact(maxAllowed));
                  setInvestError(null);
                }}
                style={maxBtnStyle}
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
              La tokenización ya está prácticamente completa. El cupo restante ({fmtExact(remaining)}{' '}
              USDC) es menor que el precio de un token ({fmtExact(state.tokenPrice)}{' '}
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
                {investAmount && state.tokenPrice > 0n && (() => {
                  try {
                    const amt = blockchainService.parseUnits(
                      investAmount,
                      BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS,
                    );
                    const tokens = amt / state.tokenPrice;
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
                onClick={() => onInvest(project.revenue_address!)}
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
  );
};
