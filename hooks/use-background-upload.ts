import { useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { uploadShortVideo } from '@/lib/storage-helpers';

export interface UploadProgress {
  progress: number;
  stage: 'preparing' | 'uploading' | 'processing' | 'complete' | 'error';
  message: string;
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export const useBackgroundUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    stage: 'preparing',
    message: 'Preparando subida...'
  });

  const uploadAbortController = useRef<AbortController | null>(null);

  const uploadVideo = useCallback(async (
    videoUri: string,
    thumbnailUri: string,
    metadata: {
      title: string;
      description: string;
      category: string;
      placeName: string;
    },
    options: UploadOptions = {}
  ) => {
    setIsUploading(true);
    uploadAbortController.current = new AbortController();

    try {
      // Preparación
      const prepProgress = {
        progress: 10,
        stage: 'preparing' as const,
        message: 'Preparando archivo...'
      };
      setUploadProgress(prepProgress);
      options.onProgress?.(prepProgress);

      // Generar ID temporal para el short
      const shortId = `short-${Date.now()}`;

      // Subida del video y thumbnail a Supabase Storage
      const uploadingProgress = {
        progress: 30,
        stage: 'uploading' as const,
        message: 'Subiendo video...'
      };
      setUploadProgress(uploadingProgress);
      options.onProgress?.(uploadingProgress);

      const { videoUrl, thumbnailUrl } = await uploadShortVideo(
        shortId,
        videoUri,
        thumbnailUri
      );

      // Procesamiento completado
      const processingProgress = {
        progress: 85,
        stage: 'processing' as const,
        message: 'Procesando en servidor...'
      };
      setUploadProgress(processingProgress);
      options.onProgress?.(processingProgress);

      // Resultado final
      const result = {
        id: shortId,
        videoUrl,
        thumbnailUrl,
        ...metadata,
      };

      // Completar
      const finalProgress = {
        progress: 100,
        stage: 'complete' as const,
        message: '¡Subida completada!'
      };

      setUploadProgress(finalProgress);
      options.onProgress?.(finalProgress);
      options.onSuccess?.(result);

      return result;
    } catch (error) {
      const errorProgress = {
        progress: 0,
        stage: 'error' as const,
        message: error instanceof Error ? error.message : 'Error desconocido'
      };

      setUploadProgress(errorProgress);
      options.onProgress?.(errorProgress);
      options.onError?.(error as Error);

      throw error;
    } finally {
      setIsUploading(false);
      uploadAbortController.current = null;
    }
  }, []);

  const cancelUpload = useCallback(() => {
    if (uploadAbortController.current) {
      uploadAbortController.current.abort();
      setIsUploading(false);
      setUploadProgress({
        progress: 0,
        stage: 'preparing',
        message: 'Subida cancelada'
      });
    }
  }, []);

  const resetUpload = useCallback(() => {
    setIsUploading(false);
    setUploadProgress({
      progress: 0,
      stage: 'preparing',
      message: 'Preparando subida...'
    });
  }, []);

  return {
    isUploading,
    uploadProgress,
    uploadVideo,
    cancelUpload,
    resetUpload,
  };
};
