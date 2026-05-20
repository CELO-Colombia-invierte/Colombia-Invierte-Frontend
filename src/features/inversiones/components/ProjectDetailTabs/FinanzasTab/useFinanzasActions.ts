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
