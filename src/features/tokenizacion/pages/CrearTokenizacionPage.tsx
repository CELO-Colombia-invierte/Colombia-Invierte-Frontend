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
import './CrearTokenizacionPage.css';

const CrearTokenizacionPage: React.FC = () => {
  const history = useHistory();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const totalSteps = 4;

  const stepTitles = [
    'Información básica',
    'Información financiera',
    'Contenido y descargables',
    'Así se verá tu Tokenización',
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

  const handleCreateTokenizacion = () => {
    setShowSuccess(true);
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
              {currentStep === 1 && <Step1BasicInfo />}
              {currentStep === 2 && <Step2FinancialInfo />}
              {currentStep === 3 && <Step3Content />}
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
