import React, { useEffect, useState } from 'react';
import { IonIcon, IonSpinner, useIonToast } from '@ionic/react';
import { peopleOutline, personCircle, trashOutline } from 'ionicons/icons';
import { projectMembershipService } from '@/services/projects/membership.service';
import { InvestmentPosition } from '@/models/membership/membership.model';
import './MembersList.css';

interface MembersListProps {
  projectId: string;
  isOwner: boolean;
  onMembersChange?: () => void;
}

export const MembersList: React.FC<MembersListProps> = ({
  projectId,
  isOwner,
  onMembersChange,
}) => {
  const [members, setMembers] = useState<InvestmentPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [present] = useIonToast();

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await projectMembershipService.getMembers(projectId);
      setMembers(data);
    } catch (error: any) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (positionId: string, username: string) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres remover a @${username} de este proyecto?`
    );
    
    if (!confirmed) return;

    try {
      setRemovingId(positionId);
      await projectMembershipService.removeMember(projectId, positionId);
      
      await present({
        message: 'Miembro removido exitosamente',
        duration: 2000,
        color: 'success',
      });

      await fetchMembers();
      
      if (onMembersChange) {
        onMembersChange();
      }
    } catch (error: any) {
      console.error('Error removing member:', error);
      await present({
        message: error.message || 'Error al remover el miembro',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setRemovingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    const formatted = Number(amount).toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `$${formatted} ${currency}`;
  };

  if (loading) {
    return (
      <div className="members-list-loading">
        <IonSpinner name="crescent" />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="members-list-empty">
        <IonIcon icon={peopleOutline} />
        <p>No hay miembros aún</p>
      </div>
    );
  }

  return (
    <div className="members-list-container">
      <h2 className="members-list-title">
        <IonIcon icon={peopleOutline} />
        Miembros ({members.length})
      </h2>
      
      <div className="members-list">
        {members.map((member) => (
          <div key={member.id} className="member-card">
            <div className="member-user">
              <div className="member-avatar">
                {member.user?.avatarUrl ? (
                  <img src={member.user.avatarUrl} alt={member.user.username} />
                ) : (
                  <IonIcon icon={personCircle} />
                )}
              </div>
              
              <div className="member-info">
                <span className="member-name">
                  {member.user?.displayName || member.user?.username || 'Usuario'}
                </span>
                <span className="member-username">
                  @{member.user?.username || 'desconocido'}
                </span>
                <div className="member-meta">
                  <span className="member-amount">
                    {formatCurrency(member.base_amount, member.base_currency)}
                  </span>
                  <span className="member-date">
                    • Desde {formatDate(member.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {isOwner && (
              <button
                className="member-remove-btn"
                onClick={() => handleRemoveMember(member.id, member.user?.username || 'usuario')}
                disabled={removingId !== null}
                title="Remover miembro"
              >
                {removingId === member.id ? (
                  <IonSpinner name="crescent" />
                ) : (
                  <IonIcon icon={trashOutline} />
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
