import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonIcon, useIonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { arrowBackOutline } from 'ionicons/icons';
import { projectsService } from '@/services/projects';
import { Project } from '@/models/projects';
import { Country, State } from 'country-state-city';
import './PaymentPage.css';

type PaymentMethod = 'card' | 'crypto' | null;

const PaymentPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [present] = useIonToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('USDT');

  // Datos de tarjeta
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardName, setCardName] = useState('');
  const [country, setCountry] = useState('NG');
  const [address1, setAddress1] = useState('');
  const [suburb, setSuburb] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [state, setState] = useState('');
  const [email, setEmail] = useState('');

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

  const calculateFee = (amount: number): number => {
    if (!project?.natillera_details) return 0;
    // 3% fee
    return amount * 0.03;
  };

  const calculateCryptoConversion = (): {
    conversion: number;
    fee: number;
    total: number;
  } => {
    if (!project?.natillera_details || !cryptoAmount) {
      return { conversion: 0, fee: 0, total: 0 };
    }

    const amount = parseFloat(cryptoAmount);
    if (isNaN(amount)) {
      return { conversion: 0, fee: 0, total: 0 };
    }

    // Tasa de conversión aproximada (en producción vendría de una API)
    const conversionRate = 3650; // 1 USDT ≈ 3650 COP
    const conversion = amount * conversionRate;
    const fee = conversion * 0.03;
    const total = amount + fee / conversionRate;

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

    // Aquí iría la lógica de procesamiento de pago
    await present({
      message: 'Procesando pago...',
      duration: 2000,
      color: 'success',
    });

    // Simular éxito y redirigir
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

  const monthlyFee = project.natillera_details?.monthly_fee_amount || 0;
  const fee = calculateFee(monthlyFee);
  const currency = project.natillera_details?.monthly_fee_currency || 'COP';
  const cryptoCalc = calculateCryptoConversion();

  return (
    <IonPage>
      <IonContent className="payment-page">
        <div className="payment-header">
          <button className="payment-back-btn" onClick={() => history.goBack()}>
            <IonIcon icon={arrowBackOutline} />
          </button>
          <h1 className="payment-title">{project.name}</h1>
        </div>

        <div className="payment-image-container">
          <div className="payment-image" />
        </div>

        <div className="payment-content">
          <h2 className="payment-section-title">Detalles</h2>
          <div className="payment-details">
            <div className="payment-detail-row">
              <span className="payment-detail-label">Cuota de natillera</span>
              <span className="payment-detail-value">
                {monthlyFee.toLocaleString('es-CO')} {currency}
              </span>
            </div>
            <div className="payment-detail-row">
              <span className="payment-detail-label">Fee 3%</span>
              <span className="payment-detail-value">
                {fee.toLocaleString('es-CO')} {currency}
              </span>
            </div>
          </div>

          {/* Método de pago: Tarjeta */}
          <div className="payment-method-section">
            <div
              className={`payment-method-header ${selectedMethod === 'card' ? 'active' : ''}`}
              onClick={() =>
                setSelectedMethod(selectedMethod === 'card' ? null : 'card')
              }
            >
              <div className="payment-method-radio">
                <div
                  className={`radio-outer ${selectedMethod === 'card' ? 'selected' : ''}`}
                >
                  {selectedMethod === 'card' && <div className="radio-inner" />}
                </div>
              </div>
              <span className="payment-method-title">
                Tarjeta de débito / crédito
              </span>
            </div>

            <div className="payment-method-icons">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg"
                alt="Mastercard"
                className="payment-icon"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                alt="Visa"
                className="payment-icon"
              />
              <span className="payment-more">+99</span>
            </div>

            {selectedMethod === 'card' && (
              <div className="card-form">
                <div className="form-section">
                  <label className="form-label-small">Card information</label>
                  <div className="card-input-group">
                    <input
                      type="text"
                      className="form-input-card"
                      placeholder="Enter text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                    />
                    <div className="card-icons-inline">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg"
                        alt="MC"
                        className="card-icon-small"
                      />
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                        alt="Visa"
                        className="card-icon-small"
                      />
                    </div>
                  </div>
                  <div className="card-row">
                    <input
                      type="text"
                      className="form-input-card half"
                      placeholder="MM / YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      maxLength={7}
                    />
                    <input
                      type="text"
                      className="form-input-card half"
                      placeholder="CVC"
                      value={cardCVC}
                      onChange={(e) => setCardCVC(e.target.value)}
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <label className="form-label-small">Cardholder name</label>
                  <input
                    type="text"
                    className="form-input-card"
                    placeholder="Full name on card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>

                <div className="form-section">
                  <label className="form-label-small">Country or region</label>
                  <select
                    className="form-select-card"
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
                    className="form-input-card"
                    placeholder="Address line 1"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input-card"
                    placeholder="Suburb"
                    value={suburb}
                    onChange={(e) => setSuburb(e.target.value)}
                  />
                  <div className="card-row">
                    <input
                      type="text"
                      className="form-input-card half"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input-card half"
                      placeholder="Postal code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>
                  <select
                    className="form-select-card"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  >
                    <option value="">State / Province</option>
                    {State.getStatesOfCountry(country).map((s) => (
                      <option key={s.isoCode} value={s.isoCode}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-section">
                  <label className="form-label-small">
                    Contact information
                  </label>
                  <input
                    type="email"
                    className="form-input-card"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Método de pago: Cripto */}
          <div className="payment-method-section">
            <div
              className={`payment-method-header ${selectedMethod === 'crypto' ? 'active' : ''}`}
              onClick={() =>
                setSelectedMethod(selectedMethod === 'crypto' ? null : 'crypto')
              }
            >
              <div className="payment-method-radio">
                <div
                  className={`radio-outer ${selectedMethod === 'crypto' ? 'selected' : ''}`}
                >
                  {selectedMethod === 'crypto' && (
                    <div className="radio-inner" />
                  )}
                </div>
              </div>
              <span className="payment-method-title">Cripto</span>
            </div>

            <div className="payment-method-icons">
              <div className="crypto-icon usdt">₮</div>
              <div className="crypto-icon usdc">$</div>
              <div className="crypto-icon dai">◈</div>
              <div className="crypto-icon polygon">⬡</div>
              <span className="payment-more">+99</span>
            </div>

            {selectedMethod === 'crypto' && (
              <div className="crypto-form">
                <div className="wallet-section">
                  <label className="form-label-small">Wallet & Network</label>
                  <div className="wallet-balance">
                    <span className="wallet-icon">👛</span>
                    <span className="wallet-amount">427.26</span>
                  </div>
                </div>

                <div className="form-section">
                  <label className="form-label-small">Coin</label>
                  <div className="crypto-input-group">
                    <input
                      type="number"
                      className="form-input-crypto"
                      placeholder="0.0000"
                      value={cryptoAmount}
                      onChange={(e) => setCryptoAmount(e.target.value)}
                      step="0.0001"
                    />
                    <select
                      className="crypto-select"
                      value={selectedCrypto}
                      onChange={(e) => setSelectedCrypto(e.target.value)}
                    >
                      <option value="USDT">USDT</option>
                      <option value="USDC">USDC</option>
                      <option value="DAI">DAI</option>
                    </select>
                  </div>
                </div>

                {cryptoAmount && parseFloat(cryptoAmount) > 0 && (
                  <div className="crypto-breakdown">
                    <div className="crypto-breakdown-row">
                      <span className="crypto-breakdown-label">
                        Conversión:
                      </span>
                      <span className="crypto-breakdown-value">
                        {cryptoCalc.conversion.toLocaleString('es-CO', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        {currency}
                      </span>
                    </div>
                    <div className="crypto-breakdown-row">
                      <span className="crypto-breakdown-label">Fee:</span>
                      <span className="crypto-breakdown-value">
                        {(cryptoCalc.fee / 3650).toFixed(4)} {selectedCrypto}
                      </span>
                    </div>
                    <div className="crypto-total">
                      {cryptoCalc.total.toFixed(4)} {selectedCrypto}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="payment-actions">
            <button
              className="payment-button secondary"
              onClick={() => history.goBack()}
            >
              Regresar
            </button>
            <button
              className="payment-button primary"
              onClick={handlePayment}
              disabled={!selectedMethod}
            >
              {selectedMethod === 'card'
                ? 'Pagar'
                : selectedMethod === 'crypto'
                  ? 'Pagar'
                  : 'Siguiente'}
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PaymentPage;
