import { User } from '../projects/project.model';

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
}

export interface ProjectInvitation {
  id: string;
  project_id: string;
  inviter_user_id: string;
  invitee_email?: string;
  invitee_username?: string;
  status: InvitationStatus;
  created_at: string;
  responded_at?: string;
  inviter_user?: User;
}

export interface CreateInvitationDto {
  invitee_email?: string;
  invitee_username?: string;
}
