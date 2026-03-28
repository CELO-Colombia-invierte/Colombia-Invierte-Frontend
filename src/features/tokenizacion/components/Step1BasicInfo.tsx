import React from 'react';
import { IonIcon } from '@ionic/react';
import {
  informationCircleOutline,
  happyOutline,
  closeCircle,
} from 'ionicons/icons';
import { RichTextEditor } from '@/components/ui/RichTextEditor/RichTextEditor';
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
          <IonIcon icon={informationCircleOutline} className="info-icon" />
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
          <IonIcon icon={informationCircleOutline} className="info-icon" />
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
          <IonIcon icon={informationCircleOutline} className="info-icon" />
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
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <RichTextEditor
          value={formData.descripcion}
          onChange={(html) => onChange('descripcion', html)}
          rows={4}
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Aspectos destacados
          <IonIcon icon={informationCircleOutline} className="info-icon" />
        </label>
        <RichTextEditor
          value={formData.aspectosDestacados}
          onChange={(html) => onChange('aspectosDestacados', html)}
          rows={4}
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Derechos del token
          <IonIcon icon={informationCircleOutline} className="info-icon" />
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
          <IonIcon icon={informationCircleOutline} className="info-icon" />
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
