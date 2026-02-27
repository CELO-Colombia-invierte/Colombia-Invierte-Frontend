import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { timeOutline, openOutline } from 'ionicons/icons';
import { Project } from '@/models/projects';
import { apiService } from '@/services/api/api.service';
import { BLOCKCHAIN_CONFIG, getBlockExplorerTxUrl } from '@/contracts/config';
import { blockchainService } from '@/services/blockchain.service';
import './ProjectDetailTabs.css';

interface BlockchainEvent {
  id: string;
  type: string;
  tx_hash: string;
  block_number: number;
  event_data: Record<string, string>;
  created_at: string;
  user?: {
    name: string | null;
    avatar_url: string | null;
  } | null;
}

interface HistorialTabProps {
  project: Project;
}

const PAGE_SIZE = 20;

export const HistorialTab: React.FC<HistorialTabProps> = ({ project }) => {
  const [events, setEvents] = useState<BlockchainEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const isNatillera = project.type === 'NATILLERA';
  const isV2 = !!(project.natillera_address || project.vault_address);
  const eventType = isNatillera
    ? (isV2 ? 'QUOTA_PAID' : 'DEPOSIT')
    : (isV2 ? 'INVESTED' : 'TOKENS_PURCHASED');

  const loadEvents = async (offset: number, append: boolean) => {
    if (offset === 0) setLoading(true);
    else setLoadingMore(true);
    try {
      const response = await apiService.get<{ events: BlockchainEvent[]; total: number }>(
        `/projects/${project.id}/events?type=${eventType}&limit=${PAGE_SIZE}&offset=${offset}`,
      );
      const { events: fetched, total: fetchedTotal } = response.data;
      setTotal(fetchedTotal);
      setEvents(prev => (append ? [...prev, ...fetched] : fetched));
    } catch {
      // silenciar
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadEvents(0, false);
  }, [project.id]);

  const formatAddress = (address: string) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '—';

  const formatUsdc = (amount: string) =>
    blockchainService.formatUnits(BigInt(amount || '0'), BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <div className="historial-tab">
        <h2 className="historial-title">{isNatillera ? 'Historial de depósitos' : 'Historial de compras'}</h2>
        <div className="historial-loading">
          <p>Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="historial-tab">
      <h2 className="historial-title">
        {isNatillera ? 'Historial de depósitos' : 'Historial de compras'}
      </h2>

      {events.length === 0 ? (
        <div className="historial-empty">
          <IonIcon icon={timeOutline} className="empty-icon" />
          <p className="empty-text">Sin historial aún</p>
          <p className="empty-subtext">
            {isNatillera
              ? 'Los depósitos realizados aparecerán aquí'
              : 'Las compras de tokens aparecerán aquí'}
          </p>
        </div>
      ) : (
        <>
          <div className="historial-list">
            {events.map(event => (
              <div key={event.id} className="historial-item">
                <div className="historial-item-main">
                  <div className="historial-address-container">
                    {event.user?.avatar_url ? (
                      <img src={event.user.avatar_url} alt="avatar" className="historial-avatar" />
                    ) : (
                      <div className="historial-avatar-placeholder">
                        {event.user?.name ? event.user.name.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    <span className="historial-address" style={{ fontWeight: event.user?.name ? '500' : 'normal' }}>
                      {event.user?.name || formatAddress(event.event_data.member || event.event_data.user || event.event_data.buyer)}
                    </span>
                  </div>
                  <span className="historial-amount">
                    {isNatillera
                      ? event.event_data.amount
                        ? `${formatUsdc(event.event_data.amount)} USDC`
                        : `Mes ${Number(event.event_data.monthId ?? 0) + 1} · ${project.natillera_details?.monthly_fee_amount?.toLocaleString('es-CO')} ${project.natillera_details?.monthly_fee_currency ?? 'COP'}`
                      : `${Number(event.event_data.amount || '0').toLocaleString('es-CO')} tokens · ${formatUsdc(event.event_data.paid)} USDC`}
                  </span>
                </div>
                <div className="historial-item-meta">
                  <span className="historial-date">{formatDate(event.created_at)}</span>
                  <a
                    href={getBlockExplorerTxUrl(event.tx_hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="historial-tx-link"
                  >
                    <IonIcon icon={openOutline} />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {events.length < total && (
            <button
              className="historial-load-more"
              onClick={() => loadEvents(events.length, true)}
              disabled={loadingMore}
            >
              {loadingMore ? 'Cargando...' : `Ver más (${total - events.length} restantes)`}
            </button>
          )}
        </>
      )}
    </div>
  );
};
