import { useState, useCallback } from 'react';
import { projectsService } from '@/services';
import { Project } from '@/models/projects';

interface GetProjectsParams {
  page?: number;
  limit?: number;
  type?: 'NATILLERA' | 'TOKENIZATION';
  visibility?: 'PUBLIC' | 'PRIVATE';
  owner?: boolean;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = useCallback(async (_params?: GetProjectsParams) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: projectsService.findAll() no acepta params actualmente
      // Si necesitas filtrar, debes implementarlo en el backend
      const data = await projectsService.findAll();
      setProjects(data);
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
  };
};
