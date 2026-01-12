import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useAuth } from '@/hooks/use-auth';
import { PortfolioProject } from '@/types';
import { HomeHeader } from '@/components/home';
import {
  DateHeader,
  PortfolioGrid,
  NewProjectCard,
} from '@/components/portfolio';
import './PortafolioPage.css';

const PortafolioPage: React.FC = () => {
  const { user } = useAuth();

  const [projects] = useState<PortfolioProject[]>([
    {
      id: '1',
      name: 'Natillera 01',
      type: 'natillera',
      changePercentage: 15.16,
      period: 'Anual',
      participants: 5,
      avatars: ['🇨🇴', '👤', '👤'],
      gradient: 'linear-gradient(135deg, #E568DB 0%, #A855F7 100%)',
    },
    {
      id: '2',
      name: 'Natillera 02',
      type: 'natillera',
      changePercentage: 159,
      period: 'Anual',
      participants: 4,
      avatars: ['🇨🇴', '👤', '👤'],
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    },
    {
      id: '3',
      name: 'Tokenización Inmobiliaria',
      type: 'tokenizacion',
      amount: 15642.4,
      description: 'Tokenización Inmobiliaria',
      changePercentage: 7.86,
      emoji: '🏠',
      gradient: 'linear-gradient(135deg, #FCD116 0%, #F59E0B 100%)',
    },
    {
      id: '4',
      name: 'Tokenización de automóvil',
      type: 'tokenizacion',
      amount: 28389.21,
      description: 'Tokenización de automóvil',
      changePercentage: -2.13,
      emoji: '🚙',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    },
  ]);

  const handleProjectClick = (project: PortfolioProject) => {
    console.log('Project clicked:', project);
  };

  const handleNewProject = () => {
    console.log('New project clicked');
  };

  return (
    <IonPage>
      <IonContent fullscreen className="portafolio-page-content">
        <HomeHeader userName={user?.name || 'Carolina Machado'} />
        <DateHeader />
        <PortfolioGrid projects={projects} onProjectClick={handleProjectClick}>
          <NewProjectCard onClick={handleNewProject} />
        </PortfolioGrid>
      </IonContent>
    </IonPage>
  );
};

export default PortafolioPage;
