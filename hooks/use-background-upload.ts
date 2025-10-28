import { useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';

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
    videoBlob: Blob,
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
      // Simular preparación
      setUploadProgress({
        progress: 10,
        stage: 'preparing',
        message: 'Preparando archivo...'
      });
      
      options.onProgress?.(uploadProgress);

      // Simular subida con progreso realista
      const formData = new FormData();
      formData.append('video', videoBlob, 'short.mp4');
      formData.append('metadata', JSON.stringify(metadata));

      // Simular progreso de subida
      for (let i = 10; i <= 80; i += 10) {
        if (uploadAbortController.current?.signal.aborted) {
          throw new Error('Upload cancelled');
        }

        await new Promise(resolve => setTimeout(resolve, 200));
        
        const progress = {
          progress: i,
          stage: 'uploading' as const,
          message: `Subiendo video... ${i}%`
        };
        
        setUploadProgress(progress);
        options.onProgress?.(progress);
      }

      // Simular procesamiento en servidor
      setUploadProgress({
        progress: 85,
        stage: 'processing',
        message: 'Procesando en servidor...'
      });
      
      options.onProgress?.(uploadProgress);

      // Simular llamada al API real
      const response = await fetch('/api/shorts/create', {
        method: 'POST',
        body: formData,
        signal: uploadAbortController.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

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
