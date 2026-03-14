import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { arrowBackOutline } from 'ionicons/icons';
import QRCode from 'react-qr-code';
import { useBlockchain } from '@/hooks/use-blockchain';
import './RecibirWalletPage.css';

const NETWORKS = [
  { id: 'celo',       name: 'Celo' },
  { id: 'bnb-smart',  name: 'BNB Smart Chain (BEP20)',  soon: true },
  { id: 'avax',       name: 'AVAX C-Chain',              soon: true },
  { id: 'bnb-beacon', name: 'BNB Beacon Chain (BEP2)',   soon: true },
  { id: 'ethereum',   name: 'Ethereum',                  soon: true },
  { id: 'polygon',    name: 'Polygon',                   soon: true },
  { id: 'solana',     name: 'Solana',                    soon: true },
];

const COINS = [
  { id: 'celo', name: 'Celo', symbol: 'cCOP', balance: 2000, usdValue: 147.40, color: '#FCCC00', initials: 'C' },
  { id: 'bitcoin',  name: 'Bitcoin',      symbol: 'BTC',  color: '#F7931A', initials: 'B', soon: true },
  { id: 'eth',      name: 'Ethereum',     symbol: 'ETH',  color: '#627EEA', initials: 'E', soon: true },
  { id: 'tether',   name: 'Tether',       symbol: 'USDT', color: '#26A17B', initials: 'T', soon: true },
  { id: 'bnb',      name: 'Binance Coin', symbol: 'BNB',  color: '#F3BA2F', initials: 'B', soon: true },
  { id: 'usdc',     name: 'USD Coin',     symbol: 'USDC', color: '#2775CA', initials: 'U', soon: true },
  { id: 'busd',     name: 'Binance USD',  symbol: 'BUSD', color: '#F0B90B', initials: 'B', soon: true },
];

const truncateAddress = (addr: string): string =>
  addr.length > 20 ? `${addr.slice(0, 10)}...${addr.slice(-8)}` : addr;

const IconCopy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconChevron: React.FC<{ open: boolean }> = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconShare = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const MOCK_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44';

const RecibirWalletPage: React.FC = () => {
  const history = useHistory();
  const { account } = useBlockchain();

  const address = account?.address || MOCK_ADDRESS;
  const [copied, setCopied] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [coinOpen, setCoinOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
  const [selectedCoin] = useState(COINS[0]);

  useEffect(() => {
    const tabBar = document.querySelector('.bottom-navbar') as HTMLElement | null;
    if (tabBar) tabBar.style.display = 'none';
    return () => { if (tabBar) tabBar.style.display = ''; };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleNetworkSelect = (net: typeof NETWORKS[0]) => {
    if ((net as any).soon) return;
    setSelectedNetwork(net);
    setNetworkOpen(false);
  };

  return (
    <IonPage>
      <IonContent className="rw-content">

        <div className="rw-header">
          <button className="rw-back-btn" onClick={() => history.goBack()}>
            <IonIcon icon={arrowBackOutline} />
          </button>
          <h1 className="rw-title">Mi código QR</h1>
        </div>

        <div className="rw-body">

          {/* QR */}
          <div className="rw-qr-wrap">
            <QRCode value={address} size={180} bgColor="#ffffff" fgColor="#000000" level="M" />
          </div>

          {/* Address + copiar */}
          <button className="rw-address-row" onClick={handleCopy}>
            <IconCopy />
            <span className="rw-address-text">{truncateAddress(address)}</span>
            {copied && <span className="rw-copied">¡Copiado!</span>}
          </button>

          {/* Red */}
          <div className="rw-section">
            <p className="rw-label">Escoge la red</p>
            <button
              className="rw-dropdown-trigger"
              onClick={() => { setNetworkOpen(p => !p); setCoinOpen(false); }}
            >
              <span className="rw-dropdown-value">{selectedNetwork.name}</span>
              <IconChevron open={networkOpen} />
            </button>
            {networkOpen && (
              <div className="rw-dropdown-list">
                {NETWORKS.map(net => (
                  <button
                    key={net.id}
                    className={`rw-dropdown-item${(net as any).soon ? ' rw-dropdown-item--soon' : ''}`}
                    onClick={() => handleNetworkSelect(net)}
                    disabled={!!(net as any).soon}
                  >
                    <span>{net.name}</span>
                    {(net as any).soon && <span className="rw-soon-inline">Muy pronto</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Monedas */}
          <div className="rw-section">
            <p className="rw-label">Lista de monedas</p>
            <button
              className="rw-coin-row"
              onClick={() => { setCoinOpen(p => !p); setNetworkOpen(false); }}
            >
              <div className="rw-coin-logo" style={{ backgroundColor: selectedCoin.color }}>
                <span className="rw-coin-initials">{selectedCoin.initials}</span>
              </div>
              <div className="rw-coin-info">
                <span className="rw-coin-name">{selectedCoin.name}</span>
                <span className="rw-coin-sub">{selectedCoin.symbol}</span>
              </div>
              <div className="rw-coin-values">
                <span className="rw-coin-balance">{selectedCoin.balance}</span>
                <span className="rw-coin-usd">${selectedCoin.usdValue.toFixed(2)}</span>
              </div>
              <IconChevron open={coinOpen} />
            </button>
            {coinOpen && (
              <div className="rw-coin-dropdown">
                {COINS.map(coin => (
                  <button
                    key={coin.id}
                    className={`rw-coin-option${(coin as any).soon ? ' rw-coin-option--soon' : ''}`}
                    disabled={!!(coin as any).soon}
                  >
                    <div className="rw-coin-opt-logo" style={{ backgroundColor: coin.color, opacity: (coin as any).soon ? 0.4 : 1 }}>
                      <span className="rw-coin-initials">{coin.initials}</span>
                    </div>
                    <div className="rw-coin-opt-info">
                      <span className={`rw-coin-opt-name${(coin as any).soon ? ' rw-coin-opt-name--soon' : ''}`}>
                        {coin.name}
                      </span>
                      {!(coin as any).soon && <span className="rw-coin-opt-sub">{coin.symbol}</span>}
                    </div>
                    {(coin as any).soon
                      ? <span className="rw-soon-badge">Muy pronto</span>
                      : (
                        <div className="rw-coin-opt-values">
                          <span className="rw-coin-balance">{(coin as any).balance}</span>
                          <span className="rw-coin-usd">${(coin as any).usdValue?.toFixed(2)}</span>
                        </div>
                      )
                    }
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botón Compartir */}
        <div className="rw-footer">
          <button className="rw-share-btn" disabled>
            <IconShare />
            <span>Compartir</span>
            <span className="rw-soon-badge-btn">Próximamente</span>
          </button>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default RecibirWalletPage;
