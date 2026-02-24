import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { arrowBackOutline } from 'ionicons/icons';
import BankSelectionStep from '../components/BankSelectionStep';
import './BankTransferPage.css';

export type TransferStep = 'bank' | 'recipient' | 'amount' | 'confirm' | 'status';

export interface SelectedBank {
  id: string;
  name: string;
  color: string;
  initials: string;
}

export interface RecipientData {
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
  const [recipient, setRecipient] = useState<RecipientData | null>(null);
  const [amount, setAmount] = useState<AmountData | null>(null);

  const handleBack = () => {
    switch (step) {
      case 'bank':
        history.goBack();
        break;
      case 'recipient':
        setStep('bank');
        break;
      case 'amount':
        setStep('recipient');
        break;
      case 'confirm':
        setStep('amount');
        break;
      default:
        history.goBack();
    }
  };

  const handleBankSelect = (bank: SelectedBank) => {
    setSelectedBank(bank);
    setStep('recipient');
  };

  const renderStep = () => {
    switch (step) {
      case 'bank':
        return <BankSelectionStep onSelect={handleBankSelect} />;
      case 'recipient':
        return (
          <div className="bt-placeholder">
            <p>Paso 2: Datos del destinatario</p>
            <p className="bt-placeholder-sub">— Tarea 3</p>
          </div>
        );
      case 'amount':
        return (
          <div className="bt-placeholder">
            <p>Paso 3: Ingresar monto</p>
            <p className="bt-placeholder-sub">— Tarea 4</p>
          </div>
        );
      case 'confirm':
        return (
          <div className="bt-placeholder">
            <p>Paso 4: Confirmación</p>
            <p className="bt-placeholder-sub">— Tarea 5</p>
          </div>
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
      </IonContent>
    </IonPage>
  );
};

export default BankTransferPage;
