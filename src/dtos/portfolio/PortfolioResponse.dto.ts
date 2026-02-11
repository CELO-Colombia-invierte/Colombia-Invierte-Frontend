/**
 * DTOs para el módulo de portfolio
 * Representan exactamente la estructura que retorna el backend
 */

export interface BalancesDto {
  COP: number;
  USD: number;
  USDT: number;
  OUSD: number;
}

export interface PositionProjectDto {
  id: string;
  name: string;
  type: 'NATILLERA' | 'TOKENIZATION';
  cover_url: string | null;
}

export interface PositionDto {
  id: string;
  project: PositionProjectDto;
  base_amount: number;
  base_currency: string;
  created_at: string;
}

export interface PortfolioResponseDto {
  balances: BalancesDto;
  positions: PositionDto[];
}

export interface CreatePositionRequestDto {
  base_amount: number;
  base_currency: string;
}
