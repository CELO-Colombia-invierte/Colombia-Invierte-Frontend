import React from 'react';
import { IonIcon } from '@ionic/react';
import {
  cashOutline,
  trendingUpOutline,
  flameOutline,
  calendarOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { Project } from '@/models/projects';
import './ProjectDetailTabs.css';

interface FinanzasTabProps {
  project: Project;
  showJoinButton?: boolean;
  onJoinAction?: () => void;
  joinStatus?: 'pending' | 'approved' | null;
}

export const FinanzasTab: React.FC<FinanzasTabProps> = ({
  project,
  showJoinButton,
  onJoinAction,
  joinStatus,
}) => {
  const formatCurrency = (amount: number): string => {
    return Number(amount).toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isNatillera = project.type === 'NATILLERA';
  const financialItems = [];

  if (isNatillera && project.natillera_details) {
    const details = project.natillera_details;

    financialItems.push({
      icon: cashOutline,
      label: 'Valor de la cuota mensual',
      value: `${formatCurrency(details.monthly_fee_amount)} ${details.monthly_fee_currency}`,
      tooltip: 'Cantidad que debes aportar cada mes',
      iconColor: '#10B981',
    });

    financialItems.push({
      icon: trendingUpOutline,
      label: 'Rendimiento anual esperado',
      value: `${details.expected_annual_return_pct}%`,
      tooltip: 'Porcentaje de retorno estimado al año',
      iconColor: '#667eea',
    });

    financialItems.push({
      icon: flameOutline,
      label: 'Cantidad de meses',
      value: `${details.duration_months} Meses`,
      tooltip: 'Duración total del proyecto de ahorro',
      iconColor: '#F59E0B',
    });

    financialItems.push({
      icon: calendarOutline,
      label: 'Fecha máxima de pago mensual',
      value: formatDate(details.payment_deadline_at),
      tooltip: 'Fecha límite para realizar el pago mensual',
      iconColor: '#8B5CF6',
    });
  } else if (project.tokenization_details) {
    const details = project.tokenization_details;

    financialItems.push({
      icon: cashOutline,
      label: 'Valor del Activo',
      value: `${formatCurrency(details.asset_value_amount)} ${details.asset_value_currency}`,
      tooltip: 'Valor total del activo tokenizado',
      iconColor: '#10B981',
    });

    financialItems.push({
      icon: trendingUpOutline,
      label: 'Rendimiento Esperado',
      value: `${details.expected_annual_return_pct}%`,
      tooltip: 'Porcentaje de retorno estimado',
      iconColor: '#667eea',
    });

    financialItems.push({
      icon: cashOutline,
      label: 'Precio por Token',
      value: `${formatCurrency(details.price_per_token_amount)} ${details.price_per_token_currency}`,
      tooltip: 'Costo de cada token individual',
      iconColor: '#8B5CF6',
    });

    financialItems.push({
      icon: flameOutline,
      label: 'Total de Tokens',
      value: formatCurrency(details.total_tokens),
      tooltip: 'Cantidad total de tokens disponibles',
      iconColor: '#F59E0B',
    });

    if (details.presale_enabled && details.presale_starts_at) {
      financialItems.push({
        icon: calendarOutline,
        label: 'Inicio de Preventa',
        value: formatDate(details.presale_starts_at),
        tooltip: 'Fecha de inicio de la preventa',
        iconColor: '#06B6D4',
      });
    }

    if (details.public_sale_starts_at) {
      financialItems.push({
        icon: calendarOutline,
        label: 'Venta Pública',
        value: formatDate(details.public_sale_starts_at),
        tooltip: 'Fecha de inicio de la venta pública',
        iconColor: '#8B5CF6',
      });
    }
  }

  return (
    <div className="finanzas-tab">
      <h2 className="finanzas-title">Información financiera</h2>

      <div className="finanzas-items">
        {financialItems.map((item, index) => (
          <div key={index} className="finanzas-item">
            <div className="finanzas-icon" style={{ color: item.iconColor }}>
              <IonIcon icon={item.icon} />
            </div>
            <div className="finanzas-content">
              <div className="finanzas-label-wrapper">
                <span className="finanzas-label">{item.label}</span>
                <div className="finanzas-tooltip">
                  <IonIcon icon={informationCircleOutline} />
                  <span className="tooltip-text">{item.tooltip}</span>
                </div>
              </div>
              <span className="finanzas-value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      {showJoinButton && (
        <div className="finanzas-actions">
          <button
            className="action-button secondary"
            onClick={() => window.history.back()}
          >
            Tal vez en otro momento.
          </button>
          <button
            className="action-button primary"
            onClick={onJoinAction}
            disabled={joinStatus === 'pending' || joinStatus === 'approved'}
          >
            {joinStatus === 'pending'
              ? 'Solicitud Enviada'
              : joinStatus === 'approved'
                ? 'Ya eres miembro'
                : `Unirme a la ${project.type === 'NATILLERA' ? 'Natillera' : 'Tokenización'}`}
          </button>
        </div>
      )}
    </div>
  );
};
