import { apiService } from '../api/api.service';
import { authService } from '../auth/auth.service';
import {
  Project,
  ProjectImage,
  ProjectDocument,
} from '@/models/projects/project.model';
import {
  CreateProjectDto,
  UpdateProjectDto,
} from '@/models/projects/project-dto.model';

class ProjectsService {
  async create(data: CreateProjectDto): Promise<Project> {
    const response = await apiService.post<Project>('/projects', data);
    return response.data;
  }

  async findAll(): Promise<Project[]> {
    const response = await apiService.get<Project[]>('/projects');
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

  // ============= MÉTODOS PARA IMÁGENES =============

  async uploadImage(
    projectId: string,
    file: File,
    isPrimary: boolean = false,
    altText?: string,
    sortOrder: number = 0
  ): Promise<ProjectImage> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_primary', String(isPrimary));
    if (altText) formData.append('alt_text', altText);
    formData.append('sort_order', String(sortOrder));

    const token = authService.getToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/projects/${projectId}/images/upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload image');
    }

    const result = await response.json();
    return result.data;
  }

  async getImages(projectId: string): Promise<ProjectImage[]> {
    const response = await apiService.get<ProjectImage[]>(
      `/projects/${projectId}/images`
    );
    return response.data;
  }

  async deleteImage(projectId: string, imageId: string): Promise<void> {
    await apiService.delete(`/projects/${projectId}/images/${imageId}`);
  }

  // ============= MÉTODOS PARA DOCUMENTOS =============

  async uploadDocument(
    projectId: string,
    file: File,
    title: string,
    kind: 'GENERAL' | 'CONTENT' | 'IMPORTANT' = 'GENERAL',
    purpose?: string
  ): Promise<ProjectDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('kind', kind);
    if (purpose) formData.append('purpose', purpose);

    const token = authService.getToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/projects/${projectId}/documents/upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload document');
    }

    const result = await response.json();
    return result.data;
  }

  async getDocuments(projectId: string): Promise<ProjectDocument[]> {
    const response = await apiService.get<ProjectDocument[]>(
      `/projects/${projectId}/documents`
    );
    return response.data;
  }

  async deleteDocument(projectId: string, docId: string): Promise<void> {
    await apiService.delete(`/projects/${projectId}/documents/${docId}`);
  }

  // ============= BLOCKCHAIN =============

  async publish(id: string): Promise<Project> {
    const response = await apiService.post<Project>(`/projects/${id}/publish`);
    return response.data;
  }

  async registerContract(id: string, data: { contractAddress: string; txHash: string }): Promise<Project> {
    const response = await apiService.post<Project>(`/projects/${id}/register-contract`, data);
    return response.data;
  }

  async registerV2Contract(id: string, data: any): Promise<Project> {
    const response = await apiService.post<Project>(`/projects/${id}/register-v2`, data);
    return response.data;
  }

  async getBlockchainData(id: string): Promise<{
    isDeployed: boolean;
    contractAddress?: string;
    chainId?: number;
    deployTxHash?: string;
    onChainData?: unknown;
  }> {
    const response = await apiService.get<{
      isDeployed: boolean;
      contractAddress?: string;
      chainId?: number;
      deployTxHash?: string;
      onChainData?: unknown;
    }>(`/projects/${id}/blockchain`);
    return response.data;
  }
}

export const projectsService = new ProjectsService();
