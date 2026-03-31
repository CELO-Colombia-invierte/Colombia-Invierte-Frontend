import React, { useEffect, useState } from 'react';
import { IonSpinner, useIonToast } from '@ionic/react';
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
        uniqueMemberIds,
        project.id,
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

  const renderChatActionCard = () => {
    if (groupConversation) {
      return (
        <div className="chat-action-card chat-action-card--active" onClick={handleOpenChat}>
          <div className="chat-action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="chat-action-text">
            <strong>Abrir chat grupal</strong>
            <span>Comunícate con todos los participantes</span>
          </div>
          <div className="chat-action-chevron">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      );
    }

    if (isOwner) {
      return (
        <div
          className={`chat-action-card${creatingChat ? ' chat-action-card--loading' : ''}`}
          onClick={!creatingChat ? handleCreateGroupChat : undefined}
        >
          <div className="chat-action-icon">
            {creatingChat ? (
              <IonSpinner name="crescent" style={{ width: 20, height: 20, color: 'white' }} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            )}
          </div>
          <div className="chat-action-text">
            <strong>{creatingChat ? 'Creando chat...' : 'Crear chat grupal'}</strong>
            <span>Conecta a todos los participantes del proyecto</span>
          </div>
          {!creatingChat && (
            <div className="chat-action-chevron">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="chat-action-card chat-action-card--disabled">
        <div className="chat-action-icon chat-action-icon--gray">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div className="chat-action-text">
          <strong>Chat grupal</strong>
          <span>El administrador aún no ha creado el chat</span>
        </div>
      </div>
    );
  };

  const renderParticipantsList = () => {
    return (
      <div className="participants-list">
        <p className="participants-count">Participantes ({members.length})</p>
        <div className="participants-list-items">
          {members.map((member) => {
            const userName =
              member.user?.display_name ||
              member.user?.username ||
              'Usuario';
            const avatarUrl = member.user?.avatar_asset_id
              ? `${import.meta.env.VITE_API_URL || ''}/assets/${member.user.avatar_asset_id}`
              : undefined;
            return (
              <div key={member.id} className="participant-list-item">
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
      </div>

      {renderChatActionCard()}

      {members.length > 0 && renderParticipantsList()}
    </div>
  );
};
