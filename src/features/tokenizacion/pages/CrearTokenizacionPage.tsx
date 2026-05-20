import React, { useState, useRef } from 'react';
import { IonPage, IonContent, IonIcon, useIonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { arrowBackOutline } from 'ionicons/icons';
import { motion } from 'framer-motion';
import { Step1BasicInfo } from '../components/Step1BasicInfo';
import { Step2FinancialInfo } from '../components/Step2FinancialInfo';
import { Step3Content } from '../components/Step3Content';
import { Step4Preview } from '../components/Step4Preview';
import { Step4Success } from '../components/Step4Success';
import { DeploymentProgressModal } from '@/components/ui/DeploymentProgressModal';
import { ConnectButton } from 'thirdweb/react';
import { inAppWallet, createWallet } from 'thirdweb/wallets';
import { thirdwebClient } from '@/app/App';
import { projectInvitationsService } from '@/services/projects/invitations.service';
import { useBlockchain } from '@/hooks/use-blockchain';
import { CHAIN } from '@/contracts/config';
import { Project } from '@/models/projects';
import { useTokenizacionDeploy } from '../hooks/useTokenizacionDeploy';
import type { TokenizacionFormData, TokenRightDto, TokenFaqDto } from '../hooks/types';
import './CrearTokenizacionPage.css';

const wallets = [
  inAppWallet({ auth: { options: ['email', 'google', 'apple'] } }),
  createWallet('io.metamask'),
];

const STEP_TITLES = [
  'Información básica',
  'Información financiera',
  'Contenido y descargables',
  'Así se verá tu Tokenización',
];
const TOTAL_STEPS = 4;

const DEFAULT_FORM: TokenizacionFormData = {
  tipoProyecto: 'Tokenización',
  nombreProyecto: '',
  descripcion: '',
  aspectosDestacados: '',
  valorActivo: '',
  moneda: 'COP',
  rendimiento: '',
  precioPorToken: '',
  monedaToken: 'COP',
  totalTokens: '',
  simboloToken: '',
  nombreToken: '',
  ventaAnticipada: 'false',
  fechaVentaAnticipada: '',
  horaVentaAnticipada: '10:00',
  fechaVentaPublica: '',
  horaVentaPublica: '10:00',
  privacidad: 'PRIVATE',
  invitarAmigos: '',
};

const CrearTokenizacionPage: React.FC = () => {
  const history = useHistory();
  const [present] = useIonToast();
  const contentRef = useRef<HTMLIonContentElement>(null);
  const { account } = useBlockchain();
  const { deployStep, run: deployTokenizacion } = useTokenizacionDeploy();

  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdTokenizacion, setCreatedTokenizacion] = useState<Project | null>(null);
  const [formData, setFormData] = useState<TokenizacionFormData>(DEFAULT_FORM);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<
    { id: string; file?: File; motivo: string }[]
  >([{ id: '1', motivo: '' }]);
  const [tokenRights, setTokenRights] = useState<TokenRightDto[]>([{ id: '1', title: '' }]);
  const [tokenFaqs, setTokenFaqs] = useState<TokenFaqDto[]>([{ id: '1', question: '', answer: '' }]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const scrollToTop = () => contentRef.current?.scrollToTop(300);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      scrollToTop();
    }
  };
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollToTop();
    }
  };

  const handleCreateTokenizacion = async () => {
    if (!account) return;
    const result = await deployTokenizacion(
      account,
      formData,
      tokenRights,
      tokenFaqs,
      selectedImage,
      selectedDocuments,
    );

    if (result.ok && result.project) {
      setCreatedTokenizacion(result.project);
      setShowSuccess(true);
      await present({ message: 'Tokenización creada exitosamente', duration: 2000, color: 'success' });
    } else if (result.error) {
      await present({
        message: result.error.isGasError ? 'Sin saldo para gas. Contacta al soporte.' : result.error.message,
        duration: 6000,
        color: 'danger',
      });
    }
  };

  const handleFinish = () => {
    history.replace(createdTokenizacion?.id ? `/inversiones/${createdTokenizacion.id}` : '/portafolio');
  };

  const handleCopyLink = async () => {
    if (!createdTokenizacion?.share_slug) return;
    const shareLink = `${window.location.origin}/tokenizacion/${createdTokenizacion.share_slug}`;
    try {
      await navigator.clipboard.writeText(shareLink);
      await present({ message: 'Link copiado al portapapeles', duration: 2000, color: 'success' });
    } catch {
      await present({ message: 'Error al copiar el link', duration: 2000, color: 'danger' });
    }
  };

  const handleInvite = async (emailOrUsername: string): Promise<{ success: boolean; message: string }> => {
    if (!createdTokenizacion?.id) {
      return { success: false, message: 'Error: No se encontró el proyecto' };
    }
    try {
      const inviteData = emailOrUsername.includes('@')
        ? { invitee_email: emailOrUsername }
        : { invitee_username: emailOrUsername };
      await projectInvitationsService.create(createdTokenizacion.id, inviteData);
      return { success: true, message: `Invitación enviada a ${emailOrUsername}` };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Error al enviar la invitación' };
    }
  };

  const progressWidth = `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%`;

  return (
    <IonPage className="ion-page-light">
      <IonContent ref={contentRef} fullscreen className="crear-natillera-page" color="light">
        <div className="page-header">
          <button className="header-back-button" onClick={() => history.push('/portafolio')}>
            <IonIcon icon={arrowBackOutline} />
          </button>
          <h1 className="page-title">Nuevo Proyecto</h1>
        </div>

        {!showSuccess && (
          <div className="progress-section">
            <div className="progress-bar">
              {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
                <div key={index} className={`progress-dot ${index + 1 <= currentStep ? 'active' : ''}`} />
              ))}
              <motion.div
                className="progress-line"
                initial={{ width: '0%' }}
                animate={{ width: progressWidth }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="step-info">
              <h2 className="step-title">{STEP_TITLES[currentStep - 1]}</h2>
              <span className="step-counter">
                {currentStep}/{TOTAL_STEPS}
              </span>
            </div>
          </div>
        )}

        <div className="form-container">
          {!showSuccess ? (
            <>
              {currentStep === 1 && (
                <Step1BasicInfo
                  formData={{
                    tipoProyecto: formData.tipoProyecto,
                    nombreProyecto: formData.nombreProyecto,
                    descripcion: formData.descripcion,
                    aspectosDestacados: formData.aspectosDestacados,
                    privacidad: formData.privacidad,
                  }}
                  tokenRights={tokenRights}
                  tokenFaqs={tokenFaqs}
                  onChange={handleFieldChange}
                  onTokenRightsChange={setTokenRights}
                  onTokenFaqsChange={setTokenFaqs}
                />
              )}
              {currentStep === 2 && (
                <Step2FinancialInfo
                  formData={{
                    valorActivo: formData.valorActivo,
                    moneda: formData.moneda,
                    rendimiento: formData.rendimiento,
                    precioPorToken: formData.precioPorToken,
                    monedaToken: formData.monedaToken,
                    totalTokens: formData.totalTokens,
                    simboloToken: formData.simboloToken,
                    nombreToken: formData.nombreToken,
                    ventaAnticipada: formData.ventaAnticipada,
                    fechaVentaAnticipada: formData.fechaVentaAnticipada,
                    horaVentaAnticipada: formData.horaVentaAnticipada,
                    fechaVentaPublica: formData.fechaVentaPublica,
                    horaVentaPublica: formData.horaVentaPublica,
                  }}
                  onChange={handleFieldChange}
                />
              )}
              {currentStep === 3 && (
                <Step3Content
                  onImageSelected={setSelectedImage}
                  onDocumentsChanged={setSelectedDocuments}
                  selectedImage={selectedImage}
                  selectedDocuments={selectedDocuments}
                />
              )}
              {currentStep === 4 && (
                <Step4Preview
                  projectName={formData.nombreProyecto}
                  description={formData.descripcion}
                  aspectosDestacados={formData.aspectosDestacados}
                  valorActivo={formData.valorActivo}
                  moneda={formData.moneda}
                  rendimiento={formData.rendimiento}
                  precioPorToken={formData.precioPorToken}
                  monedaToken={formData.monedaToken}
                  totalTokens={formData.totalTokens}
                  simboloToken={formData.simboloToken}
                  nombreToken={formData.nombreToken}
                  tokenRights={tokenRights}
                  tokenFaqs={tokenFaqs}
                  selectedImage={selectedImage}
                  selectedDocuments={selectedDocuments}
                />
              )}
            </>
          ) : (
            <Step4Success
              tokenizacionName={formData.nombreProyecto}
              userName="UserName"
              description={formData.descripcion}
              aspectosDestacados={formData.aspectosDestacados}
              invitarAmigos={formData.invitarAmigos}
              shareLink={
                createdTokenizacion?.share_slug
                  ? `${window.location.origin}/tokenizacion/${createdTokenizacion.share_slug}`
                  : ''
              }
              projectId={createdTokenizacion?.id || ''}
              onInvitarAmigosChange={(value) => handleFieldChange('invitarAmigos', value)}
              onCopyLink={handleCopyLink}
              onInvite={handleInvite}
            />
          )}
        </div>

        <div className="form-actions">
          {!showSuccess ? (
            <>
              {currentStep > 1 && (
                <button className="btn-secondary" onClick={handlePrevious}>
                  Regresar
                </button>
              )}
              {currentStep < 4 ? (
                <button className="btn-primary" onClick={handleNext}>
                  Siguiente paso
                </button>
              ) : !account ? (
                <ConnectButton
                  client={thirdwebClient}
                  chain={CHAIN}
                  locale="es_ES"
                  wallets={wallets}
                  connectButton={{
                    style: { width: '100%', borderRadius: '50px', height: '52px', fontSize: '15px', fontWeight: '600' },
                  }}
                />
              ) : (
                <button className="btn-primary" onClick={handleCreateTokenizacion}>
                  Crear Tokenización
                </button>
              )}
            </>
          ) : (
            <button className="btn-primary" onClick={handleFinish}>
              Ir a mi Tokenización
            </button>
          )}
        </div>
      </IonContent>

      <DeploymentProgressModal
        visible={deployStep > 0}
        title="Creando tu Tokenización"
        subtitle="Configurando y desplegando la Tokenización, ya casi terminamos"
        currentStep={deployStep}
        steps={[
          { label: 'Organizando las reglas de tu Tokenización...' },
          { label: 'Configurando el contrato inteligente...' },
          { label: 'Asignando permisos de administrador' },
          { label: 'Preparando tu nueva Tokenización...' },
        ]}
      />
    </IonPage>
  );
};

export default CrearTokenizacionPage;
