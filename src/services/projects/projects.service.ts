import { apiService } from "../api/api.service";
import { Project } from "@/models/projects/project.model";
import { CreateProjectDto, UpdateProjectDto } from "@/models/projects/project-dto.model";

class ProjectsService {
  async create(data: CreateProjectDto): Promise<Project> {
    const response = await apiService.post<Project>("/projects", data);
    return response.data;
  }

  async findAll(): Promise<Project[]> {
    const response = await apiService.get<Project[]>("/projects");
    return response.data;
  }

  async findOne(id: string): Promise<Project> {
    const response = await apiService.get<Project>(`/projects/${id}`);
    return response.data;
  }

  async update(id: string, data: UpdateProjectDto): Promise<Project> {
    const response = await apiService.patch<Project>(`/projects/${id}`, data);
    return response.data;
  }
}

export const projectsService = new ProjectsService();
