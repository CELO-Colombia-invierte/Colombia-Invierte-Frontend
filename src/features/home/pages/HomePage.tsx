import React, { useEffect, useState, useCallback } from 'react';
import { IonContent, IonPage, useIonViewWillEnter } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { authService } from '@/services/auth';
import { usePortfolio } from '@/hooks/use-portfolio';
import { Balance, Investment } from '@/types';
import {
  HomeHeader,
  BalanceCard,
  ActionButtons,
  InvestmentList,
} from '@/components/home';
import { PageTransition } from '@/components/ui';
import './HomePage.css';

import { useBlockchain } from '@/hooks/use-blockchain';
import { blockchainService } from '@/services/blockchain.service';
import { BLOCKCHAIN_CONFIG, CHAIN } from '@/contracts/config';
import { useWalletDetailsModal } from 'thirdweb/react';
import { thirdwebClient } from '@/app/App';

const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const history = useHistory();
  const { portfolio, fetchPortfolio, isLoading } = usePortfolio();
  const detailsModal = useWalletDetailsModal();
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

  // Refresca al volver al home — isFetchingRef evita duplicados con el useEffect de arriba
  useIonViewWillEnter(() => {
    if (authService.getToken()) {
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
      const showFee = pos.projectType === 'NATILLERA' && pos.monthlyFeeAmount != null;
      return {
        id: pos.id,
        projectId: pos.projectId,
        name: pos.projectName,
        amount: showFee ? pos.monthlyFeeAmount! : pos.baseAmount,
        currency: showFee ? (pos.monthlyFeeCurrency || pos.baseCurrency) : pos.baseCurrency,
        changePercentage: 0,
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

  const openWalletModal = useCallback((mode: 'send' | 'receive') => {
    if (!account) return;
    try {
      detailsModal.open({
        client: thirdwebClient,
        chains: [CHAIN],
        theme: "dark",
        locale: "es_ES",
        hideSendFunds: mode === 'receive',
        hideReceiveFunds: mode === 'send',
        hideBuyFunds: true,
        assetTabs: [],
        hideDisconnect: true,
        displayBalanceToken: {
          [BLOCKCHAIN_CONFIG.CHAIN_ID]: BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS,
        },
      });
    } catch (error) {
      console.error(`Error opening ${mode} modal:`, error);
    }
  }, [account, detailsModal]);

  const handleSend = () => openWalletModal('send');
  const handleReceive = () => openWalletModal('receive');

  const handleInvestmentClick = (investment: Investment) => {
    history.push(`/inversiones/${investment.projectId}`);
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
          <InvestmentList
            investments={investments}
            onInvestmentClick={handleInvestmentClick}
          />
        </PageTransition>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
