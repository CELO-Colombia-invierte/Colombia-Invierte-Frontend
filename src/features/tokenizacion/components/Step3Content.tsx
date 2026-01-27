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
  onImageSelected: (file: File | null) => void;
  onDocumentsChanged: (
    docs: { id: string; file?: File; motivo: string }[]
  ) => void;
  selectedImage: File | null;
  selectedDocuments: { id: string; file?: File; motivo: string }[];
}

export const Step3Content: React.FC<Step3ContentProps> = ({
  onImageSelected,
  onDocumentsChanged,
  selectedImage,
  selectedDocuments,
}) => {
  const [present] = useIonToast();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>(
    {}
  );

  const documentsWithFiles = selectedDocuments.filter((d) => d.file);

  console.log('[Step3] Renderizado:', {
    selectedImage: selectedImage
      ? { name: selectedImage.name, size: selectedImage.size }
      : null,
    selectedDocuments: selectedDocuments.map((d) => ({
      id: d.id,
      motivo: d.motivo,
      file: d.file?.name || null,
    })),
    totalDocumentosConArchivo: documentsWithFiles.length,
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      present({
        message: 'Por favor selecciona un archivo de imagen',
        duration: 3000,
        color: 'danger',
      });
      return;
    }

    console.log('[Step3] Imagen seleccionada:', file.name);
    onImageSelected(file);
    present({
      message: 'Imagen seleccionada',
      duration: 2000,
      color: 'success',
    });
  };

  const handleDocumentSelect = (docId: string, file: File) => {
    const updatedDocs = selectedDocuments.map((d) =>
      d.id === docId ? { ...d, file } : d
    );
    console.log('[Step3] Documento seleccionado:', file.name);
    onDocumentsChanged(updatedDocs);
    present({
      message: 'Documento seleccionado',
      duration: 2000,
      color: 'success',
    });
  };

  const handleAddDocument = () => {
    const newDoc = { id: Date.now().toString(), motivo: '' };
    const updatedDocs = [...selectedDocuments, newDoc];
    console.log('[Step3] Documento agregado, total:', updatedDocs.length);
    onDocumentsChanged(updatedDocs);
  };

  const handleUpdateMotivo = (id: string, motivo: string) => {
    const updatedDocs = selectedDocuments.map((doc) =>
      doc.id === id ? { ...doc, motivo } : doc
    );
    onDocumentsChanged(updatedDocs);
  };

  const handleRemoveDocument = (id: string) => {
    if (selectedDocuments.length > 1) {
      const updatedDocs = selectedDocuments.filter((doc) => doc.id !== id);
      console.log('[Step3] Documento eliminado, total:', updatedDocs.length);
      onDocumentsChanged(updatedDocs);
    }
  };

  return (
    <div className="step-content">
      <div className="form-group">
        <label className="form-label">
          Sube una miniatura para tu Tokenización
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
          {selectedImage ? 'Imagen seleccionada' : 'Subir archivo'}
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
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              {selectedImage.name} ({(selectedImage.size / 1024).toFixed(1)} KB)
            </div>
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">
          Agrega documentos
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>

        {selectedDocuments.map((doc) => (
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
                onChange={(e) => handleUpdateMotivo(doc.id, e.target.value)}
                style={{ flex: 1 }}
              />

              {selectedDocuments.length > 1 && !doc.file && (
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
              {doc.file ? 'Documento seleccionado' : 'Subir archivo'}
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
