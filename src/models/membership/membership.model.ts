import { Currency, User } from '../projects/project.model';

export enum MembershipStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface InvestmentPosition {
  id: string;
  user_id: string;
  project_id: string;
  base_currency: Currency;
  base_amount: number;
  status: MembershipStatus;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface JoinProjectResponse {
  position: InvestmentPosition;
  via_invitation: boolean;
}
