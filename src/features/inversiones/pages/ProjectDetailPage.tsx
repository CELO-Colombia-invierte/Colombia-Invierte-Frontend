import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonButton, useIonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { projectsService } from '@/services/projects';
import { projectMembershipService } from '@/services/projects/membership.service';
import { Project, ProjectVisibility } from '@/models/projects/project.model';
import { MembershipStatus } from '@/models/membership/membership.model';
import { useAuth } from '@/hooks/use-auth';
import { InvestmentHeader } from '../components';
import {
  ProjectDetailTabs,
  TabId,
  ResumenTab,
  FinanzasTab,
  DocumentosTab,
  ParticipantesTab,
  SolicitudesTab,
  HistorialTab,
  GovernanceTab,
  DisputasTab,
  MilestonesTab,
} from '../components/ProjectDetailTabs';
import { DeployProjectCard } from '../components/DeployProjectCard';
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
  const [isDeployed, setIsDeployed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [membershipStatus, setMembershipStatus] =
    useState<MembershipStatus | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('resumen');

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

      // Verificar estado de deploy en blockchain
      try {
        const blockchainData = await projectsService.getBlockchainData(data.id);
        setIsDeployed(blockchainData.isDeployed);
      } catch {
        setIsDeployed(false);
      }

      // Verificar membresía real del usuario si está autenticado
      if (user?.id) {
        try {
          const membership = await projectMembershipService.checkMembership(
            data.id
          );
          setIsMember(membership.isMember);
          setMembershipStatus(membership.status);
        } catch (membershipError) {
          // Si falla la verificación, asumir que no es miembro
          console.error('Error checking membership:', membershipError);
          setIsMember(false);
          setMembershipStatus(null);
        }
      } else {
        setIsMember(false);
        setMembershipStatus(null);
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

  const handleJoinProject = async () => {
    if (!project || !user) return;

    try {
      setIsJoining(true);
      await projectMembershipService.join(project.id);
      setHasJoined(true);
      await present({
        message: 'Te has unido al proyecto exitosamente',
        duration: 3000,
        color: 'success',
      });
    } catch (error: any) {
      console.error('Error joining project:', error);
      await present({
        message: error.message || 'Error al unirse al proyecto',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setIsJoining(false);
    }
  };

  const isOwner = Boolean(
    user?.id && project?.owner_user?.id && user.id === project.owner_user.id
  );

  const hasV2 = !!(project?.vault_address);

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

  const showJoinButton = mode === 'join' && !isOwner;
  const isPublicProject = project?.visibility === ProjectVisibility.PUBLIC;
  const hasPendingRequest = membershipStatus === MembershipStatus.PENDING;
  const canJoinPublicProject =
    isPublicProject &&
    !isOwner &&
    !isMember &&
    !hasJoined &&
    !hasPendingRequest &&
    user;

  return (
    <IonPage>
      <IonContent fullscreen className="project-detail-page">
        <InvestmentHeader
          projectName={project.name}
          projectType={projectType}
          coverImage={
            project.cover_asset_id
              ? `${import.meta.env.VITE_API_URL || ''}/assets/${project.cover_asset_id}`
              : undefined
          }
          gradient={gradients[projectType]}
          onBack={handleBack}
          onShare={isOwner ? handleShare : undefined}
        />

        <ProjectDetailTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOwner={isOwner}
          isMember={isMember}
          hasV2={hasV2}
        />

        <div className="project-detail-content">
          {activeTab === 'resumen' && (
            <>
              {isOwner && !isDeployed && isPublicProject && (
                <DeployProjectCard
                  project={project}
                  onPublished={(updatedProject) => {
                    setIsDeployed(true);
                    setProject(updatedProject);
                  }}
                />
              )}
              <ResumenTab
                project={project}
                isOwner={isOwner}
                showJoinButton={showJoinButton}
                onJoinAction={onJoinAction}
                joinStatus={joinStatus}
                isMember={isMember}
              />
            </>
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

          {activeTab === 'historial' && (isOwner || isMember) && (
            <HistorialTab project={project} />
          )}

          {activeTab === 'gobernanza' && hasV2 && (
            <GovernanceTab project={project} />
          )}

          {activeTab === 'disputas' && hasV2 && (
            <DisputasTab project={project} />
          )}

          {activeTab === 'hitos' && hasV2 && (
            <MilestonesTab project={project} />
          )}
        </div>
        {canJoinPublicProject && (
          <div className="join-project-footer">
            <IonButton
              expand="block"
              className="join-project-btn"
              onClick={handleJoinProject}
              disabled={isJoining}
            >
              {isJoining ? 'Uniéndose...' : 'Unirme al proyecto'}
            </IonButton>
          </div>
        )}
        {hasJoined && (
          <div className="join-project-footer join-project-footer--success">
            <p>Ya eres parte de este proyecto</p>
          </div>
        )}
        {hasPendingRequest && !hasJoined && (
          <div className="join-project-footer join-project-footer--pending">
            <p>Tu solicitud está pendiente de aprobación</p>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProjectDetailPage;
