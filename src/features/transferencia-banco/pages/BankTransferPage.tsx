import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { arrowBackOutline } from 'ionicons/icons';
import BankSelectionStep from '../components/BankSelectionStep';
import DestinatarioStep from '../components/DestinatarioStep';
import MontoStep from '../components/MontoStep';
import ConfirmacionModal from '../components/ConfirmacionModal';
import './BankTransferPage.css';

const MOCK_BALANCE = 1_095_867; // COP — reemplazar con dato real del back

export type TransferStep = 'bank' | 'destinatario' | 'amount' | 'status';

export interface SelectedBank {
  id: string;
  name: string;
  color: string;
  initials: string;
}

export interface DestinatarioData {
  accountNumber: string;
  fullName: string;
}

export interface AmountData {
  value: number;
  detail: string;
}

const BankTransferPage: React.FC = () => {
  const history = useHistory();

  const [step, setStep] = useState<TransferStep>('bank');
  const [selectedBank, setSelectedBank] = useState<SelectedBank | null>(null);
  const [destinatario, setDestinatario] = useState<DestinatarioData | null>(null);
  const [amount, setAmount] = useState<AmountData | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const tabBar = document.querySelector('.bottom-navbar') as HTMLElement | null;
    if (tabBar) tabBar.style.display = 'none';
    return () => {
      if (tabBar) tabBar.style.display = '';
    };
  }, []);

  const handleBack = () => {
    if (showConfirmModal) {
      setShowConfirmModal(false);
      return;
    }
    switch (step) {
      case 'bank':
        history.goBack();
        break;
      case 'destinatario':
        setStep('bank');
        break;
      case 'amount':
        setStep('destinatario');
        break;
      default:
        history.goBack();
    }
  };

  const handleBankSelect = (bank: SelectedBank) => {
    setSelectedBank(bank);
    setStep('destinatario');
  };

  const handleDestinatarioNext = (data: DestinatarioData) => {
    setDestinatario(data);
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

  const renderStep = () => {
    switch (step) {
      case 'bank':
        return <BankSelectionStep onSelect={handleBankSelect} />;
      case 'destinatario':
        return <DestinatarioStep bank={selectedBank!} onNext={handleDestinatarioNext} />;
      case 'amount':
        return (
          <MontoStep
            bank={selectedBank!}
            destinatario={destinatario!}
            balance={MOCK_BALANCE}
            onNext={handleAmountNext}
          />
        );
      case 'status':
        return (
          <div className="bt-placeholder">
            <p>Paso 5: Estado de la transacción</p>
            <p className="bt-placeholder-sub">— Tarea 6</p>
          </div>
        );
    }
  };

  return (
    <IonPage>
      <IonContent className="bt-content">
        <div className="bt-header">
          <button className="bt-back-btn" onClick={handleBack}>
            <IonIcon icon={arrowBackOutline} />
          </button>
          <h1 className="bt-title">Transferir dinero</h1>
        </div>
        <div className="bt-body">
          {renderStep()}
        </div>

        {/* Modal de confirmacion — overlay sobre el step actual */}
        {showConfirmModal && amount && destinatario && selectedBank && (
          <ConfirmacionModal
            bank={selectedBank}
            destinatario={destinatario}
            amount={amount}
            onCancel={handleConfirmCancel}
            onConfirm={handleConfirmAccept}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default BankTransferPage;
