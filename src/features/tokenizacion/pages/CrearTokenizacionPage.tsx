import React, { useState } from 'react';
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
import { projectsService } from '@/services/projects';
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
    { id: string; file: File; motivo: string }[]
  >([]);

  const [tokenRights, setTokenRights] = useState<TokenRightDto[]>([
    { id: '1', title: '' },
  ]);

  const [tokenFaqs, setTokenFaqs] = useState<TokenFaqDto[]>([
    { id: '1', question: '', answer: '' },
  ]);

  console.log('[CrearTokenizacion] Estado inicial cargado');

  const totalSteps = 4;

  const stepTitles = [
    'Información básica',
    'Información financiera',
    'Contenido y descargables',
    'Así se verá tu Tokenización',
  ];

  const handleFieldChange = (field: string, value: string) => {
    const updatedFormData = { ...formData, [field]: value };
    console.log('[CrearTokenizacion] handleFieldChange:', {
      field,
      value,
      formData: updatedFormData,
    });
    setFormData(updatedFormData);
  };

  const handleTokenRightsChange = (rights: TokenRightDto[]) => {
    console.log('[CrearTokenizacion] tokenRights actualizado:', rights);
    setTokenRights(rights);
  };

  const handleTokenFaqsChange = (faqs: TokenFaqDto[]) => {
    console.log('[CrearTokenizacion] tokenFaqs actualizado:', faqs);
    setTokenFaqs(faqs);
  };

  const handleClose = () => {
    console.log('[CrearTokenizacion] handleClose');
    history.push('/portafolio');
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      console.log('[CrearTokenizacion] handleNext:', {
        currentStep: currentStep + 1,
      });
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      console.log('[CrearTokenizacion] handlePrevious:', {
        currentStep: currentStep - 1,
      });
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateTokenizacion = async () => {
    try {
      console.log('[CrearTokenizacion] Iniciando creacion con backend');
      console.log('[CrearTokenizacion] Datos:', {
        formData,
        tokenRights,
        tokenFaqs,
        selectedImage: selectedImage?.name || null,
        selectedDocuments: selectedDocuments.length,
      });

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

      console.log('[CrearTokenizacion] DTO preparado:', tokenizacionData);

      const project = await projectsService.create(tokenizacionData);
      console.log('[CrearTokenizacion] Proyecto creado:', project);
      console.log('[CrearTokenizacion] Project ID:', project.id);

      const projectId = project.id;

      if (selectedImage) {
        await dismissLoading();
        await presentLoading({ message: 'Subiendo imagen miniatura...' });
        console.log('[CrearTokenizacion] Subiendo imagen:', selectedImage.name);

        const uploadedImage = await projectsService.uploadImage(
          projectId,
          selectedImage,
          true,
          'Miniatura de tokenizacion'
        );
        console.log('[CrearTokenizacion] Imagen subida:', uploadedImage);
      }

      if (selectedDocuments.length > 0) {
        for (let i = 0; i < selectedDocuments.length; i++) {
          const doc = selectedDocuments[i];
          await dismissLoading();
          await presentLoading({
            message: `Subiendo documento ${i + 1}/${selectedDocuments.length}...`,
          });
          console.log('[CrearTokenizacion] Subiendo documento:', doc.file.name);

          const uploadedDoc = await projectsService.uploadDocument(
            projectId,
            doc.file,
            doc.motivo || doc.file.name,
            'GENERAL',
            doc.motivo
          );
          console.log('[CrearTokenizacion] Documento subido:', uploadedDoc);
        }
      }

      setCreatedTokenizacion(project);
      setShowSuccess(true);

      await dismissLoading();
      await present({
        message: 'Tokenizacion creada exitosamente',
        duration: 2000,
        color: 'success',
      });

      console.log('[CrearTokenizacion] Proceso completado exitosamente');
      console.log('[CrearTokenizacion] Resumen:', {
        nombre: project.name,
        id: project.id,
        imagen: selectedImage ? 'Si' : 'No',
        documentos: selectedDocuments.length,
        derechos: rightsFiltered.length,
        faqs: faqsFiltered.length,
      });
    } catch (error: any) {
      console.log('[CrearTokenizacion] Error al crear:', error.message);
      await dismissLoading();
      await present({
        message: error.message || 'Error al crear la tokenizacion',
        duration: 3000,
        color: 'danger',
      });
    }
  };

  const handleFinish = () => {
    console.log('[CrearTokenizacion] handleFinish');
    history.push('/portafolio');
  };

  const getProgressWidth = () => {
    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    return `${progressPercentage}%`;
  };

  return (
    <IonPage className="ion-page-light">
      <IonContent fullscreen className="crear-natillera-page" color="light">
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
            <Step4Success />
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
