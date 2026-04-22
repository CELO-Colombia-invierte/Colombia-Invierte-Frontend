import React from 'react';
import { IonIcon } from '@ionic/react';
import {
  arrowDownOutline,
  arrowUpOutline,
  cashOutline,
  peopleOutline,
  trendingUpOutline,
  walletOutline,
} from 'ionicons/icons';
import { TransactionDto, TransactionType } from '@/services/transactions';
import {
  BLOCKCHAIN_CONFIG,
  getBlockExplorerAddressUrl,
  getBlockExplorerTxUrl,
} from '@/contracts/config';
import './TransactionItem.css';

interface TransactionItemProps {
  transaction: TransactionDto;
}

const TYPE_LABELS: Record<TransactionType, string> = {
  QUOTA_PAID: 'Pago de cuota',
  VAULT_DEPOSITED: 'Depósito al vault',
  VAULT_RELEASED: 'Retiro del vault',
  INVESTED: 'Inversión',
  REVENUE_CLAIMED: 'Rentabilidad reclamada',
  NATILLERA_CLAIMED: 'Natillera reclamada',
  JOINED: 'Unión al proyecto',
  REFUNDED: 'Reembolso',
};

const TYPE_ICONS: Record<TransactionType, string> = {
  QUOTA_PAID: cashOutline,
  VAULT_DEPOSITED: arrowUpOutline,
  VAULT_RELEASED: arrowDownOutline,
  INVESTED: trendingUpOutline,
  REVENUE_CLAIMED: trendingUpOutline,
  NATILLERA_CLAIMED: walletOutline,
  JOINED: peopleOutline,
  REFUNDED: arrowDownOutline,
};

const truncate = (value: string, head = 6, tail = 4) =>
  value.length <= head + tail + 3
    ? value
    : `${value.slice(0, head)}...${value.slice(-tail)}`;

const formatAmount = (raw: string | null): string | null => {
  if (!raw) return null;
  try {
    const divisor = 10 ** BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS;
    const value = Number(raw) / divisor;
    return value.toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return null;
  }
};

const formatRelativeDate = (iso: string): string => {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'hace un momento';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} d`;
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
}) => {
  const { type, tx_hash, project, amount, counterparty, direction, created_at } =
    transaction;

  const label = TYPE_LABELS[type] ?? type;
  const icon = TYPE_ICONS[type] ?? cashOutline;
  const formattedAmount = formatAmount(amount);
  const sign = direction === 'in' ? '+' : direction === 'out' ? '-' : '';

  return (
    <div className="transaction-item">
      <div className={`transaction-item-icon direction-${direction}`}>
        <IonIcon icon={icon} />
      </div>
      <div className="transaction-item-main">
        <div className="transaction-item-row">
          <span className="transaction-item-title">
            {label}
            {project ? ` — ${project.name}` : ''}
          </span>
          {formattedAmount && (
            <span className={`transaction-item-amount direction-${direction}`}>
              {sign}
              {formattedAmount} USDT
            </span>
          )}
        </div>
        <div className="transaction-item-row secondary">
          <div className="transaction-item-meta">
            <a
              href={getBlockExplorerTxUrl(tx_hash)}
              target="_blank"
              rel="noreferrer noopener"
              className="transaction-item-link"
              onClick={(e) => e.stopPropagation()}
            >
              {truncate(tx_hash, 8, 6)}
            </a>
            {counterparty && (
              <>
                <span className="transaction-item-sep">·</span>
                <a
                  href={getBlockExplorerAddressUrl(counterparty)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="transaction-item-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  {truncate(counterparty)}
                </a>
              </>
            )}
          </div>
          <span className="transaction-item-date">
            {formatRelativeDate(created_at)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;
