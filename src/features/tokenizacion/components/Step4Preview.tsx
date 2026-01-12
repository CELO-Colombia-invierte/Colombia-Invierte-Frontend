import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './StepStyles.css';

interface Step4PreviewProps {
  projectName: string;
  userName: string;
  description: string;
  aspectosDestacados: string;
}

export const Step4Preview: React.FC<Step4PreviewProps> = ({
  projectName,
  userName,
  description,
  aspectosDestacados,
}) => {
  const [activeTab, setActiveTab] = useState<
    'resumen' | 'finanzas' | 'documentos'
  >('resumen');

  return (
    <div className="step-content preview-only-step">
      <h2 className="preview-main-title">Así se verá tu Natillera</h2>

      <div className="natillera-preview">
        <div className="preview-image-placeholder">
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%234A90E2' width='100' height='100'/%3E%3C/svg%3E"
            alt="Project preview"
          />
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
                  {projectName || 'NatilleraName #145'}
                </h3>
                <div className="preview-user">{userName || 'UserName'} ✓</div>

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
                    <div className="finance-value">200.000 COP</div>
                    <div className="finance-label">
                      Valor del activo ⓘ
                    </div>
                  </div>
                </div>

                <div className="finance-item">
                  <div className="finance-icon">🌱</div>
                  <div className="finance-details">
                    <div className="finance-value">50%</div>
                    <div className="finance-label">
                      Rendimiento anual esperado ⓘ
                    </div>
                  </div>
                </div>

                <div className="finance-item">
                  <div className="finance-icon">🪙</div>
                  <div className="finance-details">
                    <div className="finance-value">$10 USD</div>
                    <div className="finance-label">Precio por token ⓘ</div>
                  </div>
                </div>

                <div className="finance-item">
                  <div className="finance-icon">📊</div>
                  <div className="finance-details">
                    <div className="finance-value">1,000 Tokens</div>
                    <div className="finance-label">Total de tokens disponibles ⓘ</div>
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

                <div className="document-list">
                  <div className="document-list-item">
                    <div className="document-icon pdf">📄</div>
                    <div className="document-info">
                      <div className="document-name">Firmas.pdf</div>
                      <div className="document-desc">Motivo del documento</div>
                    </div>
                    <button className="document-download">
                      1.4 MB Download
                    </button>
                  </div>

                  <div className="document-list-item">
                    <div className="document-icon image">🖼️</div>
                    <div className="document-info">
                      <div className="document-name">Contrato multiple.jpg</div>
                      <div className="document-desc">Motivo del documento</div>
                    </div>
                    <button className="document-download">
                      1.4 MB Download
                    </button>
                  </div>

                  <div className="document-list-item">
                    <div className="document-icon csv">📊</div>
                    <div className="document-info">
                      <div className="document-name">Libro de cuentas.csv</div>
                      <div className="document-desc">Motivo del documento</div>
                    </div>
                    <button className="document-download">
                      1.4 MB Download
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
