import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonIcon, useIonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { arrowBackOutline, chevronDownOutline } from 'ionicons/icons';
import { projectsService } from '@/services/projects';
import { Project } from '@/models/projects';
import { Country, State } from 'country-state-city';
import './TokenizacionPaymentPage.css';

type PaymentMethod = 'card' | 'crypto' | null;

const TokenizacionPaymentPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [present] = useIonToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);

  // Cantidad de tokens
  const [tokenAmount, setTokenAmount] = useState('300');
  const [usdtAmount, setUsdtAmount] = useState('300');

  // Datos cripto
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [selectedCrypto] = useState('USDT');

  // Datos de tarjeta
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardName, setCardName] = useState('');
  const [country, setCountry] = useState('CO');
  const [address1, setAddress1] = useState('');
  const [suburb, setSuburb] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [state, setState] = useState('');
  const [email, setEmail] = useState('');

  // Balance simulado
  const walletBalance = 654;

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await projectsService.findOne(id);
      setProject(data);
    } catch (error: any) {
      await present({
        message: 'Error al cargar el proyecto',
        duration: 3000,
        color: 'danger',
      });
      history.goBack();
    } finally {
      setLoading(false);
    }
  };

  const networkFee = 0.005; // Network fee en USDT

  const calculateCryptoTotal = (): {
    conversion: number;
    fee: number;
    total: number;
  } => {
    if (!cryptoAmount || parseFloat(cryptoAmount) <= 0) {
      return { conversion: 0, fee: 0, total: 0 };
    }
    const amount = parseFloat(cryptoAmount);
    // Conversión: 1 token ≈ 1 USDT (simplificado)
    const conversion = amount;
    const fee = conversion * 0.03; // 3% fee
    const total = conversion + fee;
    return { conversion, fee, total };
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      await present({
        message: 'Selecciona un método de pago',
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    if (selectedMethod === 'card') {
      if (!cardNumber || !cardExpiry || !cardCVC || !cardName) {
        await present({
          message: 'Completa todos los campos de la tarjeta',
          duration: 2000,
          color: 'warning',
        });
        return;
      }
    }

    if (selectedMethod === 'crypto') {
      if (!cryptoAmount || parseFloat(cryptoAmount) <= 0) {
        await present({
          message: 'Ingresa una cantidad válida',
          duration: 2000,
          color: 'warning',
        });
        return;
      }
    }

    await present({
      message: 'Procesando pago...',
      duration: 2000,
      color: 'success',
    });

    setTimeout(() => {
      history.push(`/inversiones/${id}`);
    }, 2000);
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <div className="loading-container">
            <p>Cargando...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!project) {
    return null;
  }

  const cryptoCalc = calculateCryptoTotal();

  return (
    <IonPage>
      <IonContent className="tokenizacion-payment-page">
        <div className="tkn-payment-header">
          <button className="tkn-back-btn" onClick={() => history.goBack()}>
            <IonIcon icon={arrowBackOutline} />
          </button>
          <h1 className="tkn-payment-title">
            Tokenización #{project.id.slice(-3)}
          </h1>
        </div>

        <div className="tkn-image-container">
          {project.cover_asset_id ? (
            <img
              src={`${import.meta.env.VITE_API_URL || ''}/assets/${project.cover_asset_id}`}
              alt={project.name}
              className="tkn-cover-image"
            />
          ) : (
            <div className="tkn-cover-placeholder" />
          )}
        </div>

        <div className="tkn-payment-content">
          {/* Sección de Cantidad */}
          <div className="tkn-quantity-section">
            <div className="tkn-quantity-header">
              <span className="tkn-quantity-label">Cantidad</span>
              <span className="tkn-balance">
                Balance:{' '}
                <span className="tkn-balance-value">{walletBalance} USDT</span>
              </span>
            </div>

            <div className="tkn-input-box">
              <input
                type="number"
                className="tkn-amount-input"
                value={tokenAmount}
                onChange={(e) => {
                  setTokenAmount(e.target.value);
                  setUsdtAmount(e.target.value); // 1:1 conversion
                }}
                placeholder="0"
              />
              <div className="tkn-token-badge">
                <span className="tkn-token-icon">△</span>
                <span className="tkn-token-name">TKN</span>
              </div>
            </div>

            <div className="tkn-input-box">
              <input
                type="number"
                className="tkn-amount-input"
                value={usdtAmount}
                onChange={(e) => {
                  setUsdtAmount(e.target.value);
                  setTokenAmount(e.target.value);
                }}
                placeholder="0"
              />
              <div className="tkn-usdt-badge">
                <span className="tkn-usdt-icon">●</span>
                <span className="tkn-usdt-name">USDT</span>
                <IonIcon
                  icon={chevronDownOutline}
                  className="tkn-dropdown-icon"
                />
              </div>
            </div>
          </div>

          {/* Detalles */}
          <h2 className="tkn-section-title">Detalles</h2>
          <div className="tkn-details-box">
            <div className="tkn-detail-row">
              <span className="tkn-detail-label">Monto a pagar</span>
              <span className="tkn-detail-value">{tokenAmount || 0} USDT</span>
            </div>
            <div className="tkn-detail-row">
              <span className="tkn-detail-label">Network fee</span>
              <span className="tkn-detail-value">{networkFee} USDT</span>
            </div>
          </div>

          {/* Método de pago: Tarjeta */}
          <div className="tkn-method-section">
            <div
              className={`tkn-method-header ${selectedMethod === 'card' ? 'active' : ''}`}
              onClick={() =>
                setSelectedMethod(selectedMethod === 'card' ? null : 'card')
              }
            >
              <div className="tkn-radio">
                <div
                  className={`tkn-radio-outer ${selectedMethod === 'card' ? 'selected' : ''}`}
                >
                  {selectedMethod === 'card' && (
                    <div className="tkn-radio-inner" />
                  )}
                </div>
              </div>
              <span className="tkn-method-title">
                Tarjeta de débito / crédito
              </span>
            </div>

            <div className="tkn-method-icons">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg"
                alt="Mastercard"
                className="tkn-card-icon"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                alt="Visa"
                className="tkn-card-icon"
              />
              <span className="tkn-more">+99</span>
            </div>

            {selectedMethod === 'card' && (
              <div className="tkn-card-form">
                <div className="tkn-form-section">
                  <label className="tkn-form-label">Card information</label>
                  <div className="tkn-card-input-group">
                    <input
                      type="text"
                      className="tkn-input"
                      placeholder="Enter text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                    />
                    <div className="tkn-card-icons-inline">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg"
                        alt="MC"
                        className="tkn-icon-small"
                      />
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                        alt="Visa"
                        className="tkn-icon-small"
                      />
                    </div>
                  </div>
                  <div className="tkn-card-row">
                    <input
                      type="text"
                      className="tkn-input half"
                      placeholder="MM / YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      maxLength={7}
                    />
                    <input
                      type="text"
                      className="tkn-input half"
                      placeholder="CVC"
                      value={cardCVC}
                      onChange={(e) => setCardCVC(e.target.value)}
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="tkn-form-section">
                  <label className="tkn-form-label">Cardholder name</label>
                  <input
                    type="text"
                    className="tkn-input"
                    placeholder="Full name on card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>

                <div className="tkn-form-section">
                  <label className="tkn-form-label">Country or region</label>
                  <select
                    className="tkn-select"
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setState('');
                    }}
                  >
                    {Country.getAllCountries().map((c) => (
                      <option key={c.isoCode} value={c.isoCode}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    className="tkn-input"
                    placeholder="Address line 1"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                  />
                  <input
                    type="text"
                    className="tkn-input"
                    placeholder="Suburb"
                    value={suburb}
                    onChange={(e) => setSuburb(e.target.value)}
                  />
                  <div className="tkn-card-row">
                    <input
                      type="text"
                      className="tkn-input half"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                    <input
                      type="text"
                      className="tkn-input half"
                      placeholder="Postal code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>
                  <select
                    className="tkn-select"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  >
                    <option value="">State</option>
                    {State.getStatesOfCountry(country).map((s) => (
                      <option key={s.isoCode} value={s.isoCode}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="tkn-form-section">
                  <label className="tkn-form-label">Contact information</label>
                  <input
                    type="email"
                    className="tkn-input"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Método de pago: Cripto */}
          <div className="tkn-method-section">
            <div
              className={`tkn-method-header ${selectedMethod === 'crypto' ? 'active' : ''}`}
              onClick={() =>
                setSelectedMethod(selectedMethod === 'crypto' ? null : 'crypto')
              }
            >
              <div className="tkn-radio">
                <div
                  className={`tkn-radio-outer ${selectedMethod === 'crypto' ? 'selected' : ''}`}
                >
                  {selectedMethod === 'crypto' && (
                    <div className="tkn-radio-inner" />
                  )}
                </div>
              </div>
              <span className="tkn-method-title">
                Tarjeta de débito / crédito
              </span>
            </div>

            <div className="tkn-method-icons">
              <div className="tkn-crypto-icon usdt">₮</div>
              <div className="tkn-crypto-icon usdc">$</div>
              <div className="tkn-crypto-icon dai">◈</div>
              <div className="tkn-crypto-icon celo">⬡</div>
              <span className="tkn-more">+99</span>
            </div>

            {selectedMethod === 'crypto' && (
              <div className="tkn-crypto-form">
                <div className="tkn-form-section">
                  <label className="tkn-form-label">Wallet & Network</label>
                  <div className="tkn-wallet-box">
                    <span className="tkn-wallet-icon">👛</span>
                    <span className="tkn-wallet-balance">
                      {walletBalance.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="tkn-form-section">
                  <label className="tkn-form-label">Coin</label>
                  <div className="tkn-crypto-input-group">
                    <input
                      type="number"
                      className="tkn-crypto-input"
                      placeholder="0.1824"
                      value={cryptoAmount}
                      onChange={(e) => setCryptoAmount(e.target.value)}
                      step="0.0001"
                    />
                    <div className="tkn-crypto-select-box">
                      <span>{selectedCrypto}</span>
                      <IonIcon icon={chevronDownOutline} />
                    </div>
                  </div>
                </div>

                {cryptoAmount && parseFloat(cryptoAmount) > 0 && (
                  <div className="tkn-crypto-summary">
                    <div className="tkn-summary-label">Total:</div>
                    <div className="tkn-summary-row">
                      <span className="tkn-summary-text">Conversión:</span>
                      <span className="tkn-summary-value">
                        {cryptoCalc.conversion.toFixed(2)} USDT
                      </span>
                    </div>
                    <div className="tkn-summary-row">
                      <span className="tkn-summary-text">Fee:</span>
                      <span className="tkn-summary-value">
                        {cryptoCalc.fee.toFixed(2)} USDT
                      </span>
                    </div>
                    <div className="tkn-total-amount">
                      {cryptoCalc.total.toFixed(2)} USDT
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="tkn-actions">
            <button
              className="tkn-btn secondary"
              onClick={() => history.goBack()}
            >
              Regresar
            </button>
            <button
              className="tkn-btn primary"
              onClick={handlePayment}
              disabled={!selectedMethod}
            >
              {selectedMethod ? 'Pagar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TokenizacionPaymentPage;
