import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import {
  timeOutline,
  openOutline,
  arrowDownCircleOutline,
  arrowUpCircleOutline,
  flagOutline,
  checkmarkDoneCircleOutline,
  cashOutline,
  closeCircleOutline,
} from 'ionicons/icons';
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

const TOKENIZATION_V2_TYPES = [
  'INVESTED',
  'VAULT_RELEASED',
  'REVENUE_DEPOSITED',
  'REVENUE_CLAIMED',
  'MILESTONE_EXECUTED',
  'SALE_FINALIZED',
  'REFUNDED',
].join(',');

interface Display {
  icon: string;
  iconColor: string;
  label: string;
  amount: string | null;
  direction: 'in' | 'out' | 'neutral';
  who: string | null;
}

const formatUsdc = (amount?: string) =>
  amount ? blockchainService.formatUnits(BigInt(amount), BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS) : '0';

const formatAddress = (address?: string) =>
  address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '—';

const describeTokenizationEvent = (e: BlockchainEvent): Display | null => {
  const d = e.event_data ?? {};
  switch (e.type) {
    case 'INVESTED':
      return {
        icon: arrowDownCircleOutline,
        iconColor: '#16a34a',
        label: 'Inversión recibida',
        amount: d.amount ? `+${formatUsdc(d.amount)} USDC` : null,
        direction: 'in',
        who: d.investor ?? d.user ?? null,
      };
    case 'SALE_FINALIZED':
      return {
        icon: checkmarkDoneCircleOutline,
        iconColor: '#4F6BFF',
        label: 'Venta finalizada (30% al treasury)',
        amount: null,
        direction: 'neutral',
        who: null,
      };
    case 'VAULT_RELEASED': {
      const receiver = (d.receiver ?? d.to ?? '').toLowerCase();
      const treasury = BLOCKCHAIN_CONFIG.CONTRACTS.FEE_TREASURY.toLowerCase();
      const isFee = receiver === treasury;
      return {
        icon: arrowUpCircleOutline,
        iconColor: '#dc2626',
        label: isFee ? 'Comisión cobrada por el treasury' : 'Salida del vault',
        amount: d.amount ? `−${formatUsdc(d.amount)} USDC` : null,
        direction: 'out',
        who: d.receiver ?? d.to ?? null,
      };
    }
    case 'MILESTONE_EXECUTED':
      return {
        icon: flagOutline,
        iconColor: '#dc2626',
        label: 'Hito ejecutado',
        amount: d.amount ? `−${formatUsdc(d.amount)} USDC` : null,
        direction: 'out',
        who: d.recipient ?? null,
      };
    case 'REVENUE_DEPOSITED':
      return {
        icon: cashOutline,
        iconColor: '#16a34a',
        label: 'Rendimientos depositados',
        amount: d.amount ? `+${formatUsdc(d.amount)} USDC` : null,
        direction: 'in',
        who: null,
      };
    case 'REVENUE_CLAIMED':
      return {
        icon: arrowUpCircleOutline,
        iconColor: '#dc2626',
        label: 'Rendimientos cobrados',
        amount: d.amount ? `−${formatUsdc(d.amount)} USDC` : null,
        direction: 'out',
        who: d.user ?? null,
      };
    case 'REFUNDED':
      return {
        icon: closeCircleOutline,
        iconColor: '#dc2626',
        label: 'Reembolso',
        amount: d.amount ? `−${formatUsdc(d.amount)} USDC` : null,
        direction: 'out',
        who: d.user ?? null,
      };
    default:
      return null;
  }
};

const describeNatilleraEvent = (e: BlockchainEvent): Display | null => {
  const d = e.event_data ?? {};
  switch (e.type) {
    case 'QUOTA_PAID':
      return {
        icon: arrowDownCircleOutline,
        iconColor: '#16a34a',
        label: `Cuota pagada · Mes ${Number(d.monthId ?? 0) + 1}`,
        amount: d.amount ? `+${formatUsdc(d.amount)} USDC` : null,
        direction: 'in',
        who: d.member ?? null,
      };
    case 'JOINED':
      return {
        icon: checkmarkDoneCircleOutline,
        iconColor: '#4F6BFF',
        label: 'Miembro se unió',
        amount: null,
        direction: 'neutral',
        who: d.member ?? null,
      };
    case 'NATILLERA_CLAIMED':
      return {
        icon: arrowUpCircleOutline,
        iconColor: '#dc2626',
        label: 'Retiro de pozo',
        amount: d.amount ? `−${formatUsdc(d.amount)} USDC` : null,
        direction: 'out',
        who: d.member ?? null,
      };
    default:
      return null;
  }
};

export const HistorialTab: React.FC<HistorialTabProps> = ({ project }) => {
  const [events, setEvents] = useState<BlockchainEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const isNatillera = project.type === 'NATILLERA';
  const isV2 = !!(project.natillera_address || project.vault_address);

  const filter = isNatillera
    ? (isV2 ? 'QUOTA_PAID,JOINED,NATILLERA_CLAIMED' : 'DEPOSIT')
    : (isV2 ? TOKENIZATION_V2_TYPES : 'TOKENS_PURCHASED');

  const loadEvents = async (offset: number, append: boolean) => {
    if (offset === 0) setLoading(true);
    else setLoadingMore(true);
    try {
      const response = await apiService.get<{ events: BlockchainEvent[]; total: number }>(
        `/projects/${project.id}/events?type=${filter}&limit=${PAGE_SIZE}&offset=${offset}`,
      );
      const { events: fetched, total: fetchedTotal } = response.data;
      setTotal(fetchedTotal);
      setEvents(prev => (append ? [...prev, ...fetched] : fetched));
    } catch {
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadEvents(0, false);
  }, [project.id]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <div className="historial-tab">
        <h2 className="historial-title">Historial de movimientos</h2>
        <div className="historial-loading">
          <p>Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="historial-tab">
      <h2 className="historial-title">Historial de movimientos</h2>

      {events.length === 0 ? (
        <div className="historial-empty">
          <IonIcon icon={timeOutline} className="empty-icon" />
          <p className="empty-text">Sin movimientos aún</p>
          <p className="empty-subtext">Las entradas y salidas de fondos aparecerán aquí.</p>
        </div>
      ) : (
        <>
          <div className="historial-list">
            {events.map(event => {
              const display = isNatillera
                ? describeNatilleraEvent(event)
                : describeTokenizationEvent(event);
              if (!display) return null;
              return (
                <div key={event.id} className="historial-item">
                  <div className="historial-item-main" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <IonIcon icon={display.icon} style={{ color: display.iconColor, fontSize: 26 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="historial-address" style={{ fontWeight: 600 }}>{display.label}</div>
                      {(display.who || event.user?.name) && (
                        <div style={{ fontSize: 12, color: '#666' }}>
                          {event.user?.name ?? formatAddress(display.who ?? undefined)}
                        </div>
                      )}
                    </div>
                    {display.amount && (
                      <span
                        className="historial-amount"
                        style={{
                          color: display.direction === 'in' ? '#16a34a' : display.direction === 'out' ? '#dc2626' : '#333',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {display.amount}
                      </span>
                    )}
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
              );
            })}
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
