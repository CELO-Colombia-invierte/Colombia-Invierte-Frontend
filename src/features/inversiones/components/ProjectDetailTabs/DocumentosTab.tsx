import React, { useEffect, useState } from 'react';
import { IonIcon, useIonToast } from '@ionic/react';
import {
  documentTextOutline,
  imageOutline,
  documentOutline,
  downloadOutline,
} from 'ionicons/icons';
import { Project, ProjectDocument } from '@/models/projects';
import { projectsService } from '@/services/projects';
import './ProjectDetailTabs.css';

interface DocumentosTabProps {
  project: Project;
  showJoinButton?: boolean;
  onJoinAction?: () => void;
  joinStatus?: 'pending' | 'approved' | null;
}

export const DocumentosTab: React.FC<DocumentosTabProps> = ({
  project,
  showJoinButton,
  onJoinAction,
  joinStatus,
}) => {
  const [present] = useIonToast();
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [project.id]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const docs = await projectsService.getDocuments(project.id);
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return imageOutline;
    }
    if (mimeType.includes('pdf')) {
      return documentTextOutline;
    }
    return documentOutline;
  };

  const getFileColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return '#3B82F6'; // Azul para imágenes
    }
    if (mimeType.includes('pdf')) {
      return '#EF4444'; // Rojo para PDFs
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) {
      return '#F59E0B'; // Naranja para hojas de cálculo
    }
    return '#6B7280'; // Gris para otros
  };

  const handleDownload = async (doc: ProjectDocument) => {
    try {
      if (!doc.asset?.url) {
        throw new Error('URL del documento no disponible');
      }

      // Abrir el archivo en una nueva pestaña
      window.open(doc.asset.url, '_blank');

      await present({
        message: 'Descargando documento...',
        duration: 2000,
        color: 'success',
      });
    } catch (error: any) {
      await present({
        message: error.message || 'Error al descargar el documento',
        duration: 3000,
        color: 'danger',
      });
    }
  };

  return (
    <div className="documentos-tab">
      <h2 className="documentos-title">Documentos</h2>

      {loading ? (
        <div className="documentos-loading">
          <p>Cargando documentos...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="documentos-empty">
          <IonIcon icon={documentOutline} className="empty-icon" />
          <p>No hay documentos disponibles</p>
        </div>
      ) : (
        <div className="documentos-list">
          {documents.map((doc) => (
            <div key={doc.id} className="documento-item">
              <div
                className="documento-icon"
                style={{
                  color: doc.asset
                    ? getFileColor(doc.asset.mime_type)
                    : '#6B7280',
                }}
              >
                <IonIcon
                  icon={
                    doc.asset
                      ? getFileIcon(doc.asset.mime_type)
                      : documentOutline
                  }
                />
              </div>
              <div className="documento-info">
                <span className="documento-name">{doc.title}</span>
                <span className="documento-meta">
                  {doc.purpose && <span>{doc.purpose}</span>}
                  {doc.asset && (
                    <span className="documento-size">
                      {formatFileSize(doc.asset.size_bytes)}
                    </span>
                  )}
                </span>
              </div>
              <button
                className="documento-download"
                onClick={() => handleDownload(doc)}
                disabled={!doc.asset?.url}
              >
                <span className="download-text">Download</span>
                <IonIcon icon={downloadOutline} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showJoinButton && (
        <div className="documentos-actions">
          <button
            className="action-button secondary"
            onClick={() => window.history.back()}
          >
            Tal vez en otro momento.
          </button>
          <button
            className="action-button primary"
            onClick={onJoinAction}
            disabled={joinStatus === 'pending' || joinStatus === 'approved'}
          >
            {joinStatus === 'pending'
              ? 'Solicitud Enviada'
              : joinStatus === 'approved'
                ? 'Ya eres miembro'
                : `Unirme a la ${project.type === 'NATILLERA' ? 'Natillera' : 'Tokenización'}`}
          </button>
        </div>
      )}
    </div>
  );
};
