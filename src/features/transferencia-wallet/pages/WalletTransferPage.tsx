import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { arrowBackOutline } from 'ionicons/icons';
import WalletSelectionStep, { SelectedNetwork, SelectedCoin } from '../components/WalletSelectionStep';
import WalletMontoStep, { WalletAmountData } from '../components/WalletMontoStep';
import WalletVistaPrevia from '../components/WalletVistaPrevia';
import './WalletTransferPage.css';

type WalletStep = 'selection' | 'amount';

const WalletTransferPage: React.FC = () => {
  const history = useHistory();

  const [step, setStep] = useState<WalletStep>('selection');
  const [network, setNetwork] = useState<SelectedNetwork | null>(null);
  const [coin, setCoin] = useState<SelectedCoin | null>(null);
  const [amount, setAmount] = useState<WalletAmountData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const tabBar = document.querySelector('.bottom-navbar') as HTMLElement | null;
    if (tabBar) tabBar.style.display = 'none';
    return () => {
      if (tabBar) tabBar.style.display = '';
    };
  }, []);

  const handleBack = () => {
    if (showPreview) {
      setShowPreview(false);
      return;
    }
    if (step === 'amount') {
      setStep('selection');
      return;
    }
    history.goBack();
  };

  const handleContinue = (selectedNetwork: SelectedNetwork, selectedCoin: SelectedCoin) => {
    setNetwork(selectedNetwork);
    setCoin(selectedCoin);
    setStep('amount');
  };

  const handlePreview = (data: WalletAmountData) => {
    setAmount(data);
    setShowPreview(true);
  };

  const handleConfirmTransfer = () => {
    setShowPreview(false);
    // próximo bloque: mostrar WalletEstadoModal
  };

  return (
    <IonPage>
      <IonContent className="wtp-content">
        <div className="wtp-header">
          <button className="wtp-back-btn" onClick={handleBack}>
            <IonIcon icon={arrowBackOutline} />
          </button>
          <h1 className="wtp-title">Transferir a wallet</h1>
        </div>
        <div className="wtp-body">
          {step === 'selection' && (
            <WalletSelectionStep onContinue={handleContinue} />
          )}
          {step === 'amount' && network && coin && (
            <WalletMontoStep
              network={network}
              coin={coin}
              onPreview={handlePreview}
            />
          )}
        </div>

        {showPreview && network && coin && amount && (
          <WalletVistaPrevia
            network={network}
            coin={coin}
            amount={amount}
            onCancel={() => setShowPreview(false)}
            onConfirm={handleConfirmTransfer}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default WalletTransferPage;
