import React, { useEffect, useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { projectsService } from '@/services/projects';
import { apiService } from '@/services/api/api.service';
import { blockchainService } from '@/services/blockchain.service';
import { BLOCKCHAIN_CONFIG } from '@/contracts/config';
import { Project } from '@/models/projects';
import './CuotasPage.css';

interface BlockchainEvent {
  id: string;
  type: string;
  tx_hash: string;
  event_data: Record<string, string>;
  created_at: string;
  user?: { name: string | null; avatar_url: string | null } | null;
}

const PAGE_SIZE = 30;

const CuotasPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [project, setProject] = useState<Project | null>(null);
  const [events, setEvents] = useState<BlockchainEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await projectsService.findOne(id);
        setProject(data);

        const isV2 = !!(data.natillera_address);
        const eventType = isV2 ? 'QUOTA_PAID' : 'DEPOSIT';

        const response = await apiService.get<{ events: BlockchainEvent[]; total: number }>(
          `/projects/${data.id}/events?type=${eventType}&limit=${PAGE_SIZE}&offset=0`,
        );
        setEvents(response.data.events);
        setTotal(response.data.total);

        if (data.natillera_address) {
          blockchainService.getNatilleraV2State(data.natillera_address).then((state) => {
            setMemberCount(Number(state.memberCount));
            setCurrentMonth(Number(state.currentMonth));
          }).catch(() => {});
        }
      } catch {
        history.goBack();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const loadMore = async () => {
    if (!project) return;
    setLoadingMore(true);
    const isV2 = !!(project.natillera_address);
    const eventType = isV2 ? 'QUOTA_PAID' : 'DEPOSIT';
    try {
      const response = await apiService.get<{ events: BlockchainEvent[]; total: number }>(
        `/projects/${project.id}/events?type=${eventType}&limit=${PAGE_SIZE}&offset=${events.length}`,
      );
      setEvents((prev) => [...prev, ...response.data.events]);
    } finally {
      setLoadingMore(false);
    }
  };

  const formatAmount = (event: BlockchainEvent) => {
    if (event.event_data.amount) {
      const usdc = blockchainService.formatUnits(
        BigInt(event.event_data.amount),
        BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS,
      );
      return `+${Number(usdc).toLocaleString('es-CO')} USDC`;
    }
    const monthly = project?.natillera_details?.monthly_fee_amount;
    const currency = project?.natillera_details?.monthly_fee_currency ?? 'COP';
    if (monthly) {
      return `+${monthly.toLocaleString('es-CO')} ${currency}`;
    }
    return '';
  };

  const formatSubtitle = (event: BlockchainEvent) => {
    const username = event.user?.name ?? null;
    const monthId = event.event_data.monthId != null
      ? Number(event.event_data.monthId) + 1
      : null;
    const userPart = username ? `@${username}` : 'Participante';
    const monthPart = monthId != null ? ` ha pagado el mes ${monthId}` : ' ha realizado un pago';
    return `${userPart}${monthPart}`;
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const allPaid =
    memberCount != null &&
    currentMonth != null &&
    total >= memberCount * (currentMonth + 1);

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <div className="cuotas-loading">
            <p>Cargando...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen className="cuotas-page">
        <div className="cuotas-header">
          <button className="cuotas-back-btn" onClick={() => history.goBack()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="cuotas-title">Cuotas</h1>
        </div>

        <div className="cuotas-content">
          {memberCount != null && (
            <div className={`cuotas-status-banner ${allPaid ? 'cuotas-status-banner--success' : 'cuotas-status-banner--warning'}`}>
              <div className="cuotas-status-icon">
                {allPaid ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" fill="#22c55e" stroke="none" />
                    <polyline points="20 6 9 17 4 12" stroke="white" strokeWidth="2.5" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" fill="#f59e0b" stroke="none" />
                    <line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2" />
                    <line x1="12" y1="16" x2="12.01" y2="16" stroke="white" strokeWidth="2" />
                  </svg>
                )}
              </div>
              <div className="cuotas-status-text">
                <p className="cuotas-status-title">
                  {allPaid ? 'No hay cuotas por pagar' : 'Hay cuotas pendientes'}
                </p>
                <p className="cuotas-status-subtitle">
                  {allPaid
                    ? 'Todas las cuotas ya han sido pagadas por todos los participantes'
                    : 'Algunos participantes aún tienen cuotas por pagar'}
                </p>
              </div>
            </div>
          )}

          {events.length > 0 && (
            <div className="cuotas-movimientos">
              <h2 className="cuotas-movimientos-title">Movimientos</h2>
              <div className="cuotas-list">
                {events.map((event) => (
                  <div key={event.id} className="cuota-item">
                    <div className="cuota-item-icon">
                      <span>$</span>
                    </div>
                    <div className="cuota-item-info">
                      <p className="cuota-item-name">Pago de cuota</p>
                      <p className="cuota-item-sub">{formatSubtitle(event)}</p>
                    </div>
                    <div className="cuota-item-right">
                      <p className="cuota-item-amount">{formatAmount(event)}</p>
                      <p className="cuota-item-date">{formatDate(event.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {events.length < total && (
                <button
                  className="cuotas-load-more"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Cargando...' : `Ver más (${total - events.length} restantes)`}
                </button>
              )}
            </div>
          )}

          {events.length === 0 && (
            <div className="cuotas-empty">
              <p>Sin movimientos aún</p>
              <p className="cuotas-empty-sub">Los pagos de cuota aparecerán aquí</p>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CuotasPage;
