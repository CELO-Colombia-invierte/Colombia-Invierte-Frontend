import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './StepStyles.css';

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

interface Step4PreviewProps {
  natilleraName: string;
  userName: string;
  description: string;
  aspectosDestacados: string;
  formData: FormData;
  selectedImage: File | null;
  selectedDocuments: { id: string; file?: File; motivo: string }[];
}

export const Step4Preview: React.FC<Step4PreviewProps> = ({
  natilleraName,
  description,
  aspectosDestacados,
  formData,
  selectedImage,
  selectedDocuments,
}) => {
  const [activeTab, setActiveTab] = useState<
    'resumen' | 'finanzas' | 'documentos'
  >('resumen');

  return (
    <div className="step-content preview-only-step">
      <h2 className="preview-main-title">Así se verá tu Natillera</h2>

      <div className="natillera-preview">
        <div className="preview-image-placeholder">
          {selectedImage ? (
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Miniatura de la natillera"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%234A90E2' width='100' height='100'/%3E%3C/svg%3E"
              alt="Placeholder"
            />
          )}
        </div>

        <div className="preview-tabs">
          <button
            className={`preview-tab ${activeTab === 'resumen' ? 'active' : ''}`}
            onClick={() => setActiveTab('resumen')}
          >
            Resumen
          </button>
          <button
            className={`preview-tab ${activeTab === 'finanzas' ? 'active' : ''}`}
            onClick={() => setActiveTab('finanzas')}
          >
            Finanzas
          </button>
          <button
            className={`preview-tab ${activeTab === 'documentos' ? 'active' : ''}`}
            onClick={() => setActiveTab('documentos')}
          >
            Documentos
          </button>
        </div>

        <div className="preview-content">
          <AnimatePresence mode="wait">
            {activeTab === 'resumen' && (
              <motion.div
                key="resumen"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <h3 className="preview-name">
                  {natilleraName || 'NatilleraName #145'}
                </h3>

                <div className="preview-section">
                  <h4 className="preview-section-title">
                    Descripción de proyecto
                  </h4>
                  <p className="preview-section-text">
                    {description ||
                      'Esta es una breve descripción que describe este producto con detalle y es atractivo.'}
                  </p>
                </div>

                <div className="preview-section">
                  <h4 className="preview-section-title">Aspectos destacados</h4>
                  <p className="preview-section-text">
                    {aspectosDestacados ||
                      'Esta es una breve descripción que describe este producto con detalle y es atractivo.'}
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'finanzas' && (
              <motion.div
                key="finanzas"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <h3 className="preview-section-title">
                  Información financiera
                </h3>

                <div className="finance-item">
                  <div className="finance-icon">💰</div>
                  <div className="finance-details">
                    <div className="finance-value">
                      {formData.valorCuota
                        ? `${Number(formData.valorCuota).toLocaleString('es-CO')} ${formData.moneda}`
                        : 'N/A'}
                    </div>
                    <div className="finance-label">
                      Valor de la cuota mensual ⓘ
                    </div>
                  </div>
                </div>

                <div className="finance-item">
                  <div className="finance-icon">🌱</div>
                  <div className="finance-details">
                    <div className="finance-value">
                      {formData.rendimiento
                        ? `${formData.rendimiento}%`
                        : 'N/A'}
                    </div>
                    <div className="finance-label">
                      Rendimiento anual esperado ⓘ
                    </div>
                  </div>
                </div>

                <div className="finance-item">
                  <div className="finance-icon">🔥</div>
                  <div className="finance-details">
                    <div className="finance-value">
                      {formData.cantidadMeses
                        ? `${formData.cantidadMeses} Meses`
                        : 'N/A'}
                    </div>
                    <div className="finance-label">Cantidad de meses ⓘ</div>
                  </div>
                </div>

                <div className="finance-item">
                  <div className="finance-icon">📅</div>
                  <div className="finance-details">
                    <div className="finance-value">
                      {formData.fechaPago && formData.horaPago
                        ? `${new Date(formData.fechaPago).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })} | ${formData.horaPago}`
                        : 'N/A'}
                    </div>
                    <div className="finance-label">
                      Fecha máxima de pago mensual ⓘ
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'documentos' && (
              <motion.div
                key="documentos"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <h3 className="preview-section-title">Documentos</h3>

                {selectedDocuments.length > 0 ? (
                  <div className="document-list">
                    {selectedDocuments
                      .filter((doc) => doc.file)
                      .map((doc) => {
                        const fileExtension = doc
                          .file!.name.split('.')
                          .pop()
                          ?.toLowerCase();
                        const getIcon = () => {
                          if (fileExtension === 'pdf') return '📄';
                          if (
                            ['jpg', 'jpeg', 'png', 'gif'].includes(
                              fileExtension || ''
                            )
                          )
                            return '🖼️';
                          if (
                            ['csv', 'xlsx', 'xls'].includes(fileExtension || '')
                          )
                            return '📊';
                          return '📎';
                        };

                        return (
                          <div key={doc.id} className="document-list-item">
                            <div className="document-icon">{getIcon()}</div>
                            <div className="document-info">
                              <div className="document-name">
                                {doc.file!.name}
                              </div>
                              <div className="document-desc">
                                {doc.motivo || 'Sin descripción'}
                              </div>
                            </div>
                            <button className="document-download">
                              {(doc.file!.size / 1024).toFixed(1)} KB
                            </button>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p
                    style={{
                      color: '#999',
                      textAlign: 'center',
                      padding: '40px 20px',
                      fontSize: '14px',
                    }}
                  >
                    No hay documentos seleccionados
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
