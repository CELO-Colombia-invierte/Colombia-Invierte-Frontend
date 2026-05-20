import { Portfolio, Balances, Position } from '@/models/Portfolio.model';
import {
  PortfolioResponseDto,
  BalancesDto,
  PositionDto,
} from '@/dtos/portfolio';

export class PortfolioMapper {
  static balancesFromDto(dto: BalancesDto): Balances {
    return new Balances({
      cop: dto.COP,
      usd: dto.USD,
      usdt: dto.USDT,
      ousd: dto.OUSD,
    });
  }

  static positionFromDto(dto: PositionDto): Position {
    return new Position({
      id: dto.id,
      projectId: dto.project.id,
      projectName: dto.project.name,
      projectType: dto.project.type,
      projectCoverUrl: dto.project.cover_url,
      baseAmount: dto.base_amount,
      baseCurrency: dto.base_currency,
      pctChange: dto.pct_change ?? 0,
      currentValue: dto.current_value ?? dto.base_amount,
      totalCollected: dto.total_collected ?? 0,
      createdAt: dto.created_at,
    });
  }

  static fromDto(dto: PortfolioResponseDto): Portfolio {
    return new Portfolio({
      balances: this.balancesFromDto(dto.balances),
      positions: dto.positions.map((p) => this.positionFromDto(p)),
    });
  }
}
