import { apiService } from '../api';
import { PortfolioMapper } from '@/mappers/PortfolioMapper';
import {
  PortfolioResponseDto,
  CreatePositionRequestDto,
} from '@/dtos/portfolio';
import { Portfolio } from '@/models/Portfolio.model';

class PortfolioService {
  async getPortfolio(): Promise<Portfolio> {
    const response = await apiService.get<PortfolioResponseDto>('/portfolio');
    if (response.data) {
      return PortfolioMapper.fromDto(response.data);
    }
    throw new Error('No data received from portfolio');
  }

  async createPosition(data: CreatePositionRequestDto): Promise<void> {
    await apiService.post('/portfolio/positions', data);
  }
}

export const portfolioService = new PortfolioService();
