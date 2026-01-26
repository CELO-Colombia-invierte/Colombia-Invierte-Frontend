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

  const handleCreateTokenizacion = () => {
    console.log('[CrearTokenizacion] handleCreateTokenizacion:', {
      formData,
      tokenRights,
      tokenFaqs,
      selectedImage: selectedImage?.name || null,
      selectedDocuments: selectedDocuments.length,
    });

    // TODO: Implementar creacion con API (Grupo 3)
    setShowSuccess(true);
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
                  projectName=""
                  userName=""
                  description=""
                  aspectosDestacados=""
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
