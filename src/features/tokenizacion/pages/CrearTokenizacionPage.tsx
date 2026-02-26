import React, { useState, useRef } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { arrowBackOutline } from 'ionicons/icons';
import { motion } from 'framer-motion';
import { Step1BasicInfo } from '../components/Step1BasicInfo';
import { Step2FinancialInfo } from '../components/Step2FinancialInfo';
import { Step3Content } from '../components/Step3Content';
import { Step4Preview } from '../components/Step4Preview';
import { Step4Success } from '../components/Step4Success';
import { useIonToast, useIonLoading } from '@ionic/react';
import { ConnectButton } from 'thirdweb/react';
import { inAppWallet, createWallet } from 'thirdweb/wallets';
import { thirdwebClient } from '@/app/App';
import { projectsService } from '@/services/projects';
import { apiService } from '@/services/api/api.service';
import { projectInvitationsService } from '@/services/projects/invitations.service';
import { blockchainService } from '@/services/blockchain.service';
import { useBlockchain } from '@/hooks/use-blockchain';
import { CHAIN, BLOCKCHAIN_CONFIG } from '@/contracts/config';

const wallets = [
  inAppWallet({ auth: { options: ['email', 'google', 'apple'] } }),
  createWallet('io.metamask'),
];
import {
  Project,
  ProjectType,
  Currency,
  ProjectVisibility,
} from '@/models/projects';
import './CrearTokenizacionPage.css';

interface TokenizacionFormData {
  tipoProyecto: string;
  nombreProyecto: string;
  descripcion: string;
  aspectosDestacados: string;
  valorActivo: string;
  moneda: string;
  rendimiento: string;
  precioPorToken: string;
  monedaToken: string;
  totalTokens: string;
  simboloToken: string;
  nombreToken: string;
  ventaAnticipada: string;
  fechaVentaAnticipada: string;
  horaVentaAnticipada: string;
  fechaVentaPublica: string;
  horaVentaPublica: string;
  privacidad: string;
  invitarAmigos: string;
}

interface TokenRightDto {
  id: string;
  title: string;
}

interface TokenFaqDto {
  id: string;
  question: string;
  answer: string;
}

const CrearTokenizacionPage: React.FC = () => {
  const history = useHistory();
  const [present] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();
  const contentRef = useRef<HTMLIonContentElement>(null);
  const { account } = useBlockchain();

  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdTokenizacion, setCreatedTokenizacion] =
    useState<Project | null>(null);

  const [formData, setFormData] = useState<TokenizacionFormData>({
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
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<
    { id: string; file?: File; motivo: string }[]
  >([{ id: '1', motivo: '' }]);

  const [tokenRights, setTokenRights] = useState<TokenRightDto[]>([
    { id: '1', title: '' },
  ]);

  const [tokenFaqs, setTokenFaqs] = useState<TokenFaqDto[]>([
    { id: '1', question: '', answer: '' },
  ]);

  const totalSteps = 4;

  const stepTitles = [
    'Información básica',
    'Información financiera',
    'Contenido y descargables',
    'Así se verá tu Tokenización',
  ];

  const handleFieldChange = (field: string, value: string) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
  };

  const handleTokenRightsChange = (rights: TokenRightDto[]) => {
    setTokenRights(rights);
  };

  const handleTokenFaqsChange = (faqs: TokenFaqDto[]) => {
    setTokenFaqs(faqs);
  };

  const handleClose = () => {
    history.push('/portafolio');
  };

  const scrollToTop = () => {
    contentRef.current?.scrollToTop(300);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
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
    try {
      const valorActivo = parseFloat(formData.valorActivo);
      const rendimiento = parseFloat(formData.rendimiento);
      const precioPorToken = parseFloat(formData.precioPorToken);
      const totalTokens = parseInt(formData.totalTokens);

      await presentLoading({ message: 'Creando tokenizacion...' });

      const ventaAnticipada = formData.ventaAnticipada === 'true';
      let presaleStartsAt: string | undefined;
      let publicSaleStartsAt: string | undefined;

      if (
        ventaAnticipada &&
        formData.fechaVentaAnticipada &&
        formData.fechaVentaPublica
      ) {
        const presaleDate = new Date(
          `${formData.fechaVentaAnticipada}T${formData.horaVentaAnticipada}`
        );
        const publicSaleDate = new Date(
          `${formData.fechaVentaPublica}T${formData.horaVentaPublica}`
        );

        presaleStartsAt = presaleDate.toISOString();
        publicSaleStartsAt = publicSaleDate.toISOString();
      }

      const rightsFiltered = tokenRights.filter((r) => r.title.trim() !== '');
      const faqsFiltered = tokenFaqs.filter(
        (f) => f.question.trim() !== '' && f.answer.trim() !== ''
      );

      const tokenizacionData = {
        type: ProjectType.TOKENIZATION,
        name: formData.nombreProyecto,
        description_rich: formData.descripcion,
        highlights_rich: formData.aspectosDestacados,
        visibility: formData.privacidad as ProjectVisibility,

        tokenization_details: {
          asset_value_amount: valorActivo,
          asset_value_currency: formData.moneda as Currency,
          expected_annual_return_pct: rendimiento,
          price_per_token_amount: precioPorToken,
          price_per_token_currency: formData.monedaToken as Currency,
          total_tokens: totalTokens,
          token_symbol: formData.simboloToken,
          token_name: formData.nombreToken,

          ...(ventaAnticipada &&
            presaleStartsAt &&
            publicSaleStartsAt && {
              presale_enabled: true,
              presale_starts_at: presaleStartsAt,
              public_sale_starts_at: publicSaleStartsAt,
            }),
        },

        token_rights: rightsFiltered.map((r) => ({
          title: r.title,
          description: r.title,
        })),

        token_faqs: faqsFiltered.map((f) => ({
          question: f.question,
          answer: f.answer,
        })),
      };

      // console.log('[CrearTokenizacion] DTO preparado:', tokenizacionData);

      const project = await projectsService.create(tokenizacionData);
      // console.log('[CrearTokenizacion] Proyecto creado:', project);
      // console.log('[CrearTokenizacion] Project ID:', project.id);

      const projectId = project.id;

      if (selectedImage) {
        await dismissLoading();
        await presentLoading({ message: 'Subiendo imagen miniatura...' });

        await projectsService.uploadImage(
          projectId,
          selectedImage,
          true,
          'Miniatura de tokenizacion'
        );
      }

      const documentsWithFiles = selectedDocuments.filter((d) => d.file);
      if (documentsWithFiles.length > 0) {
        for (let i = 0; i < documentsWithFiles.length; i++) {
          const doc = documentsWithFiles[i];
          await dismissLoading();
          await presentLoading({
            message: `Subiendo documento ${i + 1}/${documentsWithFiles.length}...`,
          });

          await projectsService.uploadDocument(
            projectId,
            doc.file!,
            doc.motivo || doc.file!.name,
            'GENERAL',
            doc.motivo
          );
        }
      }

      // Fondear gas si el usuario tiene menos de 0.05 CELO
      const celoBalance = await blockchainService.getNativeBalance(account!.address);
      const MIN_GAS = BigInt('50000000000000000'); // 0.05 CELO
      if (celoBalance < MIN_GAS) {
        await dismissLoading();
        await presentLoading({ message: 'Preparando wallet para gas...' });
        try {
          await apiService.post('/blockchain/fund-gas', { address: account!.address });
        } catch {
          // no bloquear si falla el faucet, intentar el deploy de todas formas
        }
      }

      await dismissLoading();
      await presentLoading({ message: 'Desplegando contrato en blockchain...' });

      const copToUsdc = (cop: number): bigint =>
        blockchainService.parseUnits(
          (cop / BLOCKCHAIN_CONFIG.COP_TO_USDT_RATE).toFixed(BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS),
          BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS,
        );

      const addresses = await blockchainService.deployTokenizacionV2(
        account,
        {
          settlementToken: BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS,
          fundingTarget: copToUsdc(valorActivo),
          minimumCap: 0n,
          tokenPrice: copToUsdc(precioPorToken),
          saleDuration: BigInt(30 * 24 * 60 * 60),
          name: formData.nombreToken || formData.nombreProyecto,
          symbol: formData.simboloToken || 'TKN',
        },
      );

      await dismissLoading();
      await presentLoading({ message: 'Registrando contrato...' });

      const publishedProject = await projectsService.registerV2Contract(projectId, addresses);
      setCreatedTokenizacion(publishedProject);

      setShowSuccess(true);

      await dismissLoading();
      await present({
        message: 'Tokenizacion creada exitosamente',
        duration: 2000,
        color: 'success',
      });
    } catch (error: any) {
      await dismissLoading();
      const msg: string = error?.message ?? '';
      const isGasError =
        msg.includes('insufficient funds') ||
        msg.includes('error_forwarding_sequencer') ||
        msg.includes('gas');
      await present({
        message: isGasError
          ? 'Sin CELO para gas. Obtén fondos en faucet.celo.org/alfajores'
          : msg || 'Error al crear la tokenización',
        duration: 6000,
        color: 'danger',
      });
    }
  };

  const handleFinish = () => {
    if (createdTokenizacion?.id) {
      history.replace(`/inversiones/${createdTokenizacion.id}`);
    } else {
      history.replace('/portafolio');
    }
  };

  const handleCopyLink = async () => {
    if (!createdTokenizacion?.share_slug) return;

    const shareLink = `${window.location.origin}/tokenizacion/${createdTokenizacion.share_slug}`;

    try {
      await navigator.clipboard.writeText(shareLink);
      await present({
        message: 'Link copiado al portapapeles',
        duration: 2000,
        color: 'success',
      });
    } catch (error) {
      console.error('[CrearTokenizacion] Error al copiar link:', error);
      await present({
        message: 'Error al copiar el link',
        duration: 2000,
        color: 'danger',
      });
    }
  };

  const handleInvite = async (
    emailOrUsername: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!createdTokenizacion?.id) {
      return { success: false, message: 'Error: No se encontró el proyecto' };
    }

    try {
      // Determinar si es email o username
      const isEmail = emailOrUsername.includes('@');
      const inviteData = isEmail
        ? { invitee_email: emailOrUsername }
        : { invitee_username: emailOrUsername };

      await projectInvitationsService.create(
        createdTokenizacion.id,
        inviteData
      );

      return {
        success: true,
        message: `Invitación enviada a ${emailOrUsername}`,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al enviar la invitación';
      return { success: false, message: errorMessage };
    }
  };

  const getProgressWidth = () => {
    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    return `${progressPercentage}%`;
  };

  return (
    <IonPage className="ion-page-light">
      <IonContent
        ref={contentRef}
        fullscreen
        className="crear-natillera-page"
        color="light"
      >
        <div className="page-header">
          <button className="header-back-button" onClick={handleClose}>
            <IonIcon icon={arrowBackOutline} />
          </button>
          <h1 className="page-title">Nuevo Proyecto</h1>
        </div>

        {!showSuccess && (
          <div className="progress-section">
            <div className="progress-bar">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`progress-dot ${index + 1 <= currentStep ? 'active' : ''}`}
                />
              ))}
              <motion.div
                className="progress-line"
                initial={{ width: '0%' }}
                animate={{ width: getProgressWidth() }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="step-info">
              <h2 className="step-title">{stepTitles[currentStep - 1]}</h2>
              <span className="step-counter">
                {currentStep}/{totalSteps}
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
                  onTokenRightsChange={handleTokenRightsChange}
                  onTokenFaqsChange={handleTokenFaqsChange}
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
              onInvitarAmigosChange={(value) =>
                handleFieldChange('invitarAmigos', value)
              }
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
                  wallets={wallets}
                  connectButtonStyle={{ width: '100%', borderRadius: '50px', height: '52px', fontSize: '15px', fontWeight: '600' }}
                />
              ) : (
                <button
                  className="btn-primary"
                  onClick={handleCreateTokenizacion}
                >
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
    </IonPage>
  );
};

export default CrearTokenizacionPage;
