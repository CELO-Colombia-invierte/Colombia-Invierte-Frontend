import React, { useState, useCallback } from 'react';
import { IonContent, IonPage, useIonViewWillEnter } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { authService } from '@/services/auth';
import { usePortfolio } from '@/hooks/use-portfolio';
import { useTransactions } from '@/hooks/use-transactions';
import { Balance, Investment } from '@/types';
import {
  HomeHeader,
  BalanceCard,
  ActionButtons,
  InvestmentList,
  TransactionList,
} from '@/components/home';
import { TransferModal } from '@/components/home/TransferModal';
import { RecibirModal } from '@/components/home/RecibirModal';
import { PageTransition, Tabs } from '@/components/ui';
import './HomePage.css';

import { useBlockchain } from '@/hooks/use-blockchain';
import { blockchainService } from '@/services/blockchain.service';
import { BLOCKCHAIN_CONFIG } from '@/contracts/config';

const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const history = useHistory();
  const { portfolio, fetchPortfolio, isLoading } = usePortfolio();
  const { transactions, fetchTransactions } = useTransactions();
  const [activeTab, setActiveTab] = useState<string>('inversiones');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isRecibirModalOpen, setIsRecibirModalOpen] = useState(false);
  const { account } = useBlockchain();
  const [usdtBalance, setUsdtBalance] = useState<number>(() => {
    const saved = localStorage.getItem('usdtBalance');
    return saved ? parseFloat(saved) : 0;
  });


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

  useIonViewWillEnter(() => {
    if (isAuthenticated && authService.getToken()) {
      fetchPortfolio();
      fetchTransactions();
    }
    fetchUsdtBalance();
  });

  // Calculate weighted average pctChange across all positions
  const totalPctChange = (() => {
    const positions = portfolio?.positions || [];
    const totalAmount = positions.reduce((acc, p) => acc + p.baseAmount, 0);
    if (totalAmount <= 0) return 0;
    return positions.reduce(
      (acc, p) => acc + p.pctChange * (p.baseAmount / totalAmount),
      0,
    );
  })();

  const balance: Balance = {
    amount: usdtBalance,
    currency: 'USDT',
    address: account?.address || '',
    changePercentage: Math.round(totalPctChange * 100) / 100,
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
        amount: pos.currentValue,
        totalCollected: pos.totalCollected,
        currency: pos.baseCurrency,
        changePercentage: pos.pctChange,
        color: colors[index % colors.length],
        icon: icons[index % icons.length],
        imageUrl: pos.projectCoverUrl,
      };
    }) || [];

  const handleProfileClick = () => {
    if (user?.username) {
      history.push(`/perfil/${user.username}`);
    } else {
      history.push('/perfil');
    }
  };

  const handleSend = () => {
    setIsTransferModalOpen(true);
  };

  const handleReceive = () => {
    setIsRecibirModalOpen(true);
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
        <PageTransition>
          <HomeHeader userName={user?.getDisplayName() || ''} userAvatar={user?.getAvatarUrl()} onProfileClick={handleProfileClick} />
          <BalanceCard balance={balance} />
          <ActionButtons onSend={handleSend} onReceive={handleReceive} />
          <div className="home-section-tabs">
            <Tabs
              tabs={[
                { id: 'inversiones', label: 'Inversiones' },
                { id: 'historial', label: 'Historial' },
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
          {activeTab === 'inversiones' && (
            <InvestmentList
              investments={investments}
              title=""
              onInvestmentClick={handleInvestmentClick}
            />
          )}
          {activeTab === 'historial' && (
            <TransactionList transactions={transactions} />
          )}
        </PageTransition>
      </IonContent>
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />
      <RecibirModal
        isOpen={isRecibirModalOpen}
        onClose={() => setIsRecibirModalOpen(false)}
      />
    </IonPage>
  );
};

export default HomePage;
