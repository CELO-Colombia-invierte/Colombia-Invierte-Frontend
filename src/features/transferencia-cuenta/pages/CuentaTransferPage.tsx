import React, { useState } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { arrowBackOutline } from 'ionicons/icons';
import ContactSearchStep from '../components/ContactSearchStep';
import CuentaMontoStep from '../components/CuentaMontoStep';
import CuentaConfirmacionModal from '../components/CuentaConfirmacionModal';
import EstadoTransaccionModal from '../../transferencia-banco/components/EstadoTransaccionModal';
import './CuentaTransferPage.css';

export type CuentaTransferStep = 'search' | 'amount';

export interface ContactData {
  id: string;
  username: string;
  displayName: string;
  initials: string;
  avatarColor: string;
}

export interface AmountData {
  value: number;
  detail: string;
}

const MOCK_BALANCE = 1_095_867;

const CuentaTransferPage: React.FC = () => {
  const history = useHistory();

  const [step, setStep] = useState<CuentaTransferStep>('search');
  const [contact, setContact] = useState<ContactData | null>(null);
  const [amount, setAmount] = useState<AmountData | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);

  const handleBack = () => {
    if (showConfirmModal) {
      setShowConfirmModal(false);
      return;
    }
    switch (step) {
      case 'search':
        history.goBack();
        break;
      case 'amount':
        setStep('search');
        break;
    }
  };

  const handleContactSelect = (selectedContact: ContactData) => {
    setContact(selectedContact);
    setStep('amount');
  };

  const handleAmountNext = (data: AmountData) => {
    setAmount(data);
    setShowConfirmModal(true);
  };

  const handleConfirmCancel = () => {
    setShowConfirmModal(false);
  };

  const handleConfirmAccept = () => {
    setShowConfirmModal(false);
    setShowEstadoModal(true);
  };

  const goToComprobante = () => {
    history.replace('/comprobante', {
      transactionNumber: Math.floor(Math.random() * 900000000 + 100000000).toString(),
      dateTime: new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'medium' }),
      originName: 'Usuario',
      originAccount: '—',
      destinationAccount: contact!.id,
      bank: 'Colombia Invierte',
      detail: amount?.detail || 'Transferencia entre cuentas',
      recipientName: contact!.displayName,
      amount: amount!.value,
    });
  };

  const renderStep = () => {
    switch (step) {
      case 'search':
        return <ContactSearchStep onSelect={handleContactSelect} />;
      case 'amount':
        return (
          <CuentaMontoStep
            contact={contact!}
            balance={MOCK_BALANCE}
            onNext={handleAmountNext}
          />
        );
    }
  };

  return (
    <IonPage>
      <IonContent className="ct-content">
        <div className="ct-header">
          <button className="ct-back-btn" onClick={handleBack}>
            <IonIcon icon={arrowBackOutline} />
          </button>
          <h1 className="ct-title">Transferir dinero</h1>
        </div>
        <div className="ct-body">
          {renderStep()}
        </div>

        {showConfirmModal && contact && amount && (
          <CuentaConfirmacionModal
            contact={contact}
            amount={amount}
            onCancel={handleConfirmCancel}
            onConfirm={handleConfirmAccept}
          />
        )}

        {showEstadoModal && (
          <EstadoTransaccionModal
            status="success"
            onViewReceipt={goToComprobante}
            onDone={() => history.replace('/home')}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default CuentaTransferPage;
