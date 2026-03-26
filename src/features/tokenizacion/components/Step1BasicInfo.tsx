import React from 'react';
import { IonIcon } from '@ionic/react';
import { happyOutline, closeCircle } from 'ionicons/icons';
import InfoTooltip from '../../../components/ui/InfoTooltip';
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

interface Step1BasicInfoProps {
  formData: {
    tipoProyecto: string;
    nombreProyecto: string;
    descripcion: string;
    aspectosDestacados: string;
    privacidad?: string;
  };
  tokenRights: TokenRightDto[];
  tokenFaqs: TokenFaqDto[];
  onChange: (field: string, value: string) => void;
  onTokenRightsChange: (rights: TokenRightDto[]) => void;
  onTokenFaqsChange: (faqs: TokenFaqDto[]) => void;
}

export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  formData,
  tokenRights,
  tokenFaqs,
  onChange,
  onTokenRightsChange,
  onTokenFaqsChange,
}) => {
  const handleAddRight = () => {
    const newRight = { id: Date.now().toString(), title: '' };
    onTokenRightsChange([...tokenRights, newRight]);
  };

  const handleUpdateRight = (id: string, title: string) => {
    const updated = tokenRights.map((right) =>
      right.id === id ? { ...right, title } : right
    );
    onTokenRightsChange(updated);
  };

  const handleRemoveRight = (id: string) => {
    if (tokenRights.length > 1) {
      onTokenRightsChange(tokenRights.filter((right) => right.id !== id));
    }
  };

  const handleAddFaq = () => {
    const newFaq = { id: Date.now().toString(), question: '', answer: '' };
    onTokenFaqsChange([...tokenFaqs, newFaq]);
  };

  const handleUpdateFaq = (
    id: string,
    field: 'question' | 'answer',
    value: string
  ) => {
    const updated = tokenFaqs.map((faq) =>
      faq.id === id ? { ...faq, [field]: value } : faq
    );
    onTokenFaqsChange(updated);
  };

  const handleRemoveFaq = (id: string) => {
    if (tokenFaqs.length > 1) {
      onTokenFaqsChange(tokenFaqs.filter((faq) => faq.id !== id));
    }
  };

  return (
    <div className="step-content">
      <div className="form-group">
        <label className="form-label">
          Tipo de proyecto
          <InfoTooltip text="Define si este proyecto es una Natillera (ahorro colaborativo) o una Tokenización (activo real representado como tokens en blockchain)." />
        </label>
        <div className="select-wrapper">
          <select
            className="form-select"
            value={formData.tipoProyecto}
            onChange={(e) => onChange('tipoProyecto', e.target.value)}
          >
            <option value="Tokenización">Tokenización</option>
            <option value="Natillera">Natillera</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Privacidad del proyecto
          <InfoTooltip text="Elige si el proyecto es Privado (solo acceden personas invitadas con enlace) o Público (visible para todos los usuarios)." />
        </label>
        <div className="select-wrapper">
          <select
            className="form-select"
            value={formData.privacidad || 'PRIVATE'}
            onChange={(e) => onChange('privacidad', e.target.value)}
          >
            <option value="PRIVATE">Privado</option>
            <option value="PUBLIC">Público</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Nombre de proyecto
          <InfoTooltip text="El nombre público del proyecto de tokenización. Debe identificar claramente el activo o inversión que representa." />
        </label>
        <div className="input-with-emoji">
          <button className="emoji-button" type="button">
            <IonIcon icon={happyOutline} />
          </button>
          <input
            type="text"
            className="form-input"
            placeholder="Escribe el nombre..."
            value={formData.nombreProyecto}
            onChange={(e) => onChange('nombreProyecto', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Descripción de proyecto
          <InfoTooltip text="Describe el activo o proyecto real que se tokeniza, su modelo de negocio y cómo genera valor para los inversores." />
        </label>
        <div className="rich-text-editor">
          <div className="editor-toolbar">
            <button type="button" className="toolbar-btn">
              <strong>B</strong>
            </button>
            <button type="button" className="toolbar-btn">
              <em>I</em>
            </button>
            <button type="button" className="toolbar-btn">
              <u>U</u>
            </button>
            <button type="button" className="toolbar-btn">
              <IonIcon icon={happyOutline} />
            </button>
            <button type="button" className="toolbar-btn">
              🔗
            </button>
            <button type="button" className="toolbar-btn">
              ≡
            </button>
            <button type="button" className="toolbar-btn">
              ☰
            </button>
          </div>
          <textarea
            className="form-textarea"
            rows={4}
            value={formData.descripcion}
            onChange={(e) => onChange('descripcion', e.target.value)}
          ></textarea>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Aspectos destacados
          <InfoTooltip text="Los puntos clave que hacen atractivo este proyecto: ventajas competitivas, garantías, equipo o proyecciones." />
        </label>
        <div className="rich-text-editor">
          <div className="editor-toolbar">
            <button type="button" className="toolbar-btn">
              <strong>B</strong>
            </button>
            <button type="button" className="toolbar-btn">
              <em>I</em>
            </button>
            <button type="button" className="toolbar-btn">
              <u>U</u>
            </button>
            <button type="button" className="toolbar-btn">
              <IonIcon icon={happyOutline} />
            </button>
            <button type="button" className="toolbar-btn">
              🔗
            </button>
            <button type="button" className="toolbar-btn">
              ≡
            </button>
            <button type="button" className="toolbar-btn">
              ☰
            </button>
          </div>
          <textarea
            className="form-textarea"
            rows={4}
            value={formData.aspectosDestacados}
            onChange={(e) => onChange('aspectosDestacados', e.target.value)}
          ></textarea>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Derechos del token
          <InfoTooltip text="Lista los derechos que otorga cada token: dividendos, acceso a servicios, participación en ganancias, derechos de voto, etc." />
        </label>
        {tokenRights.map((right) => (
          <div key={right.id} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Escribe por ítem..."
                value={right.title}
                onChange={(e) => handleUpdateRight(right.id, e.target.value)}
                style={{ flex: 1 }}
              />
              {tokenRights.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveRight(right.id)}
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
          </div>
        ))}
        <button
          type="button"
          className="add-space-button"
          onClick={handleAddRight}
        >
          + Añadir slot
        </button>
      </div>

      <div className="form-group">
        <label className="form-label">
          Preguntas frecuentes
          <InfoTooltip text="Agrega preguntas y respuestas que anticipen las dudas de los potenciales inversores sobre el proyecto o los tokens." />
        </label>
        {tokenFaqs.map((faq) => (
          <div key={faq.id} style={{ marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <input
                type="text"
                className="form-input"
                placeholder="Escriba la pregunta..."
                value={faq.question}
                onChange={(e) =>
                  handleUpdateFaq(faq.id, 'question', e.target.value)
                }
                style={{ flex: 1 }}
              />
              {tokenFaqs.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveFaq(faq.id)}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>•</span>
              <input
                type="text"
                className="form-input"
                placeholder="Escribe la respuesta..."
                value={faq.answer}
                onChange={(e) =>
                  handleUpdateFaq(faq.id, 'answer', e.target.value)
                }
                style={{ flex: 1, margin: 0 }}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          className="add-space-button"
          onClick={handleAddFaq}
        >
          + Añadir slot
        </button>
      </div>
    </div>
  );
};
