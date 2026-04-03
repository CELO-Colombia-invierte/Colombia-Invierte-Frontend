import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { useIonToast } from '@ionic/react';
import {
  chatbubbleEllipses,
  mailOpen,
  checkmarkCircle,
  closeCircle,
  alarm,
  cash,
  warning,
  megaphone,
  documentText,
  notifications as notifIcon,
} from 'ionicons/icons';
import { Notification, NotificationType } from '@/types';
import { projectInvitationsService } from '@/services/projects/invitations.service';
import './NotificationItem.css';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
  onInvitationResponse?: (notificationId: string, accepted: boolean) => void;
}

const getNotificationIconData = (type: NotificationType): { icon: string; color: string } => {
  switch (type) {
    case NotificationType.NEW_MESSAGE:
      return { icon: chatbubbleEllipses, color: '#22c55e' };
    case NotificationType.PROJECT_INVITATION:
      return { icon: mailOpen, color: '#f59e0b' };
    case NotificationType.PROJECT_INVITATION_ACCEPTED:
      return { icon: checkmarkCircle, color: '#22c55e' };
    case NotificationType.PROJECT_INVITATION_DECLINED:
      return { icon: closeCircle, color: '#ef4444' };
    case NotificationType.PAYMENT_REMINDER:
      return { icon: alarm, color: '#f59e0b' };
    case NotificationType.PAYMENT_RECEIVED:
      return { icon: cash, color: '#22c55e' };
    case NotificationType.PAYMENT_LATE:
      return { icon: warning, color: '#ef4444' };
    case NotificationType.SYSTEM_ANNOUNCEMENT:
      return { icon: megaphone, color: '#3b82f6' };
    case NotificationType.NEW_PROPOSAL:
      return { icon: documentText, color: '#8b5cf6' };
    default:
      return { icon: notifIcon, color: '#3b82f6' };
  }
};

const stripEmojis = (text: string): string =>
  text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();

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

  
  const invitationStatus = notification.metadata?.status as
    | 'accepted'
    | 'declined'
    | undefined;

  
  const hasResponded = invitationStatus || responded;


  const wasDeclined =
    invitationStatus === 'declined' || responseType === 'declined';

  const handleClick = () => {
   
    if (isInvitation && (!hasResponded || wasDeclined)) {
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
        message: 'Ya eres parte de este proyecto',
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
        message: errorMessage,
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
        message: 'Invitación rechazada',
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
        message: errorMessage,
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
      className={`notification-item ${!notification.is_read ? 'notification-item--unread' : ''} ${isInvitation && (!hasResponded || wasDeclined) ? 'notification-item--no-click' : ''}`}
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
        <span
          className="notification-item__icon"
          style={{ backgroundColor: getNotificationIconData(notification.type).color }}
        >
          <IonIcon icon={getNotificationIconData(notification.type).icon} />
        </span>
      </div>

      <div className="notification-item__content">
        <p className="notification-item__title">
          {notification.metadata?.conversation_name
            ? String(notification.metadata.conversation_name)
            : notification.actor?.display_name || 'Sistema'}
        </p>
        <p className="notification-item__body">
          {notification.metadata?.conversation_name && notification.actor?.display_name
            ? `${notification.actor.display_name}: `
            : ''}
          {stripEmojis(notification.body)}
          {Number(notification.metadata?.message_count || 0) > 1 && (
            <span className="notification-item__count">
              {' '}({String(notification.metadata?.message_count)} mensajes)
            </span>
          )}
        </p>

      
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
