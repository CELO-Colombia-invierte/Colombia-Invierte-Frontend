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
import { projectsService } from '@/services/projects';
import {
  Project,
  ProjectType,
  Currency,
  ProjectVisibility,
} from '@/models/projects';
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

// Interface no usada, manejada en Step3Content
// interface Document {
//   id: string;
//   motivo: string;
// }

const CrearNatilleraPage: React.FC = () => {
  const history = useHistory();
  const [present] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();
  const contentRef = useRef<HTMLIonContentElement>(null);
  const [createdNatillera, setCreatedNatillera] = useState<Project | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // Archivos seleccionados (en memoria, no subidos)
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<
    {
      id: string;
      file?: File;
      motivo: string;
    }[]
  >([{ id: '1', motivo: '' }]);
  const [formData, setFormData] = useState<FormData>({
    tipoProyecto: 'Natillera',
    nombreProyecto: '',
    descripcion: '',
    aspectosDestacados: '',
    valorCuota: '',
    moneda: 'COP',
    rendimiento: '',
    cantidadMeses: '',
    fechaPago: '',
    horaPago: '12:00',
    privacidad: 'PRIVATE',
    invitarAmigos: '',
  });
  // Estado manejado en Step3Content
  // const [documents, setDocuments] = useState<Document[]>([
  //   { id: '1', motivo: '' },
  // ]);

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

  const handleCreateNatillera = async () => {
    try {
      const documentsWithFiles = selectedDocuments.filter((d) => d.file);

      console.log(' INICIANDO CREACIÓN DE NATILLERA ');
      console.log(' Datos del formulario:', formData);
      console.log(' Imagen seleccionada:', selectedImage?.name);
      console.log(
        'Documentos seleccionados:',
        documentsWithFiles.map((d) => d.file!.name)
      );

      const valorCuota = parseFloat(formData.valorCuota);
      const rendimiento = parseFloat(formData.rendimiento);
      const cantidadMeses = parseInt(formData.cantidadMeses);

      if (isNaN(valorCuota) || valorCuota < 1000) {
        await present({
          message: 'El valor de la cuota debe ser mínimo $1,000 COP',
          duration: 3000,
          color: 'danger',
        });
        return;
      }

      if (isNaN(rendimiento) || rendimiento < 0 || rendimiento > 100) {
        await present({
          message: 'El rendimiento debe estar entre 0% y 100%',
          duration: 3000,
          color: 'danger',
        });
        return;
      }

      if (isNaN(cantidadMeses) || cantidadMeses < 1 || cantidadMeses > 120) {
        await present({
          message: 'La cantidad de meses debe estar entre 1 y 120',
          duration: 3000,
          color: 'danger',
        });
        return;
      }

      await presentLoading({ message: 'Creando natillera...' });

      const paymentDate = new Date(formData.fechaPago);
      if (formData.horaPago) {
        const [hours, minutes] = formData.horaPago.split(':');
        paymentDate.setHours(parseInt(hours), parseInt(minutes));
      }

      const natilleraData = {
        name: formData.nombreProyecto,
        description_rich: formData.descripcion,
        highlights_rich: formData.aspectosDestacados,
        visibility: formData.privacidad as ProjectVisibility,
        type: ProjectType.NATILLERA,
        natillera_details: {
          monthly_fee_amount: valorCuota,
          monthly_fee_currency: formData.moneda as Currency,
          expected_annual_return_pct: rendimiento,
          duration_months: cantidadMeses,
          payment_deadline_at: paymentDate.toISOString(),
        },
      };

      const project = await projectsService.create(natilleraData);
      console.log(' Proyecto creado:', project);
      console.log(' Project ID:', project.id);
      console.log(
        ' Creado por:',
        project.owner_user?.displayName || project.owner_user?.username
      );

      const projectId = project.id;

      if (selectedImage) {
        await dismissLoading();
        await presentLoading({ message: 'Subiendo imagen miniatura...' });
        console.log(' Subiendo imagen:', selectedImage.name);

        const uploadedImage = await projectsService.uploadImage(
          projectId,
          selectedImage,
          true,
          'Miniatura de la natillera'
        );
        console.log(' Imagen subida:', uploadedImage);
      }
      if (documentsWithFiles.length > 0) {
        for (let i = 0; i < documentsWithFiles.length; i++) {
          const doc = documentsWithFiles[i];
          await dismissLoading();
          await presentLoading({
            message: `Subiendo documento ${i + 1}/${documentsWithFiles.length}...`,
          });
          console.log(` Subiendo documento ${i + 1}:`, doc.file!.name);

          const uploadedDoc = await projectsService.uploadDocument(
            projectId,
            doc.file!,
            doc.motivo || doc.file!.name,
            'GENERAL',
            doc.motivo
          );
          console.log(`Documento ${i + 1} subido:`, uploadedDoc);
        }
      }

      setCreatedNatillera(project);
      setShowSuccess(true);

      await dismissLoading();
      await present({
        message: 'Natillera creada exitosamente',
        duration: 2000,
        color: 'success',
      });

      console.log(' NATILLERA CREADA EXITOSAMENTE ');
      console.log(' Resumen:');
      console.log('   Nombre:', project.name);
      console.log('   ID:', project.id);
      console.log('   Creador:', project.owner_user?.displayName);
      console.log('   Imagen subida:', selectedImage ? 'Sí' : 'No');
      console.log('   Documentos subidos:', selectedDocuments.length);
    } catch (error: any) {
      console.error('❌ Error al crear natillera:', error);
      await dismissLoading();
      await present({
        message: error.message || 'Error al crear la natillera',
        duration: 3000,
        color: 'danger',
      });
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Funciones manejadas en Step3Content
  // const handleAddDocument = () => {
  //   const newDoc = { id: Date.now().toString(), motivo: '' };
  //   setDocuments([...documents, newDoc]);
  // };

  // const handleUpdateDocument = (id: string, motivo: string) => {
  //   setDocuments(
  //     documents.map((doc) => (doc.id === id ? { ...doc, motivo } : doc))
  //   );
  // };

  const handleCopyLink = () => {
    if (createdNatillera?.share_slug) {
      const link = `${window.location.origin}/natillera/${createdNatillera.share_slug}`;
      navigator.clipboard.writeText(link);
      present({
        message: 'Link copiado al portapapeles',
        duration: 2000,
        color: 'success',
      });
    }
  };

  const handleFinish = () => {
    if (createdNatillera?.id) {
      history.push(`/natillera/${createdNatillera.id}`);
    } else {
      history.push('/portafolio');
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
                  onImageSelected={setSelectedImage}
                  onDocumentsChanged={setSelectedDocuments}
                  selectedImage={selectedImage}
                  selectedDocuments={selectedDocuments}
                />
              )}
              {currentStep === 4 && (
                <Step4Preview
                  natilleraName={formData.nombreProyecto}
                  userName="UserName"
                  description={formData.descripcion}
                  aspectosDestacados={formData.aspectosDestacados}
                  formData={formData}
                  selectedImage={selectedImage}
                  selectedDocuments={selectedDocuments}
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
              shareLink={
                createdNatillera?.share_slug
                  ? `${window.location.origin}/natillera/${createdNatillera.share_slug}`
                  : ''
              }
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
