import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, useIonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { projectMembershipService } from '@/services/projects';
import { InvestmentPosition } from '@/models/membership';
import { PropuestaFormData } from '@/types/propuesta';
import { MemberSearch } from '../components/propuestas/MemberSearch';
import './CrearPropuestaPage.css';
import { IonIcon } from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons'; 


const CrearPropuestaPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const history = useHistory();
  const [present] = useIonToast();

  const [members, setMembers] = useState<InvestmentPosition[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [responsibleId, setResponsibleId] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [responsibleUsername, setResponsibleUsername] = useState('');
  const [monto, setMonto] = useState('');
  const [ganancia, setGanancia] = useState('');
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [imagePreview, setImagePreview] = useState<string | undefined>();

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const data = await projectMembershipService.getMembers(projectId);
        setMembers(data);
      } catch {
        console.error("error loading member")
      }
    };
    loadMembers();
  }, [projectId]);

  const handleMemberSelect = (member: InvestmentPosition) => {
    setResponsibleId(member.user_id);
    setResponsibleName((member.user as any)?.display_name || member.user?.username || '');
    setResponsibleUsername(member.user?.username || '');  
  };

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      present({ message: 'Formato no soportado. Usa JPG, PNG, WebP o GIF.', duration: 3000, color: 'warning' });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePrevisualizar = async () => {
    if (!title.trim()) {
      await present({ message: 'El título es obligatorio', duration: 2000, color: 'warning' });
      return;
    }
    if (!description.trim()) {
      await present({ message: 'La descripción es obligatoria', duration: 2000, color: 'warning' });
      return;
    }
    if (!responsibleId) {
      await present({ message: 'Selecciona un encargado', duration: 2000, color: 'warning' });
      return;
    }
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      await present({ message: 'Ingresa un monto válido', duration: 2000, color: 'warning' });
      return;
    }

    const formData: PropuestaFormData = {
      title: title.trim(),
      description: description.trim(),
      responsible_user_id: responsibleId,
      responsible_name: responsibleName,
      responsible_username: responsibleUsername,
      withdrawal_amount: Number(monto),
      estimated_profit: ganancia ? Number(ganancia) : undefined,
      background_image: imageFile,
      background_image_url: imagePreview,
    };

    history.push({
      pathname: `/preview-propuesta/${projectId}`,
      state: { formData, projectId },
    });
  };

  return (
    <IonPage>
      <IonContent fullscreen className="crear-propuesta-page">
        <div className="crear-propuesta-header">
         <button className="header-back-btn " onClick={() => history.goBack()}> <IonIcon icon={arrowBackOutline} /> </button>
          <h1 className="crear-propuesta-title">Propuesta</h1>
        </div>

        <div className="crear-propuesta-form">
          <div className="form-field">
            <label className="form-label">
              Título <span className="form-required">*</span>
            </label>
            <input
              className="form-input"
              placeholder="Escribe la propuesta"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">
              Descripción <span className="form-required">*</span>
            </label>
            <textarea
              className="form-textarea"
              placeholder="De qué trata la propuesta"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="form-field">
            <label className="form-label">
              Encargado para el retiro <span className="form-required">*</span>
            </label>
            <MemberSearch
              members={members}
              selectedId={responsibleId}
              onSelect={handleMemberSelect}
            />
          </div>

          <div className="form-field">
            <label className="form-label">
              Monto a retirar <span className="form-required">*</span>
            </label>
            <input
              className="form-input"
              placeholder="Cuánto de dinero necesita la propuesta"
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Ganancia estimada (opcional)</label>
            <input
              className="form-input"
              placeholder="Cuánto de dinero se podría ganar"
              type="number"
              value={ganancia}
              onChange={(e) => setGanancia(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Imagen de fondo (opcional)</label>
            <div className="form-image-row">
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="form-image-preview" />
              ) : (
                <span className="form-image-placeholder">Suba una imagen</span>
              )}
              <label className="form-image-btn">
                Seleccionar
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={handleImageChange} />
              </label>
            </div>
          </div>
        </div>

        <div className="crear-propuesta-footer">
          <button className="propuesta-btn-primary" onClick={handlePrevisualizar}>
            Previsualizar
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CrearPropuestaPage;
