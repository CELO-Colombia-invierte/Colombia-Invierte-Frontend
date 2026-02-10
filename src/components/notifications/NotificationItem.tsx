import React, { useState } from 'react';
import { useIonToast } from '@ionic/react';
import { Notification, NotificationType } from '@/types';
import { projectInvitationsService } from '@/services/projects/invitations.service';
import './NotificationItem.css';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
  onInvitationResponse?: (notificationId: string, accepted: boolean) => void;
}

const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.NEW_MESSAGE:
      return '💬';
    case NotificationType.PROJECT_INVITATION:
      return '📨';
    case NotificationType.PROJECT_INVITATION_ACCEPTED:
      return '✅';
    case NotificationType.PROJECT_INVITATION_DECLINED:
      return '❌';
    case NotificationType.PAYMENT_REMINDER:
      return '⏰';
    case NotificationType.PAYMENT_RECEIVED:
      return '💰';
    case NotificationType.PAYMENT_LATE:
      return '⚠️';
    case NotificationType.SYSTEM_ANNOUNCEMENT:
      return '📢';
    default:
      return '🔔';
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  onInvitationResponse,
}) => {
  const [present] = useIonToast();
  const [isLoading, setIsLoading] = useState(false);
  const [responded, setResponded] = useState(false);
  const [responseType, setResponseType] = useState<
    'accepted' | 'declined' | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const isInvitation =
    notification.type === NotificationType.PROJECT_INVITATION;
  const invitationId = notification.metadata?.invitation_id as
    | string
    | undefined;

  // Leer el status desde metadata (persistente en el servidor)
  const invitationStatus = notification.metadata?.status as
    | 'accepted'
    | 'declined'
    | undefined;

  // Determinar si ya respondió (desde metadata o estado local)
  const hasResponded = invitationStatus || responded;

  const handleClick = () => {
    // No navegar si es una invitación pendiente
    if (isInvitation && !hasResponded) {
      return;
    }
    onClick(notification);
  };

  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!invitationId || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      await projectInvitationsService.accept(invitationId);
      setResponded(true);
      setResponseType('accepted');
      onInvitationResponse?.(notification.id, true);

      await present({
        message: '✅ Ya eres parte de este proyecto',
        duration: 3000,
        position: 'bottom',
        color: 'success',
      });
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      const errorMessage =
        error.message === 'Invitation is not pending'
          ? 'Ya respondiste esta invitación'
          : 'Error al aceptar la invitación';
      setError(errorMessage);

      await present({
        message: `❌ ${errorMessage}`,
        duration: 3000,
        position: 'bottom',
        color: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!invitationId || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      await projectInvitationsService.decline(invitationId);
      setResponded(true);
      setResponseType('declined');
      onInvitationResponse?.(notification.id, false);

      await present({
        message: '✓ Invitación rechazada',
        duration: 3000,
        position: 'bottom',
        color: 'warning',
      });
    } catch (error: any) {
      console.error('Error declining invitation:', error);
      const errorMessage =
        error.message === 'Invitation is not pending'
          ? 'Ya respondiste esta invitación'
          : 'Error al rechazar la invitación';
      setError(errorMessage);

      await present({
        message: `❌ ${errorMessage}`,
        duration: 3000,
        position: 'bottom',
        color: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`notification-item ${!notification.is_read ? 'notification-item--unread' : ''} ${isInvitation && !responded ? 'notification-item--no-click' : ''}`}
      onClick={handleClick}
    >
      <div className="notification-item__avatar">
        {notification.actor?.avatar_url ? (
          <img
            src={notification.actor.avatar_url}
            alt={notification.actor.display_name}
            className="notification-item__avatar-img"
          />
        ) : (
          <div className="notification-item__avatar-placeholder">
            {notification.actor?.display_name?.charAt(0).toUpperCase() || '?'}
          </div>
        )}
        <span className="notification-item__icon">
          {getNotificationIcon(notification.type)}
        </span>
      </div>

      <div className="notification-item__content">
        <p className="notification-item__title">
          {notification.actor?.display_name || 'Sistema'}
        </p>
        <p className="notification-item__body">{notification.body}</p>

        {/* Botones de Aceptar/Rechazar para invitaciones (solo si NO ha respondido) */}
        {isInvitation && invitationId && !hasResponded && (
          <div className="notification-item__actions">
            <button
              className="notification-item__btn notification-item__btn--accept"
              onClick={handleAccept}
              disabled={isLoading}
            >
              {isLoading ? '...' : 'Aceptar'}
            </button>
            <button
              className="notification-item__btn notification-item__btn--decline"
              onClick={handleDecline}
              disabled={isLoading}
            >
              {isLoading ? '...' : 'Rechazar'}
            </button>
          </div>
        )}

        {/* Mensaje de respuesta (desde metadata del servidor o estado local) */}
        {isInvitation && hasResponded && !error && (
          <p
            className={`notification-item__response notification-item__response--${invitationStatus || responseType}`}
          >
            {(invitationStatus || responseType) === 'accepted'
              ? 'Aceptaste esta invitación'
              : 'Rechazaste esta invitación'}
          </p>
        )}

        {isInvitation && error && (
          <p className="notification-item__error">{error}</p>
        )}
      </div>

      <div className="notification-item__meta">
        <span className="notification-item__date">
          {formatDate(notification.created_at)}
        </span>
        <span
          className={`notification-item__indicator ${
            notification.is_read
              ? 'notification-item__indicator--read'
              : 'notification-item__indicator--unread'
          }`}
        />
      </div>
    </div>
  );
};

export default NotificationItem;
