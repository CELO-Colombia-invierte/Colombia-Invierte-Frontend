import React, { useEffect } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { arrowBackOutline } from 'ionicons/icons';
import QRCode from 'react-qr-code';
import { useAuth } from '@/hooks/use-auth';
import { useBlockchain } from '@/hooks/use-blockchain';
import './RecibirAmigoPage.css';

const MOCK_NETWORK = 'CELO';

const truncateAddress = (addr: string): string =>
  addr.length > 16 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr;

const IconShare = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const RecibirAmigoPage: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const { account } = useBlockchain();

  const displayName = user?.getDisplayName() || 'Usuario';
  const alias = user?.username ? `@${user.username}` : '—';
  const address = account?.address || '—';
  const qrValue = user?.username
    ? `https://colombiainvierte.app/pagar/${user.username}`
    : 'https://colombiainvierte.app';

  useEffect(() => {
    const tabBar = document.querySelector('.bottom-navbar') as HTMLElement | null;
    if (tabBar) tabBar.style.display = 'none';
    return () => {
      if (tabBar) tabBar.style.display = '';
    };
  }, []);

  return (
    <IonPage>
      <IonContent className="ra-content">
        <div className="ra-header">
          <button className="ra-back-btn" onClick={() => history.goBack()}>
            <IonIcon icon={arrowBackOutline} />
          </button>
          <h1 className="ra-title">Mi código QR</h1>
        </div>

        <div className="ra-body">
          {/* QR */}
          <div className="ra-qr-wrap">
            <QRCode
              value={qrValue}
              size={200}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
            />
          </div>

          <p className="ra-scan-label">Escanea el código para pagar a:</p>

          <div className="ra-divider" />

          {/* Info rows */}
          <div className="ra-info">
            <div className="ra-info-row">
              <span className="ra-info-label">Nombre:</span>
              <span className="ra-info-value">{displayName}</span>
            </div>
            <div className="ra-info-row">
              <span className="ra-info-label">Alias:</span>
              <span className="ra-info-value">{alias}</span>
            </div>
            <div className="ra-info-row">
              <span className="ra-info-label">Address:</span>
              <span className="ra-info-value ra-info-value--mono">
                {truncateAddress(address)}
              </span>
            </div>
            <div className="ra-info-row">
              <span className="ra-info-label">Red preferencial:</span>
              <span className="ra-info-value">{MOCK_NETWORK}</span>
            </div>
          </div>
        </div>

        {/* Botón Compartir — Próximamente */}
        <div className="ra-footer">
          <button className="ra-share-btn" disabled>
            <IconShare />
            <span>Compartir</span>
            <span className="ra-soon-badge">Próximamente</span>
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RecibirAmigoPage;
