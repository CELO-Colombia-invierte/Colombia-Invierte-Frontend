import React, { useRef } from 'react';
import { IonIcon } from '@ionic/react';
import {
  cloudUploadOutline,
  informationCircleOutline,
  addOutline,
  closeCircle,
  checkmarkCircle,
} from 'ionicons/icons';
import { useIonToast } from '@ionic/react';
import './StepStyles.css';

interface Step3ContentProps {
  onImageSelected: (file: File) => void;
  onDocumentsChanged: (
    docs: { id: string; file: File; motivo: string }[]
  ) => void;
  selectedImage: File | null;
  selectedDocuments: { id: string; file: File; motivo: string }[];
}

export const Step3Content: React.FC<Step3ContentProps> = ({
  onImageSelected,
  onDocumentsChanged,
  selectedImage,
  // selectedDocuments, // No usado actualmente
}) => {
  const [present] = useIonToast();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>(
    {}
  );

  // Estado local para manejar los documentos
  const [localDocuments, setLocalDocuments] = React.useState<
    {
      id: string;
      motivo: string;
      file?: File;
    }[]
  >([{ id: '1', motivo: '' }]);

  // Manejar selección de imagen miniatura
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      present({
        message: 'Por favor selecciona un archivo de imagen',
        duration: 3000,
        color: 'danger',
      });
      return;
    }

    onImageSelected(file);
    present({
      message: 'Imagen seleccionada',
      duration: 2000,
      color: 'success',
    });
  };

  // Manejar selección de documento
  const handleDocumentSelect = (docId: string, file: File) => {
    const doc = localDocuments.find((d) => d.id === docId);
    if (!doc) return;

    // Actualizar documento local con el archivo
    const updatedDocs = localDocuments.map((d) =>
      d.id === docId ? { ...d, file } : d
    );
    setLocalDocuments(updatedDocs);

    // Actualizar lista de documentos seleccionados en el padre
    // Si no hay motivo, usar el nombre del archivo
    const docsWithFiles = updatedDocs
      .filter((d) => d.file)
      .map((d) => ({
        id: d.id,
        file: d.file!,
        motivo: d.motivo.trim() || d.file!.name,
      }));
    onDocumentsChanged(docsWithFiles);

    present({
      message: 'Documento seleccionado',
      duration: 2000,
      color: 'success',
    });
  };

  const handleAddDocument = () => {
    const newDoc = {
      id: Date.now().toString(),
      motivo: '',
    };
    setLocalDocuments([...localDocuments, newDoc]);
  };

  const handleUpdateDocument = (id: string, motivo: string) => {
    const updatedDocs = localDocuments.map((doc) =>
      doc.id === id ? { ...doc, motivo } : doc
    );
    setLocalDocuments(updatedDocs);

    // Actualizar en el padre si ya tiene archivo
    // Si no hay motivo, usar el nombre del archivo
    const docsWithFiles = updatedDocs
      .filter((d) => d.file)
      .map((d) => ({
        id: d.id,
        file: d.file!,
        motivo: d.motivo.trim() || d.file!.name,
      }));
    onDocumentsChanged(docsWithFiles);
  };

  const handleRemoveDocument = (id: string) => {
    if (localDocuments.length > 1) {
      const updatedDocs = localDocuments.filter((doc) => doc.id !== id);
      setLocalDocuments(updatedDocs);

      // Actualizar en el padre
      // Si no hay motivo, usar el nombre del archivo
      const docsWithFiles = updatedDocs
        .filter((d) => d.file)
        .map((d) => ({
          id: d.id,
          file: d.file!,
          motivo: d.motivo.trim() || d.file!.name,
        }));
      onDocumentsChanged(docsWithFiles);
    }
  };

  return (
    <div className="step-content">
      {/* IMAGEN MINIATURA */}
      <div className="form-group">
        <label className="form-label">
          Sube una miniatura para tu Natillera
        </label>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageSelect}
        />

        <button
          type="button"
          className="upload-button"
          onClick={() => imageInputRef.current?.click()}
          style={{
            backgroundColor: selectedImage ? '#10b981' : undefined,
          }}
        >
          <IonIcon
            icon={selectedImage ? checkmarkCircle : cloudUploadOutline}
            className="upload-icon"
          />
          {selectedImage ? 'Imagen seleccionada ✓' : 'Subir archivo'}
        </button>

        {selectedImage && (
          <div className="image-preview" style={{ marginTop: '16px' }}>
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Miniatura"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                borderRadius: '8px',
                objectFit: 'cover',
              }}
            />
            <div
              style={{
                fontSize: '12px',
                color: '#666',
                marginTop: '8px',
              }}
            >
              {selectedImage.name} ({(selectedImage.size / 1024).toFixed(1)} KB)
            </div>
          </div>
        )}
      </div>

      {/* DOCUMENTOS */}
      <div className="form-group">
        <label className="form-label">
          Agrega documentos
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>

        {localDocuments.map((doc) => (
          <div
            key={doc.id}
            className="document-item"
            style={{ marginBottom: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Motivo del documento (opcional)..."
                value={doc.motivo}
                onChange={(e) => handleUpdateDocument(doc.id, e.target.value)}
                style={{ flex: 1 }}
              />

              {localDocuments.length > 1 && !doc.file && (
                <button
                  type="button"
                  onClick={() => handleRemoveDocument(doc.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: '8px',
                  }}
                >
                  <IonIcon icon={closeCircle} style={{ fontSize: '24px' }} />
                </button>
              )}
            </div>

            <input
              ref={(el) => (documentInputRefs.current[doc.id] = el)}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleDocumentSelect(doc.id, file);
              }}
            />

            <button
              type="button"
              className="upload-button"
              onClick={() => documentInputRefs.current[doc.id]?.click()}
              disabled={!!doc.file}
              style={{
                marginTop: '12px',
                backgroundColor: doc.file ? '#10b981' : undefined,
                cursor: doc.file ? 'not-allowed' : 'pointer',
              }}
            >
              <IonIcon
                icon={doc.file ? checkmarkCircle : cloudUploadOutline}
                className="upload-icon"
              />
              {doc.file ? 'Documento seleccionado ✓' : 'Subir archivo'}
            </button>

            {doc.file && (
              <div
                className="document-info"
                style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>📄</span>
                <span>{doc.file.name}</span>
                <span>({(doc.file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          className="add-space-button"
          onClick={handleAddDocument}
          style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <IonIcon icon={addOutline} />
          Añadir espacio
        </button>
      </div>
    </div>
  );
};
