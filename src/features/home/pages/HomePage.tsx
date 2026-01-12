import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useAuth } from '@/hooks/use-auth';
import { Balance, Investment } from '@/types';
import {
  HomeHeader,
  BalanceCard,
  ActionButtons,
  InvestmentList,
} from '@/components/home';
import './HomePage.css';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [balance] = useState<Balance>({
    amount: 0,
    currency: '0USD',
    address: '0xc8...320f',
    changePercentage: 5.21,
  });

  const [investments] = useState<Investment[]>([
    {
      id: '1',
      name: 'Natillera 01',
      amount: 3719.24,
      currency: 'USDT',
      changePercentage: 3.48,
      color: '#4169e1',
      icon: '🔵',
    },
    {
      id: '2',
      name: 'Tokenización',
      amount: 37192.4,
      currency: 'USDT',
      changePercentage: -0.02,
      color: '#ffa500',
      icon: '🟠',
    },
    {
      id: '3',
      name: 'Natillera 02',
      amount: 3719.24,
      currency: 'USDT',
      changePercentage: 3.48,
      color: '#ff6b6b',
      icon: '🔴',
    },
    {
      id: '4',
      name: 'Natillera 03',
      amount: 3719.24,
      currency: 'USDT',
      changePercentage: 3.48,
      color: '#4ecdc4',
      icon: '🔵',
    },
    {
      id: '5',
      name: 'Natillera 04',
      amount: 3719.24,
      currency: 'USDT',
      changePercentage: 3.48,
      color: '#2d6a4f',
      icon: '🟢',
    },
  ]);

  const handleSend = () => {
    console.log('Enviar');
  };

  const handleReceive = () => {
    console.log('Recibir');
  };

  const handleInvestmentClick = (investment: Investment) => {
    console.log('Investment clicked:', investment);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="home-page-content">
        <HomeHeader userName={user?.name || 'Carolina Machado'} />
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
