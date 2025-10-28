import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export interface VideoProcessingConfig {
  targetWidth: number;
  targetHeight: number;
  quality: 'high' | 'medium' | 'low';
  addBlurBackground: boolean;
}

export interface ProcessingResult {
  blob: Blob;
  duration: number;
  size: number;
  originalSize: number;
  compressionRatio: number;
}

class SimpleVideoProcessor {
  async processVideo(
    input: File | string,
    config: VideoProcessingConfig,
    onProgress?: (progress: number) => void
  ): Promise<ProcessingResult> {
    onProgress?.(10);

    if (Platform.OS === 'web') {
      // Para web, simplemente retornar el archivo como está
      if (typeof input === 'string') {
        throw new Error('Web processor requires File object');
      }

      onProgress?.(50);

      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));

      onProgress?.(100);

      return {
        blob: input,
        duration: 0,
        size: input.size,
        originalSize: input.size,
        compressionRatio: 0,
      };
    } else {
      // Para móvil, usar expo-image-picker para recortar
      if (typeof input !== 'string') {
        throw new Error('Mobile processor requires video URI string');
      }

      onProgress?.(30);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [config.targetWidth, config.targetHeight],
        quality: this.getQualityValue(config.quality),
        videoMaxDuration: 60,
      });

      onProgress?.(80);

      if (result.canceled || !result.assets || result.assets.length === 0) {
        throw new Error('Video processing was canceled');
      }

      const processedAsset = result.assets[0];
      
      onProgress?.(100);

      // Crear un blob mock para compatibilidad
      const mockBlob = new Blob(['mock'], { type: 'video/mp4' });
      
      return {
        blob: mockBlob,
        duration: processedAsset.duration || 0,
        size: processedAsset.fileSize || 0,
        originalSize: processedAsset.fileSize || 0,
        compressionRatio: 0,
      };
    }
  }

  private getQualityValue(quality: 'high' | 'medium' | 'low'): number {
    switch (quality) {
      case 'high':
        return 1;
      case 'medium':
        return 0.7;
      case 'low':
        return 0.5;
      default:
        return 0.7;
    }
  }

  async createThumbnail(input: File | string, timeInSeconds: number = 1): Promise<string> {
    if (Platform.OS === 'web') {
      if (typeof input === 'string') {
        throw new Error('Web processor requires File object');
      }
      
      return this.createWebThumbnail(input, timeInSeconds);
    } else {
      // Para móvil, retornar la URI como thumbnail
      if (typeof input === 'string') {
        return input;
      } else {
        throw new Error('Mobile processor requires video URI string');
      }
    }
  }

  private async createWebThumbnail(file: File, timeInSeconds: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('No se pudo crear el contexto del canvas'));
        return;
      }
      
      video.onloadedmetadata = () => {
        video.currentTime = timeInSeconds;
      };
      
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.drawImage(video, 0, 0);
        
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnailUrl);
      };
      
      video.onerror = () => {
        reject(new Error('Error al crear thumbnail'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  }
}

// Instancia singleton
export const simpleVideoProcessor = new SimpleVideoProcessor();
