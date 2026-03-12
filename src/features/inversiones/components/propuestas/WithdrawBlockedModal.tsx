import React from 'react';
import { BottomSlideModal } from '@/components/ui/BottomSlideModal';

interface WithdrawBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'PENDING' | 'REJECTED';
}

export const WithdrawBlockedModal: React.FC<WithdrawBlockedModalProps> = ({ isOpen, onClose, status }) => {
  const message =
    status === 'PENDING'
      ? 'La votación aún no ha terminado. Espera a que todos los miembros voten.'
      : 'La propuesta fue rechazada. No es posible retirar el dinero.';

  return (
    <BottomSlideModal
      isOpen={isOpen}
      onClose={onClose}
      title="No puedes retirar el dinero"
      options={[
        {
          id: 'entendido',
          title: 'Entendido',
          description: message,
          onClick: onClose,
        },
      ]}
    />
  );
};
