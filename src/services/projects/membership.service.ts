import { apiService } from '../api/api.service';
import {
  InvestmentPosition,
  JoinProjectResponse,
  CheckMembershipResponse,
} from '@/models/membership/membership.model';

class ProjectMembershipService {
  async join(projectId: string): Promise<JoinProjectResponse> {
    const response = await apiService.post<JoinProjectResponse>(
      `/projects/${projectId}/membership/join`,
      {}
    );
    return response.data;
  }

  async getMembers(projectId: string): Promise<InvestmentPosition[]> {
    const response = await apiService.get<InvestmentPosition[]>(
      `/projects/${projectId}/membership/members`
    );
    return response.data;
  }

  async getPendingRequests(projectId: string): Promise<InvestmentPosition[]> {
    const response = await apiService.get<InvestmentPosition[]>(
      `/projects/${projectId}/membership/pending`
    );
    return response.data;
  }

  async approveMembership(
    projectId: string,
    positionId: string
  ): Promise<InvestmentPosition> {
    const response = await apiService.post<InvestmentPosition>(
      `/projects/${projectId}/membership/members/${positionId}/approve`,
      {}
    );
    return response.data;
  }

  async rejectMembership(
    projectId: string,
    positionId: string
  ): Promise<InvestmentPosition> {
    const response = await apiService.post<InvestmentPosition>(
      `/projects/${projectId}/membership/members/${positionId}/reject`,
      {}
    );
    return response.data;
  }

  async removeMember(projectId: string, positionId: string): Promise<void> {
    await apiService.delete(
      `/projects/${projectId}/membership/members/${positionId}`
    );
  }

  async checkMembership(projectId: string): Promise<CheckMembershipResponse> {
    const response = await apiService.get<CheckMembershipResponse>(
      `/projects/${projectId}/membership/check`
    );
    return response.data;
  }
}

export const projectMembershipService = new ProjectMembershipService();
