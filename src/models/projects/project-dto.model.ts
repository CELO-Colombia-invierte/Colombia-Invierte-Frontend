import { ProjectType, ProjectVisibility, Currency } from './project.model';

export interface NatilleraDetailsDto {
  monthly_fee_amount: number;
  monthly_fee_currency: Currency;
  expected_annual_return_pct: number;
  duration_months: number;
  payment_deadline_at: string;
}

export interface TokenizationDetailsDto {
  asset_value_amount: number;
  asset_value_currency: Currency;
  expected_annual_return_pct: number;
  price_per_token_amount: number;
  price_per_token_currency: Currency;
  total_tokens: number;
  token_symbol: string;
  token_name: string;
  presale_enabled?: boolean;
  presale_starts_at?: string;
  public_sale_starts_at?: string;
}

export interface TokenRightDto {
  title: string;
  description: string;
}

export interface TokenFaqDto {
  question: string;
  answer: string;
}

export interface CreateProjectDto {
  type: ProjectType;
  name: string;
  description_rich?: string;
  highlights_rich?: string;
  cover_asset_id?: string;
  category_id?: string;
  visibility?: ProjectVisibility;
  natillera_details?: NatilleraDetailsDto;
  tokenization_details?: TokenizationDetailsDto;
  token_rights?: TokenRightDto[];
  token_faqs?: TokenFaqDto[];
}

export interface UpdateProjectDto {
  name?: string;
  description_rich?: string;
  highlights_rich?: string;
  cover_asset_id?: string;
  category_id?: string;
  visibility?: ProjectVisibility;
}
