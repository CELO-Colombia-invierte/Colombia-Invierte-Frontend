import { Portfolio, Balances, Position } from '@/models/Portfolio.model';
import {
  PortfolioResponseDto,
  BalancesDto,
  PositionDto,
} from '@/dtos/portfolio';

/**
 * PortfolioMapper - Transforma entre DTOs del API y Models del dominio
 */
export class PortfolioMapper {
  /**
   * Convierte BalancesDto del API a Balances Model
   */
  static balancesFromDto(dto: BalancesDto): Balances {
    return new Balances({
      cop: dto.COP,
      usd: dto.USD,
      usdt: dto.USDT,
      ousd: dto.OUSD,
    });
  }

  /**
   * Convierte PositionDto del API a Position Model
   */
  static positionFromDto(dto: PositionDto): Position {
    return new Position({
      id: dto.id,
      projectId: dto.project.id,
      projectName: dto.project.name,
      projectType: dto.project.type,
      projectCoverUrl: dto.project.cover_url,
      baseAmount: dto.base_amount,
      baseCurrency: dto.base_currency,
      createdAt: dto.created_at,
    });
  }

  /**
   * Convierte PortfolioResponseDto del API a Portfolio Model
   */
  static fromDto(dto: PortfolioResponseDto): Portfolio {
    return new Portfolio({
      balances: this.balancesFromDto(dto.balances),
      positions: dto.positions.map((p) => this.positionFromDto(p)),
    });
  }
}
