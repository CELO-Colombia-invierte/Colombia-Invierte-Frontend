import React, { useEffect, useState } from 'react';
import { IonButton, IonSpinner, useIonToast } from '@ionic/react';
import { Project } from '@/models/projects';
import { projectMembershipService } from '@/services/projects';
import { InvestmentPosition } from '@/models/membership';
import { useAuth } from '@/hooks/use-auth';
import { chatApiService } from '@/services/chat';
import { Conversation } from '@/models/Conversation.model';
import { useHistory } from 'react-router-dom';
import './ParticipantesTab.css';

interface ParticipantesTabProps {
  project: Project;
  isOwner?: boolean;
}

export const ParticipantesTab: React.FC<ParticipantesTabProps> = ({
  project,
  isOwner = false,
}) => {
  const [members, setMembers] = useState<InvestmentPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingChat, setCreatingChat] = useState(false);
  const [groupConversation, setGroupConversation] =
    useState<Conversation | null>(null);
  const [present] = useIonToast();
  const { user } = useAuth();
  const history = useHistory();

  useEffect(() => {
    loadMembers();
    checkExistingGroupChat();
  }, [project.id]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await projectMembershipService.getMembers(project.id);
      setMembers(data);
    } catch (error) {
      console.error('Error loading members:', error);
      await present({
        message: 'Error al cargar los participantes',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkExistingGroupChat = async () => {
    try {
      const conversations = await chatApiService.getConversations();
      const projectGroupChat = conversations.find(
        (conv) =>
          conv.type === 'GROUP' && conv.name === `Chat - ${project.name}`
      );
      if (projectGroupChat) {
        setGroupConversation(projectGroupChat);
      }
    } catch (error) {
      console.error('Error checking group chat:', error);
    }
  };

  const handleCreateGroupChat = async () => {
    if (!user) return;

    try {
      setCreatingChat(true);
      const memberIds = members.map((m) => m.user_id);
      if (!memberIds.includes(user.id)) {
        memberIds.push(user.id);
      }

      const uniqueMemberIds = [...new Set(memberIds)];

      const conversation = await chatApiService.createConversation(
        'GROUP',
        uniqueMemberIds
      );

      await chatApiService.updateConversationName(
        conversation.id,
        `Chat - ${project.name}`
      );

      setGroupConversation(conversation);

      await present({
        message: 'Chat grupal creado exitosamente',
        duration: 2000,
        color: 'success',
      });

      history.push(`/mensajes/${conversation.id}`);
    } catch (error) {
      console.error('Error creating group chat:', error);
      await present({
        message: 'Error al crear el chat grupal',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setCreatingChat(false);
    }
  };

  const handleOpenChat = () => {
    if (groupConversation) {
      history.push(`/mensajes/${groupConversation.id}`);
    }
  };

  const renderParticipantsList = () => {
    return (
      <div className="participants-list">
        <div className="participants-info">
          <p>Participantes: {members.length}</p>
        </div>
        <div className="participants-grid">
          {members.map((member) => {
            const userName =
              (member.user as any)?.display_name ||
              member.user?.displayName ||
              'Usuario';
            const userAny = member.user as any;
            const avatarUrl =
              userAny?.avatar ||
              (userAny?.avatar_asset_id
                ? `${import.meta.env.VITE_ASSETS_URL || import.meta.env.VITE_API_URL}/assets/${userAny.avatar_asset_id}`
                : undefined);
            return (
              <div key={member.id} className="participant-card">
                <div className="participant-avatar">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={userName} className="avatar-image" />
                  ) : (
                    <div className="avatar-placeholder">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="participant-details">
                  <div className="participant-name-row">
                    <h4>{userName}</h4>
                    {member.id.startsWith('owner-') && (
                      <span className="admin-badge">ADMIN</span>
                    )}
                  </div>
                  <p className="participant-email">{member.user?.email}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="participantes-tab">
        <div className="loading-container">
          <IonSpinner name="crescent" />
          <p>Cargando participantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="participantes-tab">
      <div className="participantes-header">
        <h2>Chat del Proyecto</h2>
        {!groupConversation && isOwner && (
          <IonButton
            onClick={handleCreateGroupChat}
            disabled={creatingChat}
            size="small"
          >
            {creatingChat ? (
              <>
                <IonSpinner name="crescent" />
                Creando chat...
              </>
            ) : (
              'Crear chat grupal'
            )}
          </IonButton>
        )}
        {groupConversation && (
          <IonButton onClick={handleOpenChat} size="small" color="primary">
            Abrir chat grupal
          </IonButton>
        )}
      </div>

      {!isOwner && !groupConversation ? (
        <div>
          <div className="empty-state">
            <p>El chat grupal aún no ha sido creado por el administrador</p>
          </div>
          {members.length > 0 && renderParticipantsList()}
        </div>
      ) : !groupConversation && members.length === 0 ? (
        <div className="empty-state">
          <p>No hay participantes en este proyecto para crear el chat</p>
        </div>
      ) : isOwner && !groupConversation ? (
        <div>
          <div className="empty-state">
            <p>
              Crea un chat grupal para comunicarte con todos los participantes
              del proyecto
            </p>
          </div>
          {members.length > 0 && renderParticipantsList()}
        </div>
      ) : groupConversation ? (
        <div>
          <div className="chat-ready-state">
            <div className="chat-info">
              <div className="chat-icon">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3>Chat grupal activo</h3>
              <p>Comunícate con todos los participantes del proyecto</p>
            </div>
          </div>
          {members.length > 0 && renderParticipantsList()}
        </div>
      ) : null}
    </div>
  );
};
