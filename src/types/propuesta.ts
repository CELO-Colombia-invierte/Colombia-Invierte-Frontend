export type PropuestaStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface PropuestaResponsibleUser {
  id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  wallet_address?: string | null;
}

export interface Propuesta {
  id: string;
  project_id: string;
  title: string;
  description: string;
  responsible_user: PropuestaResponsibleUser;
  withdrawal_amount: number;
  estimated_profit?: number;
  actual_profit?: number;
  background_image_url?: string;
  status: PropuestaStatus;
  votes_yes: number;
  votes_no: number;
  total_members: number;
  can_vote?: boolean;
  created_at: string;
  user_vote?: 'YES' | 'NO' | null;
  proposal_chain_id?: string | null;
  propose_tx_hash?: string | null;
  governance_address?: string | null;
  natillera_address?: string | null;
  vault_address?: string | null;
  project_type?: string | null;
  tx_hash?: string | null;
  execute_tx_hash?: string | null;
  return_yield_tx_hash?: string | null;
  returned_amount?: number | null;
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
  can_vote?: boolean;
  user_vote?: 'YES' | 'NO' | null;
  status: PropuestaStatus;
}
