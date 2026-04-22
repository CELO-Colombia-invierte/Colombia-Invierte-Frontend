import React from 'react';
import { TransactionDto } from '@/services/transactions';
import { TransactionItem } from './TransactionItem';
import './TransactionList.css';

interface TransactionListProps {
  transactions: TransactionDto[];
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
}) => {
  if (transactions.length === 0) {
    return (
      <div className="transaction-list-empty">
        <p>No hay movimientos aún</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      {transactions.map((tx) => (
        <TransactionItem key={tx.id} transaction={tx} />
      ))}
    </div>
  );
};

export default TransactionList;
