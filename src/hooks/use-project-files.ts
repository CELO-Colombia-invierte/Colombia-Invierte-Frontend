import { useState, useCallback } from 'react';
import { projectsService } from '@/services';
import { ProjectImage, ProjectDocument } from '@/models/projects';

export const useProjectFiles = (projectId: string) => {
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      const data = await projectsService.getImages(projectId);
      setImages(data);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [projectId]);

  const fetchDocuments = useCallback(async () => {
    try {
      const data = await projectsService.getDocuments(projectId);
      setDocuments(data);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [projectId]);

  const uploadImage = useCallback(
    async (file: File, isPrimary: boolean = false, altText?: string) => {
      setIsUploading(true);
      setError(null);
      try {
        const result = await projectsService.uploadImage(
          projectId,
          file,
          isPrimary,
          altText
        );
        await fetchImages();
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [projectId, fetchImages]
  );

  const uploadDocument = useCallback(
    async (
      file: File,
      title: string,
      kind: 'GENERAL' | 'CONTENT' | 'IMPORTANT' = 'GENERAL',
      purpose?: string
    ) => {
      setIsUploading(true);
      setError(null);
      try {
        const result = await projectsService.uploadDocument(
          projectId,
          file,
          title,
          kind,
          purpose
        );
        await fetchDocuments();
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [projectId, fetchDocuments]
  );

  const deleteImage = useCallback(
    async (imageId: string) => {
      try {
        await projectsService.deleteImage(projectId, imageId);
        await fetchImages();
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [projectId, fetchImages]
  );

  const deleteDocument = useCallback(
    async (docId: string) => {
      try {
        await projectsService.deleteDocument(projectId, docId);
        await fetchDocuments();
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [projectId, fetchDocuments]
  );

  return {
    images,
    documents,
    isUploading,
    error,
    fetchImages,
    fetchDocuments,
    uploadImage,
    uploadDocument,
    deleteImage,
    deleteDocument,
  };
};
