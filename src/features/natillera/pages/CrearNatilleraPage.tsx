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
import './CrearNatilleraPage.css';

interface FormData {
  tipoProyecto: string;
  nombreProyecto: string;
  descripcion: string;
  aspectosDestacados: string;
  valorCuota: string;
  moneda: string;
  rendimiento: string;
  cantidadMeses: string;
  fechaPago: string;
  horaPago: string;
  privacidad: string;
  invitarAmigos: string;
}

interface Document {
  id: string;
  motivo: string;
}

const CrearNatilleraPage: React.FC = () => {
  const history = useHistory();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    tipoProyecto: 'Natillera',
    nombreProyecto: '',
    descripcion: '',
    aspectosDestacados: '',
    valorCuota: '',
    moneda: 'USD',
    rendimiento: '',
    cantidadMeses: '',
    fechaPago: '',
    horaPago: '12:00',
    privacidad: 'Privado',
    invitarAmigos: '',
  });
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', motivo: '' },
  ]);

  const totalSteps = 4;

  const stepTitles = [
    'Información básica',
    'Información financiera',
    'Contenido y descargables',
    'Así se verá tu Natillera',
  ];

  const handleClose = () => {
    history.push('/portafolio');
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateNatillera = () => {
    setShowSuccess(true);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddDocument = () => {
    const newDoc = { id: Date.now().toString(), motivo: '' };
    setDocuments([...documents, newDoc]);
  };

  const handleUpdateDocument = (id: string, motivo: string) => {
    setDocuments(
      documents.map((doc) => (doc.id === id ? { ...doc, motivo } : doc))
    );
  };

  const handleCopyLink = () => {
    const link = 'https://colombiainvierte.com/natil...';
    navigator.clipboard.writeText(link);
  };

  const handleFinish = () => {
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
                  formData={formData}
                  onChange={handleFieldChange}
                />
              )}
              {currentStep === 2 && (
                <Step2FinancialInfo
                  formData={formData}
                  onChange={handleFieldChange}
                />
              )}
              {currentStep === 3 && (
                <Step3Content
                  documents={documents}
                  onAddDocument={handleAddDocument}
                  onUpdateDocument={handleUpdateDocument}
                />
              )}
              {currentStep === 4 && (
                <Step4Preview
                  natilleraName={formData.nombreProyecto}
                  userName="UserName"
                  description={formData.descripcion}
                  aspectosDestacados={formData.aspectosDestacados}
                />
              )}
            </>
          ) : (
            <Step4Success
              natilleraName={formData.nombreProyecto}
              userName="UserName"
              description={formData.descripcion}
              aspectosDestacados={formData.aspectosDestacados}
              privacidad={formData.privacidad}
              invitarAmigos={formData.invitarAmigos}
              shareLink="https://colombiainvierte.com/natil..."
              onPrivacidadChange={(value) =>
                handleFieldChange('privacidad', value)
              }
              onInvitarAmigosChange={(value) =>
                handleFieldChange('invitarAmigos', value)
              }
              onCopyLink={handleCopyLink}
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
              ) : (
                <button className="btn-primary" onClick={handleCreateNatillera}>
                  Crear Natillera
                </button>
              )}
            </>
          ) : (
            <button className="btn-primary" onClick={handleFinish}>
              Ir a mi Natillera
            </button>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CrearNatilleraPage;
