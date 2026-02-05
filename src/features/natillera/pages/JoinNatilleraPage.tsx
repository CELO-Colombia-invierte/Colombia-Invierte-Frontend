import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonSpinner,
  IonIcon,
  useIonToast,
} from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';
import { projectsService, projectMembershipService } from '@/services/projects';
import { Project } from '@/models/projects';

import { InvestmentHeader } from '@/features/inversiones/components';
import {
  ProjectDetailTabs,
  ResumenTab,
  FinanzasTab,
  DocumentosTab,
} from '@/features/inversiones/components/ProjectDetailTabs';
import '@/features/inversiones/pages/ProjectDetailPage.css';

const JoinNatilleraPage: React.FC = () => {
  const history = useHistory();
  const { slug } = useParams<{ slug: string }>();
  const [present] = useIonToast();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string>('');
  const [joinStatus, setJoinStatus] = useState<'pending' | 'approved' | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    'resumen' | 'finanzas' | 'documentos' | 'participantes' | 'solicitudes'
  >('resumen');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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
        <IonContent className="ion-padding ion-text-center">
          <div style={{ marginTop: '30%', padding: '0 20px' }}>
            <IonIcon
              icon={isPending ? alertCircleOutline : checkmarkCircleOutline}
              style={{
                fontSize: '80px',
                color: isPending ? '#ffc409' : '#2dd36f',
              }}
            />
            <h2 style={{ marginTop: '20px', fontSize: '24px' }}>
              {isPending ? 'Solicitud Enviada' : '¡Te uniste exitosamente!'}
            </h2>
            <p style={{ fontSize: '16px', margin: '16px 0', color: '#666' }}>
              {isPending
                ? 'Tu solicitud está pendiente de aprobación por el anfitrión:'
                : `Ahora eres parte de ${project.type === 'NATILLERA' ? 'la natillera' : 'la tokenización'}:`}
            </p>
            <h3
              style={{ color: '#3880ff', fontSize: '20px', margin: '12px 0' }}
            >
              "{project.name}"
            </h3>
            <p style={{ color: '#666', margin: '16px 0' }}>
              Creada por: {project.owner_user?.username || 'Usuario'}
            </p>
            {isPending && (
              <p
                style={{
                  color: '#ffc409',
                  fontSize: '14px',
                  marginTop: '20px',
                }}
              >
                Te notificaremos cuando el anfitrión apruebe tu solicitud
              </p>
            )}
            <button
              onClick={() => history.push('/portafolio')}
              style={{
                padding: '14px 32px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '32px',
              }}
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

        <div className="project-detail-content">
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
