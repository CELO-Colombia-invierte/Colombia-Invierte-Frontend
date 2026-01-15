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

export interface PositionDto {
  id: string;
  project_id: string;
  project_name: string;
  base_amount: number;
  base_currency: string;
  value_cop: number;
  change_percentage: number;
}

export interface PortfolioResponseDto {
  balances: BalancesDto;
  positions: PositionDto[];
}

export interface CreatePositionRequestDto {
  base_amount: number;
  base_currency: string;
}
