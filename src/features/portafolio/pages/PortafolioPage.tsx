import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { IonContent, IonPage, IonIcon, IonSpinner } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { walletOutline, businessOutline } from 'ionicons/icons';
import { useAuth } from '@/hooks/use-auth';
import { portfolioService } from '@/services/portfolio/portfolio.service';
import { projectsService } from '@/services/projects/projects.service';
import { Position } from '@/models/Portfolio.model';
import { Project, ProjectVisibility } from '@/models/projects/project.model';
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
  const [positions, setPositions] = useState<Position[]>([]);
  const [publicProjects, setPublicProjects] = useState<Project[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(false);
  const history = useHistory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('mi-portafolio');

  const fetchPortfolio = useCallback(async () => {
    try {
      const portfolio = await portfolioService.getPortfolio();
      setPositions(portfolio.positions);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  }, []);

  const fetchPublicProjects = useCallback(async () => {
    try {
      setLoadingPublic(true);
      const allProjects = await projectsService.findAll();

      // Obtener IDs de proyectos donde el usuario ya es miembro
      const myProjectIds = new Set(positions.map((p) => p.projectId));

      // Filtrar solo proyectos públicos que:
      // 1. No sean del usuario actual (owner)
      // 2. El usuario no sea ya miembro
      const publicOnly = allProjects.filter(
        (p) =>
          p.visibility === ProjectVisibility.PUBLIC &&
          p.owner_user_id !== user?.id &&
          !myProjectIds.has(p.id)
      );
      setPublicProjects(publicOnly);
    } catch (error) {
      console.error('Error fetching public projects:', error);
    } finally {
      setLoadingPublic(false);
    }
  }, [user?.id, positions]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  useEffect(() => {
    if (activeTab === 'comunidad') {
      fetchPublicProjects();
    }
  }, [activeTab, fetchPublicProjects]);

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

  const projects: PortfolioProject[] = positions.map((position, index) => {
    const isNatillera = position.projectType === 'NATILLERA';
    const gradientList = isNatillera
      ? gradients.natillera
      : gradients.tokenization;

    return {
      id: position.projectId,
      name: position.projectName,
      type: isNatillera ? 'natillera' : 'tokenizacion',
      changePercentage: 0,
      period: 'Anual',
      participants: 0,
      avatars: [],
      gradient: gradientList[index % gradientList.length],
      amount: position.baseAmount,
      description: undefined,
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
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
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
              {loadingPublic && (
                <div className="comunidad-loading">
                  <IonSpinner name="crescent" />
                </div>
              )}
              {!loadingPublic && publicProjects.length === 0 && (
                <p className="comunidad-placeholder">
                  No hay proyectos públicos disponibles
                </p>
              )}
              {!loadingPublic && publicProjects.length > 0 && (
                <PortfolioGrid
                  projects={publicProjects.map((project, index) => {
                    const isNatillera = project.type === 'NATILLERA';
                    const gradientList = isNatillera
                      ? gradients.natillera
                      : gradients.tokenization;
                    return {
                      id: project.id,
                      name: project.name,
                      type: isNatillera ? 'natillera' : 'tokenizacion',
                      changePercentage: 0,
                      period: 'Anual',
                      participants: 0,
                      avatars: [],
                      gradient: gradientList[index % gradientList.length],
                      amount: 0,
                      description: project.description_rich,
                      emoji: undefined,
                      ownerName:
                        project.owner_user?.displayName ||
                        project.owner_user?.username,
                    };
                  })}
                  onProjectClick={handleProjectClick}
                />
              )}
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
