import React, { useState } from 'react';
import './WalletSelectionStep.css';

export interface SelectedNetwork {
  id: string;
  name: string;
}

export interface SelectedCoin {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  usdValue: number;
  color: string;
  initials: string;
}

interface Props {
  onContinue: (network: SelectedNetwork, coin: SelectedCoin) => void;
}

const NETWORKS: Array<SelectedNetwork & { soon?: boolean }> = [
  { id: 'celo',       name: 'Celo' },
  { id: 'bnb-smart',  name: 'BNB Smart Chain (BEP20)',  soon: true },
  { id: 'avax',       name: 'AVAX C-Chain',              soon: true },
  { id: 'bnb-beacon', name: 'BNB Beacon Chain (BEP2)',   soon: true },
  { id: 'ethereum',   name: 'Ethereum',                  soon: true },
  { id: 'polygon',    name: 'Polygon',                   soon: true },
  { id: 'solana',     name: 'Solana',                    soon: true },
];

const COINS: Array<SelectedCoin & { soon?: boolean }> = [
  { id: 'celo',     name: 'Celo',         symbol: 'cCOP', balance: 2000, usdValue: 147.40, color: '#FCCC00', initials: 'C' },
  { id: 'bitcoin',  name: 'Bitcoin',      symbol: 'BTC',  balance: 0,    usdValue: 0,      color: '#F7931A', initials: 'B', soon: true },
  { id: 'eth',      name: 'Ethereum',     symbol: 'ETH',  balance: 0,    usdValue: 0,      color: '#627EEA', initials: 'E', soon: true },
  { id: 'tether',   name: 'Tether',       symbol: 'USDT', balance: 0,    usdValue: 0,      color: '#26A17B', initials: 'T', soon: true },
  { id: 'bnb',      name: 'Binance Coin', symbol: 'BNB',  balance: 0,    usdValue: 0,      color: '#F3BA2F', initials: 'B', soon: true },
  { id: 'usdc',     name: 'USD Coin',     symbol: 'USDC', balance: 0,    usdValue: 0,      color: '#2775CA', initials: 'U', soon: true },
  { id: 'busd',     name: 'Binance USD',  symbol: 'BUSD', balance: 0,    usdValue: 0,      color: '#F0B90B', initials: 'B', soon: true },
];

const IconChevronDown: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const WalletSelectionStep: React.FC<Props> = ({ onContinue }) => {
  const [networkOpen, setNetworkOpen] = useState(false);
  const [coinOpen, setCoinOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<SelectedNetwork>(NETWORKS[0]);
  const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
  const [coinSearch, setCoinSearch] = useState('');

  const toggleNetwork = () => {
    setNetworkOpen(prev => !prev);
    setCoinOpen(false);
  };

  const toggleCoin = () => {
    setCoinOpen(prev => !prev);
    setNetworkOpen(false);
  };

  const handleNetworkSelect = (net: typeof NETWORKS[0]) => {
    if (net.soon) return;
    setSelectedNetwork({ id: net.id, name: net.name });
    setNetworkOpen(false);
  };

  const handleCoinSelect = (coin: typeof COINS[0]) => {
    if (coin.soon) return;
    setSelectedCoin(coin);
    setCoinOpen(false);
    setCoinSearch('');
  };

  const filteredCoins = COINS.filter(c =>
    c.name.toLowerCase().includes(coinSearch.toLowerCase())
  );

  return (
    <div className="ws-container">
      <div className="ws-body">

        {/* ── Red ── */}
        <div className="ws-section">
          <p className="ws-label">Escoge la red</p>
          <button className="ws-dropdown-trigger" onClick={toggleNetwork}>
            <span className="ws-dropdown-value">{selectedNetwork.name}</span>
            <IconChevronDown open={networkOpen} />
          </button>

          {networkOpen && (
            <div className="ws-dropdown-list">
              {NETWORKS.map(net => (
                <button
                  key={net.id}
                  className={`ws-dropdown-item${net.soon ? ' ws-dropdown-item--soon' : ''}`}
                  onClick={() => handleNetworkSelect(net)}
                  disabled={!!net.soon}
                >
                  <span className="ws-dropdown-item-name">{net.name}</span>
                  {net.soon && <span className="ws-soon-badge">Muy pronto</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Monedas ── */}
        <div className="ws-section">
          <p className="ws-label">Lista de monedas</p>

          <button className="ws-coin-row" onClick={toggleCoin}>
            <div className="ws-coin-logo" style={{ backgroundColor: selectedCoin.color }}>
              <span className="ws-coin-initials">{selectedCoin.initials}</span>
            </div>
            <div className="ws-coin-info">
              <span className="ws-coin-name">{selectedCoin.name}</span>
              <span className="ws-coin-sub">{selectedCoin.symbol}</span>
            </div>
            <div className="ws-coin-values">
              <span className="ws-coin-balance">{selectedCoin.balance}</span>
              <span className="ws-coin-usd">${selectedCoin.usdValue.toFixed(2)}</span>
            </div>
            <IconChevronDown open={coinOpen} />
          </button>

          {coinOpen && (
            <div className="ws-coin-dropdown">
              <div className="ws-coin-search-wrap">
                <IconSearch />
                <input
                  className="ws-coin-search"
                  type="text"
                  placeholder="Buscar moneda"
                  value={coinSearch}
                  onChange={e => setCoinSearch(e.target.value)}
                />
              </div>
              {filteredCoins.map(coin => (
                <button
                  key={coin.id}
                  className={`ws-coin-option${coin.soon ? ' ws-coin-option--soon' : ''}`}
                  onClick={() => handleCoinSelect(coin)}
                  disabled={!!coin.soon}
                >
                  <div className="ws-coin-opt-logo" style={{ backgroundColor: coin.color }}>
                    <span className="ws-coin-opt-initials">{coin.initials}</span>
                  </div>
                  <div className="ws-coin-opt-info">
                    <span className={`ws-coin-opt-name${coin.soon ? ' ws-coin-opt-name--soon' : ''}`}>
                      {coin.name}
                    </span>
                    {!coin.soon && (
                      <span className="ws-coin-opt-sub">{coin.symbol}</span>
                    )}
                  </div>
                  {coin.soon ? (
                    <span className="ws-soon-badge">Muy pronto</span>
                  ) : (
                    <div className="ws-coin-opt-values">
                      <span className="ws-coin-balance">{coin.balance}</span>
                      <span className="ws-coin-usd">${coin.usdValue.toFixed(2)}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button className="ws-btn" onClick={() => onContinue(selectedNetwork, selectedCoin)}>
        Continuar
      </button>
    </div>
  );
};

export default WalletSelectionStep;
