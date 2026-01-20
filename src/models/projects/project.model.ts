export enum ProjectType {
  NATILLERA = 'NATILLERA',
  TOKENIZATION = 'TOKENIZATION',
}

export enum ProjectVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum Currency {
  COP = 'COP',
  USD = 'USD',
  USDT = 'USDT',
  OUSD = 'OUSD',
}

export interface User {
  id: string;
  username: string;
  display_name: string;
  email?: string;
}

export interface NatilleraDetails {
  project_id: string;
  monthly_fee_amount: number;
  monthly_fee_currency: Currency;
  expected_annual_return_pct: number;
  duration_months: number;
  payment_deadline_at: string;
}

export interface TokenizationDetails {
  project_id: string;
  asset_value_amount: number;
  asset_value_currency: Currency;
  expected_annual_return_pct: number;
  price_per_token_amount: number;
  price_per_token_currency: Currency;
  total_tokens: number;
  token_symbol: string;
  token_name: string;
  presale_enabled: boolean;
  presale_starts_at?: string;
  public_sale_starts_at?: string;
}

export interface TokenRight {
  id: string;
  project_id: string;
  title: string;
  description: string;
  sort_order: number;
}

export interface TokenFaq {
  id: string;
  project_id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface MediaAsset {
  id: string;
  owner_user_id: string;
  url: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  width?: number;
  height?: number;
  created_at: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  asset_id: string;
  asset?: MediaAsset;
  title: string;
  kind?: 'GENERAL' | 'CONTENT' | 'IMPORTANT';
  purpose?: string;
  sort_order: number;
  created_at: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  asset_id: string;
  asset?: MediaAsset;
  is_primary: boolean;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  type: ProjectType;
  name: string;
  description_rich?: string;
  highlights_rich?: string;
  visibility: ProjectVisibility;
  share_slug: string;
  owner_user_id: string;
  owner_user?: User;
  cover_asset_id?: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
  natillera_details?: NatilleraDetails;
  tokenization_details?: TokenizationDetails;
  token_rights?: TokenRight[];
  token_faqs?: TokenFaq[];
  documents?: ProjectDocument[];
}
