import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import {
  close,
  peopleOutline,
  documentOutline,
  imagesOutline,
} from 'ionicons/icons';
import { Conversation } from '@/models/Conversation.model';
import './ChatInfoModal.css';

interface ChatInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  currentUserId: string;
}

type TabType = 'participants' | 'documents' | 'images';

export const ChatInfoModal: React.FC<ChatInfoModalProps> = ({
  isOpen,
  onClose,
  conversation,
  currentUserId,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('participants');

  if (!isOpen || !conversation) return null;

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="chat-info-modal-backdrop" onClick={onClose} />
      <div className="chat-info-modal">
        <div className="chat-info-modal-header">
          <h2>{conversation.getTitle(currentUserId)}</h2>
          <button className="close-button" onClick={onClose}>
            <IonIcon icon={close} />
          </button>
        </div>

        <div className="chat-info-modal-tabs">
          <button
            className={`tab-button ${activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => setActiveTab('participants')}
          >
            <IonIcon icon={peopleOutline} />
            <span>Participantes</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <IonIcon icon={documentOutline} />
            <span>Archivos</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'images' ? 'active' : ''}`}
            onClick={() => setActiveTab('images')}
          >
            <IonIcon icon={imagesOutline} />
            <span>Imágenes</span>
          </button>
        </div>

        <div className="chat-info-modal-content">
          {activeTab === 'participants' && (
            <div className="participants-tab">
              <div className="participants-count">
                {conversation.members.length}{' '}
                {conversation.members.length === 1
                  ? 'participante'
                  : 'participantes'}
              </div>
              <div className="participants-list">
                {conversation.members.map((member) => (
                  <div key={member.userId} className="participant-item">
                    <div className="participant-avatar">
                      {member.user?.getAvatarUrl() ? (
                        <img
                          src={member.user.getAvatarUrl()}
                          alt={member.user.getDisplayName()}
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {member.user?.getInitials() ||
                            getInitials(member.user?.username)}
                        </div>
                      )}
                    </div>
                    <div className="participant-info">
                      <div className="participant-name">
                        {member.user?.getDisplayName() ||
                          member.user?.username ||
                          'Usuario'}
                        {member.role === 'admin' && (
                          <span className="admin-badge">Admin</span>
                        )}
                      </div>
                      {member.user?.email && (
                        <div className="participant-email">
                          {member.user.email}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="documents-tab">
              <div className="empty-state">
                <IonIcon icon={documentOutline} />
                <p>No hay documentos compartidos</p>
                <span>
                  Los archivos compartidos en este chat aparecerán aquí
                </span>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="images-tab">
              <div className="empty-state">
                <IonIcon icon={imagesOutline} />
                <p>No hay imágenes compartidas</p>
                <span>Las fotos compartidas en este chat aparecerán aquí</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
