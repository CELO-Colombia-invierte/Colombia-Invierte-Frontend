import { IonIcon } from '@ionic/react';
import { cloudUploadOutline, informationCircleOutline, addOutline } from 'ionicons/icons';
import './StepStyles.css';

interface Document {
  id: string;
  motivo: string;
}

interface Step3ContentProps {
  documents: Document[];
  onAddDocument: () => void;
  onUpdateDocument: (id: string, motivo: string) => void;
}

export const Step3Content: React.FC<Step3ContentProps> = ({
  documents,
  onAddDocument,
  onUpdateDocument,
}) => {
  const handleFileUpload = () => {
    console.log('Upload file');
  };

  return (
    <div className="step-content">
      <button type="button" className="upload-button" onClick={handleFileUpload}>
        <IonIcon icon={cloudUploadOutline} className="upload-icon" />
        Subir archivo
      </button>

      <div className="form-group">
        <label className="form-label">
          Agrega documentos
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>

        {documents.map((doc) => (
          <div key={doc.id} className="document-item">
            <input
              type="text"
              className="form-input"
              placeholder="Motivo del documento..."
              value={doc.motivo}
              onChange={(e) => onUpdateDocument(doc.id, e.target.value)}
            />
            <button
              type="button"
              className="upload-button"
              onClick={handleFileUpload}
              style={{ marginTop: '12px' }}
            >
              <IonIcon icon={cloudUploadOutline} className="upload-icon" />
              Subir archivo
            </button>
          </div>
        ))}

        <button
          type="button"
          className="add-space-button"
          onClick={onAddDocument}
        >
          <IonIcon icon={addOutline} />
          Añadir espacio
        </button>
      </div>
    </div>
  );
};
