import React, { useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonInput,
  IonButtons,
  useIonToast,
} from '@ionic/react';
import {
  createOutline,
  exitOutline,
  trashOutline,
  closeOutline,
} from 'ionicons/icons';
import { chatApiService } from '@/services/chat';
import './GroupOptionsModal.css';

interface GroupOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  conversationTitle: string;
  isAdmin: boolean;
  onNameChanged?: () => void;
  onLeave?: () => void;
}

export const GroupOptionsModal: React.FC<GroupOptionsModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  conversationTitle,
  isAdmin,
  onNameChanged,
  onLeave,
}) => {
  const [showNameInput, setShowNameInput] = useState(false);
  const [newName, setNewName] = useState(conversationTitle);
  const [loading, setLoading] = useState(false);
  const [present] = useIonToast();

  const handleChangeName = async () => {
    if (!newName.trim()) {
      await present({
        message: 'El nombre no puede estar vacio',
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    try {
      setLoading(true);
      
      await chatApiService.updateConversationName(conversationId, newName.trim());
      
      await present({
        message: 'Nombre del grupo actualizado',
        duration: 2000,
        color: 'success',
      });

      setShowNameInput(false);
      onNameChanged?.();
      onClose();
    } catch (error: any) {
      console.error('Error changing group name:', error);
      await present({
        message: error.message || 'Error al cambiar el nombre',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    const confirmed = window.confirm(
      'Estas seguro de que quieres salir de este grupo?'
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await chatApiService.leaveConversation(conversationId);

      await present({
        message: 'Has salido del grupo',
        duration: 2000,
        color: 'success',
      });

      onLeave?.();
      onClose();
    } catch (error: any) {
      console.error('Error leaving group:', error);
      await present({
        message: error.message || 'Error al salir del grupo',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    const confirmed = window.confirm(
      'Estas seguro de que quieres eliminar este grupo? Esta accion no se puede deshacer.'
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await chatApiService.deleteConversation(conversationId);

      await present({
        message: 'Grupo eliminado',
        duration: 2000,
        color: 'success',
      });

      onLeave?.();
      onClose();
    } catch (error: any) {
      console.error('Error deleting group:', error);
      await present({
        message: error.message || 'Error al eliminar el grupo',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowNameInput(false);
    setNewName(conversationTitle);
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Opciones del grupo</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleClose}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {showNameInput ? (
            <div className="group-name-editor">
              <IonItem>
                <IonLabel position="stacked">Nuevo nombre del grupo</IonLabel>
                <IonInput
                  value={newName}
                  onIonInput={(e) => setNewName(e.detail.value || '')}
                  placeholder="Nombre del grupo"
                  maxlength={50}
                />
              </IonItem>
              <div className="group-name-actions">
                <IonButton
                  fill="clear"
                  onClick={() => {
                    setShowNameInput(false);
                    setNewName(conversationTitle);
                  }}
                  disabled={loading}
                >
                  Cancelar
                </IonButton>
                <IonButton
                  onClick={handleChangeName}
                  disabled={loading || !newName.trim()}
                >
                  Guardar
                </IonButton>
              </div>
            </div>
          ) : (
            <>
              {isAdmin && (
                <IonItem
                  button
                  onClick={() => setShowNameInput(true)}
                  disabled={loading}
                >
                  <IonIcon icon={createOutline} slot="start" />
                  <IonLabel>Cambiar nombre del grupo</IonLabel>
                </IonItem>
              )}

              <IonItem
                button
                onClick={handleLeaveGroup}
                disabled={loading}
                className="group-option-danger"
              >
                <IonIcon icon={exitOutline} slot="start" color="danger" />
                <IonLabel color="danger">Salir del grupo</IonLabel>
              </IonItem>

              {isAdmin && (
                <IonItem
                  button
                  onClick={handleDeleteGroup}
                  disabled={loading}
                  className="group-option-danger"
                >
                  <IonIcon icon={trashOutline} slot="start" color="danger" />
                  <IonLabel color="danger">Eliminar grupo</IonLabel>
                </IonItem>
              )}
            </>
          )}
        </IonList>
      </IonContent>
    </IonModal>
  );
};

export default GroupOptionsModal;
