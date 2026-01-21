import React, { useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useAuth } from '@/hooks/use-auth';
import { useProjects } from '@/hooks/use-projects';
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
  const { projects: projectsData, fetchProjects } = useProjects();

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
        project.natillera_details?.expected_annual_return_pct || 0,
      period: 'Anual',
      participants: 0,
      avatars: [],
      gradient: gradientList[index % gradientList.length],
      amount: project.tokenization_details?.asset_value_amount,
      description: undefined, // Project model no tiene description directamente
      emoji: isNatillera ? undefined : '🏠',
    };
  });

  const handleProjectClick = (project: PortfolioProject) => {
    console.log('Project clicked:', project);
  };

  const handleNewProject = () => {
    console.log('New project clicked');
  };

  return (
    <IonPage>
      <IonContent fullscreen className="portafolio-page-content">
        <HomeHeader userName={user?.getDisplayName() || 'Carolina Machado'} />
        <DateHeader />
        <PortfolioGrid projects={projects} onProjectClick={handleProjectClick}>
          <NewProjectCard onClick={handleNewProject} />
        </PortfolioGrid>
      </IonContent>
    </IonPage>
  );
};

export default PortafolioPage;
