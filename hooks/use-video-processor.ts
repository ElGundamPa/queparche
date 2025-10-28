import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { simpleVideoProcessor } from '@/lib/simple-video-processor';
import { VideoProcessingConfig, ProcessingResult } from '@/lib/simple-video-processor';

export interface VideoProcessingOptions extends VideoProcessingConfig {}

export interface ProcessingProgress {
  progress: number;
  stage: 'loading' | 'processing' | 'uploading' | 'complete' | 'error';
  message: string;
}

export const useVideoProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress>({
    progress: 0,
    stage: 'loading',
    message: 'Iniciando procesamiento...'
  });

  const processVideo = useCallback(async (
    input: File | string,
    options: VideoProcessingOptions = {
      targetWidth: 1080,
      targetHeight: 1920,
      quality: 'high',
      addBlurBackground: true
    }
  ): Promise<Blob> => {
    setIsProcessing(true);
    setProgress({ progress: 0, stage: 'loading', message: 'Inicializando procesador...' });

    try {
      setProgress({ progress: 10, stage: 'processing', message: 'Cargando video...' });
      
      const result: ProcessingResult = await simpleVideoProcessor.processVideo(
        input,
        options,
        (progressPercent) => {
          setProgress({
            progress: 10 + (progressPercent * 0.8), // 10-90%
            stage: 'processing',
            message: `Procesando video... ${progressPercent}%`
          });
        }
      );
      
      setProgress({ progress: 100, stage: 'complete', message: '¡Video procesado exitosamente!' });
      
      return result.blob;
    } catch (error) {
      console.error('Error processing video:', error);
      setProgress({
        progress: 0,
        stage: 'error',
        message: 'Error al procesar el video'
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({
      progress: 0,
      stage: 'loading',
      message: 'Iniciando procesamiento...'
    });
  }, []);

  return {
    isProcessing,
    progress,
    processVideo,
    resetProgress
  };
};
