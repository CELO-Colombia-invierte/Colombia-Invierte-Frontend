import { useEffect, useState } from 'react';
import type { Account } from 'thirdweb/wallets';
import { Project } from '@/models/projects';
import {
  blockchainService,
  NatilleraState,
  NatilleraV2State,
  TokenizacionState,
  RevenueModuleState,
} from '@/services/blockchain.service';
import { BLOCKCHAIN_CONFIG } from '@/contracts/config';

export type AnyChainState =
  | NatilleraState
  | NatilleraV2State
  | TokenizacionState
  | RevenueModuleState
  | null;

export function useChainData(project: Project, account: Account | undefined) {
  const [chainState, setChainState] = useState<AnyChainState>(null);
  const [chainLoading, setChainLoading] = useState(false);
  const [projectTokenDecimals, setProjectTokenDecimals] = useState<number | null>(null);
  const [pendingRewards, setPendingRewards] = useState<bigint | null>(null);
  const [vaultBalance, setVaultBalance] = useState<bigint | null>(null);
  const [userInvestment, setUserInvestment] = useState<bigint | null>(null);
  const [userUsdcBalance, setUserUsdcBalance] = useState<bigint | null>(null);
  const [projectCreator, setProjectCreator] = useState<string | null>(null);
  const [tokenSupply, setTokenSupply] = useState<bigint | null>(null);
  const [userTokenBalance, setUserTokenBalance] = useState<bigint | null>(null);
  const [projectFunds, setProjectFunds] = useState<bigint | null>(null);
  const [milestonesCommitted, setMilestonesCommitted] = useState<bigint | null>(null);

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
          const balance = await blockchainService.getTokenBalance(
            BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS,
            project.vault_address,
          );
          setVaultBalance(balance);
        }
      } else if (project.revenue_address) {
        const state = await blockchainService.getRevenueModuleState(project.revenue_address);
        setChainState(state);
        if (state.saleFinalized) {
          try {
            setProjectFunds(await blockchainService.getProjectFunds(project.revenue_address));
          } catch {
            setProjectFunds(null);
          }
          if (project.vault_address) {
            try {
              setVaultBalance(
                await blockchainService.getTokenBalance(
                  BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS,
                  project.vault_address,
                ),
              );
            } catch {
              setVaultBalance(null);
            }
          }
          if (project.milestones_address) {
            try {
              setMilestonesCommitted(
                await blockchainService.getMilestonesCommitted(
                  project.milestones_address,
                  BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS,
                ),
              );
            } catch {
              setMilestonesCommitted(null);
            }
          }
        } else {
          setProjectFunds(null);
          setMilestonesCommitted(null);
        }
        try {
          setProjectCreator(await blockchainService.getProjectCreator(project.revenue_address));
        } catch {
          setProjectCreator(null);
        }
        try {
          const tokenAddr = await blockchainService.getProjectTokenAddress(project.revenue_address);
          const supply = await blockchainService.getTokenTotalSupply(tokenAddr);
          setTokenSupply(supply);
          if (account?.address) {
            setUserTokenBalance(await blockchainService.getTokenBalance(tokenAddr, account.address));
          }
        } catch {
          setTokenSupply(null);
        }
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
          setChainState(await blockchainService.getNatilleraState(project.contract_address));
        } else {
          const state = await blockchainService.getTokenizacionState(project.contract_address);
          setChainState(state);
          if (state.projectTokenAddress) {
            setProjectTokenDecimals(await blockchainService.getTokenDecimals(state.projectTokenAddress));
          }
        }
      }
    } catch {
    } finally {
      setChainLoading(false);
    }
  };

  useEffect(() => {
    loadChainState();
  }, [project.contract_address, project.natillera_address, project.revenue_address, account?.address]);

  return {
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
  };
}
