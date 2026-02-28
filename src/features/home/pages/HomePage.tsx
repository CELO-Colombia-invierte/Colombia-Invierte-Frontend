import React, { useEffect, useState, useCallback } from 'react';
import { IonContent, IonPage, useIonViewWillEnter } from '@ionic/react';
import { useAuth } from '@/hooks/use-auth';
import { usePortfolio } from '@/hooks/use-portfolio';
import { Balance, Investment } from '@/types';
import {
  HomeHeader,
  BalanceCard,
  ActionButtons,
  InvestmentList,
} from '@/components/home';
import { TransferModal } from '@/components/home/TransferModal';
import './HomePage.css';

import { useBlockchain } from '@/hooks/use-blockchain';
import { blockchainService } from '@/services/blockchain.service';
import { BLOCKCHAIN_CONFIG } from '@/contracts/config';

const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { portfolio, fetchPortfolio, isLoading } = usePortfolio();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const { account } = useBlockchain();
  const [usdtBalance, setUsdtBalance] = useState<number>(() => {
    const saved = localStorage.getItem('usdtBalance');
    return saved ? parseFloat(saved) : 0;
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchPortfolio();
    }
  }, [fetchPortfolio, isAuthenticated]);

  const fetchUsdtBalance = useCallback(async () => {
    if (account?.address) {
      try {
        const rawBalance = await blockchainService.getTokenBalance(
          BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS,
          account.address
        );
        const formatted = parseFloat(
          blockchainService.formatUnits(rawBalance, BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS)
        );
        setUsdtBalance(formatted);
        localStorage.setItem('usdtBalance', formatted.toString());
      } catch (error) {
        console.error("Error fetching USDT balance", error);
      }
    }
  }, [account?.address]);

  useEffect(() => {
    fetchUsdtBalance();
  }, [fetchUsdtBalance]);

  useIonViewWillEnter(() => {
    if (isAuthenticated) {
      fetchPortfolio();
    }
    fetchUsdtBalance();
  });

  const balance: Balance = {
    amount: usdtBalance,
    currency: 'USDT',
    address: account?.address || '',
    changePercentage: 0,
    secondaryAmount: portfolio?.balances.ousd || 0,
    secondaryCurrency: 'OUSD',
  };

  const investments: Investment[] =
    portfolio?.positions.map((pos, index) => {
      const colors = ['#4169e1', '#ffa500', '#ff6b6b', '#4ecdc4', '#2d6a4f'];
      const icons = ['🔵', '🟠', '🔴', '🔵', '🟢'];
      return {
        id: pos.id,
        name: pos.projectName,
        amount: pos.baseAmount,
        currency: pos.baseCurrency,
        changePercentage: 0,
        color: colors[index % colors.length],
        icon: icons[index % icons.length],
      };
    }) || [];

  const handleSend = () => {
    setIsTransferModalOpen(true);
  };

  const handleReceive = () => {
  };

  const handleInvestmentClick = () => {
  };

  if (isLoading || !user) {
    return (
      <IonPage>
        <IonContent fullscreen className="home-page-content">
          <div className="home-page-loading">
            <div className="spinner" />
            <p>Cargando...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen className="home-page-content">
        <HomeHeader userName={user?.getDisplayName() || 'Carolina Machado'} userAvatar={user?.getAvatarUrl()} />
        <BalanceCard balance={balance} />
        <ActionButtons onSend={handleSend} onReceive={handleReceive} />
        <InvestmentList
          investments={investments}
          onInvestmentClick={handleInvestmentClick}
        />
      </IonContent>
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />
    </IonPage>
  );
};

export default HomePage;
