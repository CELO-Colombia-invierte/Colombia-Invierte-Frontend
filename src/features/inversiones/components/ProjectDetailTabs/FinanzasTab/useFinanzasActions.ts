import { useState } from 'react';
import type { Account } from 'thirdweb/wallets';
import { Project } from '@/models/projects';
import {
  blockchainService,
  RevenueModuleState,
  decodeContractRevert,
} from '@/services/blockchain.service';
import { BLOCKCHAIN_CONFIG } from '@/contracts/config';
import { projectsService } from '@/services/projects/projects.service';
import { formatUsdcRawAsCop, copToUsdcRaw } from '@/utils/money';

interface UseFinanzasActionsParams {
  project: Project;
  isV2: boolean;
  account: Account | undefined;
  chainState: unknown;
  userUsdcBalance: bigint | null;
  loadChainState: () => Promise<void> | void;
  claimRendimientos: (revenueAddress: string) => Promise<unknown>;
  investInProject: (revenueAddress: string, amount: bigint, vaultAddress: string) => Promise<string>;
}

export function useFinanzasActions({
  project,
  isV2,
  account,
  chainState,
  userUsdcBalance,
  loadChainState,
  claimRendimientos,
  investInProject,
}: UseFinanzasActionsParams) {
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

  const handleInvest = async (revenueAddress: string) => {
    setInvestError(null);
    setInvestTxHash(null);
    let amount: bigint;
    try {
      amount = blockchainService.parseUnits(investAmount, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS);
    } catch {
      setInvestError('Monto inválido. Usa solo números.');
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
        setInvestError('Este proyecto ya alcanzó su meta de inversión.');
        return;
      }
      if (amount > remaining) {
        setInvestError(`El monto supera el cupo restante. Máximo disponible: ${formatUsdcRawAsCop(remaining)}`);
        return;
      }
      if (s.tokenPrice > 0n) {
        const remainder = amount % s.tokenPrice;
        if (remainder !== 0n) {
          const snapped = amount - remainder;
          const priceCop = formatUsdcRawAsCop(s.tokenPrice);
          if (snapped <= 0n) {
            setInvestError(`El monto debe ser un múltiplo del precio por token (${priceCop}). Mínimo a invertir: ${priceCop}.`);
            return;
          }
          setInvestError(
            `El monto debe ser un múltiplo del precio por token (${priceCop}). Usa ${formatUsdcRawAsCop(snapped)} o ${formatUsdcRawAsCop(snapped + s.tokenPrice)}.`,
          );
          return;
        }
      }
    }
    if (userUsdcBalance !== null && amount > userUsdcBalance) {
      setInvestError('Saldo insuficiente.');
      return;
    }
    setInvesting(true);
    try {
      if (!project.vault_address) {
        setInvestError('Faltan datos del proyecto. Intenta recargar.');
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
      setInvestError(isGas ? 'No se pudo completar la inversión. Intenta de nuevo en unos minutos.' : decodeContractRevert(err) ?? 'No se pudo completar la inversión.');
    } finally {
      setInvesting(false);
    }
  };

  const handleDepositRevenue = async () => {
    if (!account || !project.revenue_address || !project.vault_address) {
      setDepositError('Faltan datos del proyecto. Intenta recargar.');
      return;
    }
    setDepositError(null);
    setDepositTxHash(null);
    let amount: bigint;
    try {
      amount = copToUsdcRaw(Number(depositAmount));
    } catch {
      setDepositError('Monto inválido. Usa solo números.');
      return;
    }
    if (amount <= 0n) {
      setDepositError('El monto debe ser mayor a 0');
      return;
    }
    if (userUsdcBalance !== null && amount > userUsdcBalance) {
      setDepositError('Saldo insuficiente para depositar este monto.');
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
          'Esta acción solo la puede hacer el responsable del proyecto. Entra con la cuenta correcta.',
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
            : 'La etapa de inversión ya cerró por tiempo. Recarga la página en unos segundos.';
        setFinalizeError(
          `Aún no se puede cerrar la etapa de inversión: queda cupo por debajo del precio de un token y no se alcanzó la meta exacta. ${human}`,
        );
        return;
      }
      const treasury = await blockchainService.getFeeTreasury(feeMgr);
      if (/^0x0+$/.test(treasury)) {
        setFinalizeError(
          'No se pudo cerrar la etapa de inversión por un problema de configuración. Escribe a soporte.',
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
        setFinalizeError(
          'Esta acción solo la puede hacer el responsable del proyecto. Entra con la cuenta correcta.',
        );
      } else {
        setFinalizeError(friendly ?? 'No se pudo cerrar la etapa de inversión.');
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

  return {
    claiming,
    investAmount,
    setInvestAmount,
    investing,
    investTxHash,
    investError,
    setInvestError,
    depositAmount,
    setDepositAmount,
    depositing,
    depositError,
    setDepositError,
    depositTxHash,
    finalizing,
    finalizeError,
    finalizeTxHash,
    handleInvest,
    handleDepositRevenue,
    handleFinalizeSale,
    handleTopupUsdc,
    handleClaimRendimientos,
  };
}
