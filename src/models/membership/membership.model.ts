import { Currency } from '../projects/project.model';

export enum MembershipStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface InvestmentPositionUser {
  id: string;
  display_name: string;
  username: string;
  email: string;
  avatar_asset_id: string | null;
  phone: string | null;
  phone_country_code: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
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
  user?: InvestmentPositionUser;
}

export interface JoinProjectResponse {
  position: InvestmentPosition;
  via_invitation: boolean;
}

export interface CheckMembershipResponse {
  isMember: boolean;
  isOwner: boolean;
  status: MembershipStatus | null;
}
