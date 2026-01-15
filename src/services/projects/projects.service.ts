import { apiService } from '../api';
import { ProjectMapper } from '@/mappers/ProjectMapper';
import { ProjectsResponseDto, ProjectDto } from '@/dtos/projects';
import { Project } from '@/models/Project.model';

interface GetProjectsParams {
  page?: number;
  limit?: number;
  type?: 'NATILLERA' | 'TOKENIZATION';
  visibility?: 'PUBLIC' | 'PRIVATE';
  owner?: boolean;
}

class ProjectsService {
  async getProjects(params?: GetProjectsParams): Promise<Project[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.type) queryParams.set('type', params.type);
    if (params?.visibility) queryParams.set('visibility', params.visibility);
    if (params?.owner) queryParams.set('owner', 'true');

    const endpoint = `/projects${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await apiService.get<ProjectsResponseDto>(endpoint);

    if (response.data) {
      return ProjectMapper.fromDtoArray(response.data.projects);
    }
    throw new Error('No data received from projects');
  }

  async getProject(id: string): Promise<Project> {
    const response = await apiService.get<ProjectDto>(`/projects/${id}`);
    if (response.data) {
      return ProjectMapper.fromDto(response.data);
    }
    throw new Error('No data received from project');
  }
}

export const projectsService = new ProjectsService();
