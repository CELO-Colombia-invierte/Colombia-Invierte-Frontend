import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, useIonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { projectsService } from '@/services/projects';
import { Project } from '@/models/projects';
import { useAuth } from '@/hooks/use-auth';
import { InvestmentHeader } from '../components';
import {
  ProjectDetailTabs,
  ResumenTab,
  FinanzasTab,
  DocumentosTab,
  ParticipantesTab,
  SolicitudesTab,
} from '../components/ProjectDetailTabs';
import './ProjectDetailPage.css';

interface ProjectDetailPageProps {
  mode?: 'view' | 'join';
  onJoinAction?: () => void;
  joinStatus?: 'pending' | 'approved' | null;
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  mode = 'view',
  onJoinAction,
  joinStatus,
}) => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const history = useHistory();
  const [present] = useIonToast();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'resumen' | 'finanzas' | 'documentos' | 'participantes' | 'solicitudes'
  >('resumen');

  useEffect(() => {
    fetchProjectDetails();
  }, [id, slug, user]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const identifier = id || slug;
      if (!identifier) {
        throw new Error('No se proporcionó un identificador de proyecto');
      }
      const data = await projectsService.findOne(identifier);
      setProject(data);

      // Determinar si mostrar botón de pago
      // Si el usuario está autenticado, en modo view, y no es el dueño, mostramos el botón
      if (user?.id && mode === 'view' && data.owner_user_id !== user.id) {
        setIsMember(true);
      } else {
        setIsMember(false);
      }
    } catch (error: any) {
      console.error('Error fetching project:', error);
      await present({
        message: 'Error al cargar los detalles del proyecto',
        duration: 3000,
        color: 'danger',
      });
      history.push('/portafolio');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    history.goBack();
  };

  const handleShare = () => {
    if (project?.share_slug) {
      const linkPrefix =
        project.type === 'NATILLERA' ? 'natillera' : 'tokenizacion';
      const link = `${window.location.origin}/${linkPrefix}/${project.share_slug}`;
      navigator.clipboard.writeText(link);
      present({
        message: 'Link copiado al portapapeles',
        duration: 2000,
        color: 'success',
      });
    }
  };

  const isOwner = Boolean(
    user?.id && project?.owner_user?.id && user.id === project.owner_user.id
  );

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <div className="loading-container">
            <p>Cargando...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!project) {
    return null;
  }

  const isNatillera = project.type === 'NATILLERA';
  const projectType = isNatillera ? 'natillera' : 'tokenizacion';

  const gradients = {
    natillera: 'linear-gradient(135deg, #E568DB 0%, #A855F7 100%)',
    tokenizacion: 'linear-gradient(135deg, #FCD116 0%, #F59E0B 100%)',
  };

  // Determinar si mostrar botón de unirse
  const showJoinButton = mode === 'join' && !isOwner;

  return (
    <IonPage>
      <IonContent fullscreen className="project-detail-page">
        <InvestmentHeader
          projectName={project.name}
          projectType={projectType}
          gradient={gradients[projectType]}
          onBack={handleBack}
          onShare={mode === 'view' ? handleShare : undefined}
        />

        <ProjectDetailTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOwner={isOwner}
          isMember={isMember}
        />

        <div className="project-detail-content">
          {activeTab === 'resumen' && (
            <ResumenTab
              project={project}
              isOwner={isOwner}
              showJoinButton={showJoinButton}
              onJoinAction={onJoinAction}
              joinStatus={joinStatus}
              isMember={isMember}
            />
          )}

          {activeTab === 'finanzas' && (
            <FinanzasTab
              project={project}
              showJoinButton={showJoinButton}
              onJoinAction={onJoinAction}
              joinStatus={joinStatus}
            />
          )}

          {activeTab === 'documentos' && (
            <DocumentosTab
              project={project}
              showJoinButton={showJoinButton}
              onJoinAction={onJoinAction}
              joinStatus={joinStatus}
            />
          )}

          {activeTab === 'participantes' && (isOwner || isMember) && (
            <ParticipantesTab project={project} isOwner={isOwner} />
          )}

          {activeTab === 'solicitudes' && isOwner && (
            <SolicitudesTab project={project} />
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProjectDetailPage;
