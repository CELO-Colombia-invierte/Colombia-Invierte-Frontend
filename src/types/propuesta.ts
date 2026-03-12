export type PropuestaStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PropuestaResponsibleUser {
  id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
}

export interface Propuesta {
  id: string;
  project_id: string;
  title: string;
  description: string;
  responsible_user: PropuestaResponsibleUser;
  withdrawal_amount: number;
  estimated_profit?: number;
  background_image_url?: string;
  status: PropuestaStatus;
  votes_yes: number;
  votes_no: number;
  total_members: number;
  created_at: string;
  user_vote?: 'YES' | 'NO' | null;
}

export interface PaginatedPropuestas {
  items: Propuesta[];
  total: number;
  hasMore: boolean;
}

export interface PropuestaFormData {
  title: string;
  description: string;
  responsible_user_id: string;
  responsible_name: string;
  responsible_username: string;
  withdrawal_amount: number;
  estimated_profit?: number;
  background_image?: File;
  background_image_url?: string;
}

export interface PropuestaPreview {
  id: string;
  title: string;
  description: string;
  responsible_name: string;
  withdrawal_amount: number;
  estimated_profit?: number;
  background_image_url?: string;
  votes_yes: number;
  votes_no: number;
  total_members: number;
  status: PropuestaStatus;
}
