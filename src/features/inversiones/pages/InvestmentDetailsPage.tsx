import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, useIonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { projectsService } from '@/services/projects';
import { Project } from '@/models/projects';
import { useAuth } from '@/hooks/use-auth';
import {
  InvestmentHeader,
  InvestmentStats,
  InvestmentFinancialInfo,
  InvestmentDescription,
  PendingRequests,
  MembersList,
} from '../components';
import './InvestmentDetailsPage.css';

const InvestmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [present] = useIonToast();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const formatCurrency = (amount: number): string => {
    return Number(amount).toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const data = await projectsService.findOne(id);
      setProject(data);
    } catch (error: any) {
      console.error('Error fetching project:', error);
      await present({
        message: 'Error al cargar los detalles de la inversión',
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
      const link = `${window.location.origin}/natillera/${project.share_slug}`;
      navigator.clipboard.writeText(link);
      present({
        message: 'Link copiado al portapapeles',
        duration: 2000,
        color: 'success',
      });
    }
  };

  const isOwner = Boolean(
    user?.id && 
    project?.owner_user?.id && 
    user.id === project.owner_user.id
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
  const stats = [];

  if (isNatillera && project.natillera_details) {
    stats.push({
      icon: 'cash',
      label: 'Cuota Mensual',
      value: `$${formatCurrency(project.natillera_details.monthly_fee_amount)} ${project.natillera_details.monthly_fee_currency}`,
      color: '#10B981',
    });
    stats.push({
      icon: 'trendingUp',
      label: 'Rendimiento Anual',
      value: `${project.natillera_details.expected_annual_return_pct}%`,
      color: '#667eea',
    });
    stats.push({
      icon: 'calendar',
      label: 'Duración',
      value: `${project.natillera_details.duration_months} meses`,
      color: '#F59E0B',
    });
  } else if (project.tokenization_details) {
    stats.push({
      icon: 'cash',
      label: 'Valor del Activo',
      value: `$${formatCurrency(project.tokenization_details.asset_value_amount)} ${project.tokenization_details.asset_value_currency}`,
      color: '#10B981',
    });
    stats.push({
      icon: 'trendingUp',
      label: 'Rendimiento Esperado',
      value: `${project.tokenization_details.expected_annual_return_pct}%`,
      color: '#667eea',
    });
    stats.push({
      icon: 'cash',
      label: 'Precio por Token',
      value: `$${formatCurrency(project.tokenization_details.price_per_token_amount)} ${project.tokenization_details.price_per_token_currency}`,
      color: '#8B5CF6',
    });
  }

  const financialItems = [];

  if (isNatillera && project.natillera_details) {
    financialItems.push({
      label: 'Total a Invertir',
      value: `$${formatCurrency(
        project.natillera_details.monthly_fee_amount *
        project.natillera_details.duration_months
      )} ${project.natillera_details.monthly_fee_currency}`,
    });
    financialItems.push({
      label: 'Fecha límite de pago',
      value: new Date(
        project.natillera_details.payment_deadline_at
      ).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    });
  } else if (project.tokenization_details) {
    financialItems.push({
      label: 'Total de Tokens',
      value: formatCurrency(project.tokenization_details.total_tokens),
    });
    financialItems.push({
      label: 'Símbolo del Token',
      value: project.tokenization_details.token_symbol,
    });
    if (project.tokenization_details.presale_enabled) {
      financialItems.push({
        label: 'Preventa',
        value: 'Habilitada',
      });
    }
  }

  financialItems.push({
    label: 'Creado el',
    value: new Date(project.created_at).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  });

  const gradients = {
    natillera: 'linear-gradient(135deg, #E568DB 0%, #A855F7 100%)',
    tokenizacion: 'linear-gradient(135deg, #FCD116 0%, #F59E0B 100%)',
  };

  return (
    <IonPage>
      <IonContent fullscreen className="investment-details-page">
        <InvestmentHeader
          projectName={project.name}
          projectType={projectType}
          gradient={gradients[projectType]}
          onBack={handleBack}
          onShare={handleShare}
        />

        <InvestmentStats stats={stats} />

        <InvestmentFinancialInfo
          title="Información Financiera"
          items={financialItems}
        />

        {isOwner && (
          <PendingRequests
            projectId={id}
            onRequestsChange={fetchProjectDetails}
          />
        )}

        <MembersList
          projectId={id}
          isOwner={isOwner}
          onMembersChange={fetchProjectDetails}
        />

        <InvestmentDescription
          description={project.description_rich || undefined}
          highlights={project.highlights_rich || undefined}
        />

        {project.owner_user && (
          <div className="investment-section">
            <h2 className="section-title">Creador</h2>
            <div className="owner-info">
              <div className="owner-avatar">
                {(project.owner_user.displayName || project.owner_user.username || 'U')
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="owner-details">
                <span className="owner-name">
                  {project.owner_user.displayName || project.owner_user.username || 'Usuario'}
                </span>
                <span className="owner-username">
                  @{project.owner_user.username}
                </span>
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default InvestmentDetailsPage;
