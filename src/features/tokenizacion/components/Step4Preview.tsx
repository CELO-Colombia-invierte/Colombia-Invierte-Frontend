import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonIcon } from '@ionic/react';
import { chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import './StepStyles.css';

interface TokenRightDto {
  id: string;
  title: string;
}

interface TokenFaqDto {
  id: string;
  question: string;
  answer: string;
}

interface Step4PreviewProps {
  projectName: string;
  description: string;
  aspectosDestacados: string;
  valorActivo: string;
  moneda: string;
  rendimiento: string;
  precioPorToken: string;
  monedaToken: string;
  totalTokens: string;
  simboloToken: string;
  nombreToken: string;
  tokenRights: TokenRightDto[];
  tokenFaqs: TokenFaqDto[];
  selectedImage: File | null;
  selectedDocuments: { id: string; file?: File; motivo: string }[];
}

export const Step4Preview: React.FC<Step4PreviewProps> = ({
  projectName,
  description,
  aspectosDestacados,
  valorActivo,
  moneda,
  rendimiento,
  precioPorToken,
  monedaToken,
  totalTokens,
  simboloToken,
  nombreToken,
  tokenRights,
  tokenFaqs,
  selectedImage,
  selectedDocuments,
}) => {
  const [activeTab, setActiveTab] = useState<
    'resumen' | 'finanzas' | 'documentos'
  >('resumen');
  const [expandedFaqs, setExpandedFaqs] = useState<{ [key: string]: boolean }>(
    {}
  );

  const rightsFiltered = tokenRights.filter((r) => r.title.trim() !== '');
  const faqsFiltered = tokenFaqs.filter(
    (f) => f.question.trim() !== '' && f.answer.trim() !== ''
  );

  const toggleFaq = (faqId: string) => {
    setExpandedFaqs((prev) => ({
      ...prev,
      [faqId]: !prev[faqId],
    }));
  };

  const formatCurrency = (value: string, currency: string) => {
    if (!value) return 'N/A';
    const num = parseFloat(value);
    if (isNaN(num)) return 'N/A';
    return currency === 'COP'
      ? `${num.toLocaleString('es-CO')} COP`
      : `$${num.toLocaleString('en-US')} ${currency}`;
  };

  const formatNumber = (value: string) => {
    if (!value) return 'N/A';
    const num = parseInt(value);
    if (isNaN(num)) return 'N/A';
    return num.toLocaleString('es-CO');
  };

  return (
    <div className="step-content preview-only-step">
      <h2 className="preview-main-title">Así se verá tu Tokenización</h2>

      <div className="natillera-preview">
        <div className="preview-image-placeholder">
          {selectedImage ? (
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Project preview"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          ) : (
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%234A90E2' width='100' height='100'/%3E%3C/svg%3E"
              alt="Project preview"
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
                  {projectName || 'ProjectName #145'}
                </h3>
                <div className="preview-user">UserName ✓</div>

                <div className="preview-section-static">
                  <h4 className="preview-section-title">
                    Descripción de proyecto
                  </h4>
                  <p className="preview-section-text">
                    {description ||
                      'Esta es una breve descripción que describe este producto con detalle y es atractivo.'}
                  </p>
                </div>

                <div className="preview-section-static">
                  <h4 className="preview-section-title">Aspectos destacados</h4>
                  <p className="preview-section-text">
                    {aspectosDestacados ||
                      'Esta es una breve descripción que describe este producto con detalle y es atractivo.'}
                  </p>
                </div>

                <div className="preview-section-static">
                  <h4 className="preview-section-title">Derechos del token</h4>
                  {rightsFiltered.length > 0 ? (
                    <div className="rights-static-list">
                      {rightsFiltered.map((right, index) => (
                        <p key={right.id} className="preview-section-text">
                          {right.title}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="preview-section-text">
                      Esta es una breve descripción que describe este producto
                      con detalle y es atractivo.
                    </p>
                  )}
                </div>

                <div className="preview-section-static">
                  <h4 className="preview-section-title">
                    Preguntas frecuentes
                  </h4>
                  {faqsFiltered.length > 0 ? (
                    <div className="faqs-accordion-list">
                      {faqsFiltered.map((faq) => (
                        <div
                          key={faq.id}
                          className={`faq-accordion-item ${expandedFaqs[faq.id] ? 'expanded' : ''}`}
                        >
                          <button
                            className="faq-accordion-button"
                            onClick={() => toggleFaq(faq.id)}
                          >
                            <span className="faq-question-text">
                              {faq.question}
                            </span>
                            <IonIcon
                              icon={
                                expandedFaqs[faq.id]
                                  ? chevronUpOutline
                                  : chevronDownOutline
                              }
                              className="faq-chevron-icon"
                            />
                          </button>
                          {expandedFaqs[faq.id] && (
                            <div className="faq-answer-content">
                              <p className="preview-section-text">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="preview-section-text">
                      No se agregaron preguntas frecuentes.
                    </p>
                  )}
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
                      {formatCurrency(valorActivo, moneda)}
                    </div>
                    <div className="finance-label">Valor del activo ⓘ</div>
                  </div>
                </div>

                <div className="finance-item">
                  <div className="finance-icon">🌱</div>
                  <div className="finance-details">
                    <div className="finance-value">
                      {rendimiento ? `${rendimiento}%` : 'N/A'}
                    </div>
                    <div className="finance-label">
                      Rendimiento anual esperado ⓘ
                    </div>
                  </div>
                </div>

                <div className="finance-item">
                  <div className="finance-icon">🪙</div>
                  <div className="finance-details">
                    <div className="finance-value">
                      {formatCurrency(precioPorToken, monedaToken)}
                    </div>
                    <div className="finance-label">Precio por token ⓘ</div>
                  </div>
                </div>

                <div className="finance-item">
                  <div className="finance-icon">📊</div>
                  <div className="finance-details">
                    <div className="finance-value">
                      {formatNumber(totalTokens)}{' '}
                      {simboloToken ? simboloToken : 'Tokens'}
                    </div>
                    <div className="finance-label">
                      Total de tokens disponibles ⓘ
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

                {selectedDocuments.filter((d) => d.file).length > 0 ? (
                  <div className="document-list">
                    {selectedDocuments
                      .filter((doc) => doc.file)
                      .map((doc) => {
                        const fileExtension = doc
                          .file!.name.split('.')
                          .pop()
                          ?.toLowerCase();
                        const fileIcon =
                          fileExtension === 'pdf'
                            ? '📄'
                            : fileExtension === 'csv'
                              ? '📊'
                              : '🖼️';
                        const fileSizeMB = (
                          doc.file!.size /
                          (1024 * 1024)
                        ).toFixed(1);

                        return (
                          <div key={doc.id} className="document-list-item">
                            <div className="document-icon">{fileIcon}</div>
                            <div className="document-info">
                              <div className="document-name">
                                {doc.file!.name}
                              </div>
                              <div className="document-desc">
                                {doc.motivo || 'Documento'}
                              </div>
                            </div>
                            <div className="document-download">
                              {fileSizeMB} MB
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="preview-section-text">
                    No se agregaron documentos.
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
