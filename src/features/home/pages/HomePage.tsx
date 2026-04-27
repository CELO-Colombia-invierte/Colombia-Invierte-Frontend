import React, { useState, useCallback, useEffect } from 'react';
import { IonContent, IonPage, useIonViewWillEnter } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { authService } from '@/services/auth';
import { usePortfolio } from '@/hooks/use-portfolio';
import { useTransactions } from '@/hooks/use-transactions';
import { projectsService } from '@/services/projects/projects.service';
import { computeNatilleraContribution, fetchQuotaPaidEvents } from '@/services/natillera-contribution';
import { Balance, Investment } from '@/types';
import {
  HomeHeader,
  BalanceCard,
  ActionButtons,
  InvestmentList,
  TransactionList,
} from '@/components/home';
import { PageTransition, Tabs } from '@/components/ui';
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
  const { transactions, fetchTransactions } = useTransactions();
  const [activeTab, setActiveTab] = useState<string>('inversiones');
  const { account } = useBlockchain();
  const [enrichedMap, setEnrichedMap] = useState<Record<string, { currentValue: number; pctChange: number }>>({});
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

  const positions = portfolio?.positions || [];

  const positionsKey = positions.map((p) => p.projectId).join(',');

  useEffect(() => {
    if (!account?.address) {
      setEnrichedMap({});
      return;
    }
    const natilleraPositions = positions.filter((p) => p.projectType === 'NATILLERA');
    if (natilleraPositions.length === 0) {
      setEnrichedMap({});
      return;
    }

    let cancelled = false;
    setEnrichedMap({});

    const enrichOne = async (position: typeof natilleraPositions[number]) => {
      try {
        const [project, events] = await Promise.all([
          projectsService.findOne(position.projectId),
          fetchQuotaPaidEvents(position.projectId),
        ]);
        const quotaCop = Number(project.natillera_details?.monthly_fee_amount) || 0;
        if (quotaCop === 0) return;

        const { paidMonths, currentValueCop, pctYield } = computeNatilleraContribution({
          events,
          myAddress: account.address,
          quotaCop,
          vaultCop: Number(position.totalCollected) || 0,
        });
        if (paidMonths === 0) return;

        if (cancelled) return;
        setEnrichedMap((prev) => ({
          ...prev,
          [position.projectId]: { currentValue: currentValueCop, pctChange: pctYield },
        }));
      } catch (err) {
        console.warn(`[HomePage] enrich ${position.projectId} failed`, err);
      }
    };

    Promise.all(natilleraPositions.map(enrichOne));

    return () => { cancelled = true; };
  }, [positionsKey, account?.address]);

  useIonViewWillEnter(() => {
    if (isAuthenticated && authService.getToken()) {
      fetchPortfolio();
      fetchTransactions();
    }
    fetchUsdtBalance();
  });

  const totalPctChange = (() => {
    const totalAmount = positions.reduce((acc, p) => acc + (enrichedMap[p.projectId]?.currentValue ?? p.baseAmount), 0);
    if (totalAmount <= 0) return 0;
    return positions.reduce((acc, p) => {
      const val = enrichedMap[p.projectId]?.currentValue ?? p.baseAmount;
      const pct = enrichedMap[p.projectId]?.pctChange ?? p.pctChange;
      return acc + pct * (val / totalAmount);
    }, 0);
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
    positions.map((pos, index) => {
      const colors = ['#4169e1', '#ffa500', '#ff6b6b', '#4ecdc4', '#2d6a4f'];
      const icons = ['🔵', '🟠', '🔴', '🔵', '🟢'];
      const enriched = enrichedMap[pos.projectId];
      return {
        id: pos.id,
        projectId: pos.projectId,
        name: pos.projectName,
        amount: enriched?.currentValue ?? pos.currentValue,
        totalCollected: pos.totalCollected,
        currency: pos.baseCurrency,
        changePercentage: enriched?.pctChange ?? pos.pctChange,
        color: colors[index % colors.length],
        icon: icons[index % icons.length],
        imageUrl: pos.projectCoverUrl,
      };
    });

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
    </IonPage>
  );
};

export default HomePage;
