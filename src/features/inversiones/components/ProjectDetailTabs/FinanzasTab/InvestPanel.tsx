import React from 'react';
import { ConnectButton } from 'thirdweb/react';
import { inAppWallet, createWallet } from 'thirdweb/wallets';
import type { Account } from 'thirdweb/wallets';
import { thirdwebClient } from '@/app/App';
import { CHAIN, BLOCKCHAIN_CONFIG, getBlockExplorerTxUrl } from '@/contracts/config';
import { blockchainService, RevenueModuleState } from '@/services/blockchain.service';
import { Project } from '@/models/projects';
import { RevenueDerived } from './tokenizationMath';
import { formatUsdcRawAsCop, formatUsdcAsCop } from '@/utils/money';

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

const fmtCop = (value: bigint) => formatUsdcRawAsCop(value);

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
          <p className="invest-balance">Entra a tu cuenta para invertir</p>
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
              Tu inversión actual: <strong>{fmtCop(userInvestment)}</strong>
            </p>
          )}
          {userUsdcBalance !== null && (
            <p className="invest-balance">
              Saldo disponible: {fmtCop(userUsdcBalance)}
              <button type="button" className="invest-max-btn" onClick={onTopupUsdc} style={maxBtnStyle}>
                Agregar dinero
              </button>
            </p>
          )}
          <p className="invest-balance">
            Cupo invertible:{' '}
            <strong>{fmtCop(maxAllowed > 0n ? maxAllowed : remaining)}</strong>
            {maxAllowed > 0n && maxAllowed < remaining && (
              <span style={{ marginLeft: 6, fontSize: 12, color: '#7a5300' }}>
                (sobran {fmtCop(remaining - maxAllowed)} menores al precio de un token)
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
              El proyecto ya está prácticamente completo. El cupo restante ({fmtCop(remaining)}) es menor
              que el precio de un token ({fmtCop(state.tokenPrice)}), por lo que no se aceptan más
              inversiones en este proyecto.
            </p>
          )}
          {!dust && (() => {
            const tokenPrice = state.tokenPrice;
            const maxTokens = tokenPrice > 0n ? maxAllowed / tokenPrice : 0n;
            let currentTokens = 0n;
            if (investAmount && tokenPrice > 0n) {
              try {
                currentTokens =
                  blockchainService.parseUnits(
                    investAmount,
                    BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS,
                  ) / tokenPrice;
              } catch {
                currentTokens = 0n;
              }
            }
            const setTokens = (n: bigint) => {
              setInvestError(null);
              if (n <= 0n) {
                setInvestAmount('');
                return;
              }
              const clamped = maxTokens > 0n && n > maxTokens ? maxTokens : n;
              setInvestAmount(fmtExact(clamped * tokenPrice));
            };
            return (
              <>
                <div className="invest-input-row">
                  <button
                    type="button"
                    className="invest-step-btn"
                    onClick={() => setTokens(currentTokens - 1n)}
                    disabled={currentTokens <= 0n}
                    aria-label="Quitar un token"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    className="invest-input"
                    placeholder="Nº de tokens"
                    value={currentTokens > 0n ? currentTokens.toString() : ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') {
                        setTokens(0n);
                        return;
                      }
                      const n = Math.floor(Number(raw));
                      if (!Number.isFinite(n) || n < 0) return;
                      setTokens(BigInt(n));
                    }}
                    min="1"
                    step="1"
                  />
                  <button
                    type="button"
                    className="invest-step-btn"
                    onClick={() => setTokens(currentTokens + 1n)}
                    disabled={maxTokens > 0n && currentTokens >= maxTokens}
                    aria-label="Agregar un token"
                  >
                    +
                  </button>
                </div>
                <p className="invest-equiv">
                  {currentTokens > 0n
                    ? `= ${formatUsdcAsCop(Number(investAmount) || 0)} · ${fmtCop(tokenPrice)} por token`
                    : `${fmtCop(tokenPrice)} por token · máximo ${maxTokens.toString()} token(s)`}
                </p>
                {investError && <p className="invest-error">{investError}</p>}
                <button
                  className="invest-btn"
                  onClick={() => onInvest(project.revenue_address!)}
                  disabled={investing || currentTokens <= 0n}
                >
                  {investing ? 'Procesando...' : 'Invertir'}
                </button>
              </>
            );
          })()}
          {investTxHash && (
            <a
              className="invest-tx-link"
              href={getBlockExplorerTxUrl(investTxHash)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver comprobante
            </a>
          )}
        </>
      )}
    </div>
  );
};
