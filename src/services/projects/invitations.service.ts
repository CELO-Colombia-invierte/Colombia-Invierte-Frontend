import { apiService } from "../api/api.service";
import { ProjectInvitation, CreateInvitationDto } from "@/models/invitations/invitation.model";

class ProjectInvitationsService {
  async create(projectId: string, data: CreateInvitationDto): Promise<ProjectInvitation> {
    const response = await apiService.post<ProjectInvitation>(
      `/projects/${projectId}/invitations`,
      data
    );
    return response.data;
  }

  async findAll(projectId: string): Promise<ProjectInvitation[]> {
    const response = await apiService.get<ProjectInvitation[]>(
      `/projects/${projectId}/invitations`
    );
    return response.data;
  }

  async accept(invitationId: string): Promise<void> {
    await apiService.post(`/invitations/${invitationId}/accept`, {});
  }

  async decline(invitationId: string): Promise<void> {
    await apiService.post(`/invitations/${invitationId}/decline`, {});
  }
}

export const projectInvitationsService = new ProjectInvitationsService();
