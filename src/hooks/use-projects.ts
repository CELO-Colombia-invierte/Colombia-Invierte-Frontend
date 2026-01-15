import { useState, useCallback } from 'react';
import { projectsService } from '@/services';
import { Project } from '@/models/Project.model';

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

  const fetchProjects = useCallback(async (params?: GetProjectsParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectsService.getProjects(params);
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
