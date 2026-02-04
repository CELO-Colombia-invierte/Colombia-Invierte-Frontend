import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { IonContent, IonPage, IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { walletOutline, businessOutline } from 'ionicons/icons';
import { useAuth } from '@/hooks/use-auth';
import { useProjects } from '@/hooks/use-projects';
import { PortfolioProject } from '@/types';
import { HomeHeader } from '@/components/home';
import {
  DateHeader,
  PortfolioGrid,
  NewProjectCard,
} from '@/components/portfolio';
import { BottomSlideModal } from '@/components/ui/BottomSlideModal';
import { Tabs, Tab } from '@/components/ui/Tabs';
import './PortafolioPage.css';

const PortafolioPage: React.FC = () => {
  const { user } = useAuth();
  const { projects: projectsData, fetchProjects } = useProjects();
  const history = useHistory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('mi-portafolio');

  useEffect(() => {
    fetchProjects({ owner: true });
  }, [fetchProjects]);

  const gradients = {
    natillera: [
      'linear-gradient(135deg, #E568DB 0%, #A855F7 100%)',
      'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    ],
    tokenization: [
      'linear-gradient(135deg, #FCD116 0%, #F59E0B 100%)',
      'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
    ],
  };

  const projects: PortfolioProject[] = projectsData.map((project, index) => {
    const isNatillera = project.type === 'NATILLERA';
    const gradientList = isNatillera
      ? gradients.natillera
      : gradients.tokenization;

    return {
      id: project.id,
      name: project.name,
      type: isNatillera ? 'natillera' : 'tokenizacion',
      changePercentage:
        project.natillera_details?.expected_annual_return_pct ||
        project.tokenization_details?.expected_annual_return_pct ||
        0,
      period: 'Anual',
      participants: 0,
      avatars: [],
      gradient: gradientList[index % gradientList.length],
      amount: project.tokenization_details?.asset_value_amount,
      description: project.description_rich?.substring(0, 50) || undefined,
      emoji: undefined,
    };
  });

  const handleProjectClick = (project: PortfolioProject) => {
    history.push(`/inversiones/${project.id}`);
  };

  const handleNewProject = () => {
    setIsModalOpen(true);
  };

  const modalOptions = [
    {
      id: 'crear-natillera',
      title: 'Crear Natillera',
      description: 'Crea un proyecto de ahorro colectivo',
      icon: <IonIcon icon={walletOutline} />,
      onClick: () => {
        history.push('/crear-natillera');
      },
    },
    {
      id: 'crear-tokenizacion',
      title: 'Crear Tokenización',
      description: 'Tokeniza un activo o proyecto',
      icon: <IonIcon icon={businessOutline} />,
      onClick: () => {
        history.push('/crear-tokenizacion');
      },
    },
  ];

  const tabs: Tab[] = [
    { id: 'mi-portafolio', label: 'Mi Portafolio' },
    { id: 'comunidad', label: 'Comunidad' },
  ];

  return (
    <>
      <IonPage>
        <IonContent fullscreen className="portafolio-page-content">
          <HomeHeader userName={user?.getDisplayName() || 'Carolina Machado'} />
          <DateHeader title="" />
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          {activeTab === 'mi-portafolio' && (
            <PortfolioGrid
              projects={projects}
              onProjectClick={handleProjectClick}
            >
              <NewProjectCard onClick={handleNewProject} />
            </PortfolioGrid>
          )}
          {activeTab === 'comunidad' && (
            <div className="comunidad-content">
              <p className="comunidad-placeholder">
                Contenido de comunidad próximamente
              </p>
            </div>
          )}
        </IonContent>
      </IonPage>
      {createPortal(
        <BottomSlideModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          options={modalOptions}
          title="¿Qué deseas hacer?"
        />,
        document.body
      )}
    </>
  );
};

export default PortafolioPage;
