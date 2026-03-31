import React, { useState } from 'react';
import { IonPage, IonContent, useIonToast } from '@ionic/react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { PropuestaFormData } from '@/types/propuesta';
import { propuestasService } from '@/services/propuestas/propuestas.service';
import './PropuestaPreviewPage.css';

interface LocationState {
  formData: PropuestaFormData;
  projectId: string;
}

const PropuestaPreviewPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const [present] = useIonToast();
  const [submitting, setSubmitting] = useState(false);

  const formData = location.state?.formData;

  if (!formData) {
    history.goBack();
    return null;
  }

  const formatMonto = (amount: number | null | undefined) =>
    (amount ?? 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

  const handleEditar = () => {
    history.goBack();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await propuestasService.create(projectId, formData);
      await present({
        message: 'Propuesta enviada exitosamente',
        duration: 2500,
        color: 'success',
      });
      history.push(`/inversiones/${projectId}`);
    } catch {
      await present({
        message: 'Error al enviar la propuesta',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="preview-page">
        <div className="preview-header">
          <button className="preview-back" onClick={() => history.goBack()}>
            ←
          </button>
          <h1 className="preview-title">Previsualización</h1>
        </div>

        <div className="preview-content">
          <h2 className="preview-section-title">Resumen</h2>

          {formData.background_image_url && (
            <img
              src={formData.background_image_url}
              alt={formData.title}
              className="preview-image"
            />
          )}

          <div className="preview-title-row">
            <h3 className="preview-propuesta-title">{formData.title}</h3>
            <button className="preview-edit-btn" onClick={handleEditar}>
              Editar
            </button>
          </div>

          <p className="preview-description">{formData.description}</p>

          <div className="preview-details">
            <div className="preview-detail-item">
              <span className="preview-detail-label">Encargado para el retiro de dinero:</span>
              <span className="preview-detail-value">{formData.responsible_name}</span>
            </div>

            <div className="preview-detail-item">
              <span className="preview-detail-label">Monto a retirar:</span>
              <span className="preview-detail-value">{formatMonto(formData.withdrawal_amount)}</span>
            </div>

            {formData.estimated_profit !== undefined && (
              <div className="preview-detail-item">
                <span className="preview-detail-label">Ganancia de dinero estimado:</span>
                <span className="preview-detail-value">{formatMonto(formData.estimated_profit)}</span>
              </div>
            )}
          </div>

        </div>

        <div className="preview-footer">
          <button
            className="propuesta-btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Enviando...' : 'Hacer propuesta'}
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PropuestaPreviewPage;
