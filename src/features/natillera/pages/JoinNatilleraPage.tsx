import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonSpinner,
  IonIcon,
  useIonToast,
} from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { checkmarkCircleOutline, alertCircleOutline, personOutline, timeOutline, notificationsOutline } from 'ionicons/icons';
import { projectsService, projectMembershipService } from '@/services/projects';
import { Project } from '@/models/projects';
import { useBlockchain } from '@/hooks/use-blockchain';


import { InvestmentHeader } from '@/features/inversiones/components';
import {
  ProjectDetailTabs,
  TabId,
  ResumenTab,
  FinanzasTab,
  DocumentosTab,
} from '@/features/inversiones/components/ProjectDetailTabs';
import '@/features/inversiones/pages/ProjectDetailPage.css';
import './JoinNatilleraPage.css';

const JoinNatilleraPage: React.FC = () => {
  const history = useHistory();
  const { slug } = useParams<{ slug: string }>();
  const [present] = useIonToast();
  const { joinNatilleraOnChain } = useBlockchain();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string>('');
  const [joinStatus, setJoinStatus] = useState<'pending' | 'approved' | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<TabId>('resumen');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    document.body.classList.add('join-page-active');
    return () => document.body.classList.remove('join-page-active');
  }, []);

  useEffect(() => {
    loadProject();
  }, [slug]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await projectsService.findOne(slug);

      // Si el usuario es el dueño, redirigir a la vista normal del proyecto
      const token = localStorage.getItem('colombia_invierte_auth_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.sub === data.owner_user_id) {
          history.replace(`/inversiones/${data.id}`);
          return;
        }
      }

      setProject(data);
    } catch (error: any) {
      setError(error.message || 'No se pudo cargar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!project) return;

    try {
      const response = await projectMembershipService.join(project.id);

      if (response.position?.status === 'PENDING') {
        setJoinStatus('pending');
        setShowSuccessMessage(true);
        await present({
          message: `Solicitud enviada. El anfitrión debe aprobar tu ingreso a "${project.name}"`,
          duration: 4000,
          color: 'warning',
        });
      } else if (response.position?.status === 'APPROVED') {
        if (project.natillera_address) {
          try {
            await joinNatilleraOnChain(project.natillera_address);
          } catch {
            // Si falla el join on-chain, se completará automáticamente al hacer el primer pago
          }
        }
        setJoinStatus('approved');
        setShowSuccessMessage(true);
        await present({
          message: `Te uniste exitosamente a "${project.name}"`,
          duration: 3000,
          color: 'success',
        });
      }
    } catch (error: any) {
      await present({
        message: error.message || 'Error al unirse al proyecto',
        duration: 3000,
        color: 'danger',
      });
    }
  };

  const handleBack = () => {
    history.push('/home');
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <div style={{ marginTop: '50%' }}>
            <IonSpinner name="crescent" />
            <p>Cargando proyecto...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <div style={{ marginTop: '30%' }}>
            <IonIcon
              icon={alertCircleOutline}
              style={{ fontSize: '80px', color: '#eb445a' }}
            />
            <h2>Error</h2>
            <p>{error}</p>
            <button
              onClick={() => history.push('/home')}
              style={{
                padding: '12px 24px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '20px',
              }}
            >
              Ir al Inicio
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (showSuccessMessage && project) {
    const isPending = joinStatus === 'pending';

    return (
      <IonPage>
        <IonContent className="join-success-page">
          <div className="join-success-container">

            <div className={`join-success-icon-wrapper ${isPending ? 'pending' : 'approved'}`}>
              <IonIcon
                icon={isPending ? alertCircleOutline : checkmarkCircleOutline}
                className="join-success-icon"
              />
            </div>

            <h2 className="join-success-title">
              {isPending ? 'Solicitud Enviada' : '¡Te uniste exitosamente!'}
            </h2>
            <p className="join-success-subtitle">
              {isPending
                ? 'Tu solicitud está pendiente de aprobación por el anfitrión'
                : `Ahora eres parte de ${project.type === 'NATILLERA' ? 'la natillera' : 'la tokenización'}`}
            </p>

            <div className="join-project-card">
              <p className="join-project-name">"{project.name}"</p>
              <p className="join-project-creator">
                <IonIcon icon={personOutline} />
                Creada por: {project.owner_user?.username || 'Usuario'}
              </p>
            </div>

            {isPending && (
              <p className="join-notify-text">
                <IonIcon icon={notificationsOutline} className="join-notify-icon" />
                Te notificaremos cuando el anfitrión apruebe tu solicitud
              </p>
            )}

            {isPending && (
              <span className="join-status-badge">
                <IonIcon icon={timeOutline} />
                Pendiente de aprobación
              </span>
            )}

            <button
              className="join-cta-button"
              onClick={() => history.push('/portafolio')}
            >
              Ir a mi Portafolio
            </button>

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

  return (
    <IonPage>
      <IonContent fullscreen className="project-detail-page">
        <InvestmentHeader
          projectName={project.name}
          projectType={projectType}
          gradient={gradients[projectType]}
          onBack={handleBack}
        />

        <ProjectDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="project-detail-content" style={{ paddingBottom: '150px' }}>
          {activeTab === 'resumen' && (
            <ResumenTab
              project={project}
              isOwner={false}
              showJoinButton={true}
              onJoinAction={handleJoin}
              joinStatus={joinStatus}
            />
          )}

          {activeTab === 'finanzas' && (
            <FinanzasTab
              project={project}
              showJoinButton={true}
              onJoinAction={handleJoin}
              joinStatus={joinStatus}
            />
          )}

          {activeTab === 'documentos' && (
            <DocumentosTab
              project={project}
              showJoinButton={true}
              onJoinAction={handleJoin}
              joinStatus={joinStatus}
            />
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default JoinNatilleraPage;
