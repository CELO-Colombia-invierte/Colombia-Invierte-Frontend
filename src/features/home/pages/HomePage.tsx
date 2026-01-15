import React, { useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useAuth } from '@/hooks/use-auth';
import { usePortfolio } from '@/hooks/use-portfolio';
import { Balance, Investment } from '@/types';
import {
  HomeHeader,
  BalanceCard,
  ActionButtons,
  InvestmentList,
} from '@/components/home';
import './HomePage.css';

const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { portfolio, fetchPortfolio, isLoading } = usePortfolio();

  useEffect(() => {
    if (isAuthenticated) {
      fetchPortfolio();
    }
  }, [fetchPortfolio, isAuthenticated]);

  const balance: Balance = {
    amount: portfolio?.balances.ousd || 0,
    currency: 'OUSD',
    address: '0xc8...320f',
    changePercentage: 0,
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
        changePercentage: pos.changePercentage,
        color: colors[index % colors.length],
        icon: icons[index % icons.length],
      };
    }) || [];

  const handleSend = () => {
    console.log('Enviar');
  };

  const handleReceive = () => {
    console.log('Recibir');
  };

  const handleInvestmentClick = (investment: Investment) => {
    console.log('Investment clicked:', investment);
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
        <HomeHeader userName={user?.getDisplayName() || 'Carolina Machado'} />
        <BalanceCard balance={balance} />
        <ActionButtons onSend={handleSend} onReceive={handleReceive} />
        <InvestmentList
          investments={investments}
          onInvestmentClick={handleInvestmentClick}
        />
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
