import React, { useState } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { arrowBackOutline } from 'ionicons/icons';
import ContactSearchStep from '../components/ContactSearchStep';
import CuentaMontoStep from '../components/CuentaMontoStep';
import './CuentaTransferPage.css';

export type CuentaTransferStep = 'search' | 'amount' | 'status';

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
      default:
        history.goBack();
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
    setStep('status');
  };

  const goToComprobante = () => {
    history.replace('/comprobante', {
      transactionNumber: Math.floor(Math.random() * 900000000 + 100000000).toString(),
      dateTime: new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'medium' }),
      originName: 'Usuario',
      originAccount: '—',
      destinationAccount: 'Cuenta Colombia Invierte',
      bank: 'Colombia Invierte',
      detail: amount?.detail || 'Transferencia entre cuentas',
      recipientName: contact!.displayName,
      amount: amount!.value,
    });
  };

  // Parámetros pendientes — se usarán al integrar modal de confirmación y estado
  void handleConfirmCancel;
  void handleConfirmAccept;
  void goToComprobante;

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
      case 'status':
        return (
          <div className="ct-placeholder">
            <p>Estado de transacción</p>
            <p className="ct-placeholder-sub">Componente en construcción</p>
          </div>
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
      </IonContent>
    </IonPage>
  );
};

export default CuentaTransferPage;
