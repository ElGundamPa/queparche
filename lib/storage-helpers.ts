import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

/**
 * Helper para subir avatar de usuario a Supabase Storage
 * @param userId ID del usuario (UUID)
 * @param imageUri URI local de la imagen (file://)
 * @returns URL pública de la imagen subida
 */
export async function uploadAvatar(userId: string, imageUri: string): Promise<string> {
  try {
    // Leer archivo como base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64' as any,
    });

    const fileName = `${userId}/${Date.now()}.jpg`;
    const contentType = 'image/jpeg';

    // Upload a Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, decode(base64), {
        contentType,
        upsert: true, // Sobreescribir si ya existe
      });

    if (error) throw error;

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw new Error('No se pudo subir el avatar');
  }
}

/**
 * Helper para subir múltiples imágenes de un plan
 * @param planId ID del plan (UUID)
 * @param imageUris Array de URIs locales de imágenes
 * @returns Array de URLs públicas
 */
export async function uploadPlanImages(planId: string, imageUris: string[]): Promise<string[]> {
  const uploadPromises = imageUris.map(async (uri, index) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64' as any,
      });

      const fileName = `${planId}/${Date.now()}-${index}.jpg`;

      const { data, error } = await supabase.storage
        .from('plan-images')
        .upload(fileName, decode(base64), {
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('plan-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error(`Error uploading plan image ${index}:`, error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
}

/**
 * Helper para subir video y thumbnail de un short
 * @param shortId ID del short (UUID)
 * @param videoUri URI local del video
 * @param thumbnailUri URI local del thumbnail
 * @returns Objeto con videoUrl y thumbnailUrl
 */
export async function uploadShortVideo(
  shortId: string,
  videoUri: string,
  thumbnailUri: string
): Promise<{ videoUrl: string; thumbnailUrl: string }> {
  try {
    // Upload video
    const videoBase64 = await FileSystem.readAsStringAsync(videoUri, {
      encoding: 'base64' as any,
    });

    const videoFileName = `${shortId}/${Date.now()}.mp4`;

    const { data: videoData, error: videoError } = await supabase.storage
      .from('short-videos')
      .upload(videoFileName, decode(videoBase64), {
        contentType: 'video/mp4',
      });

    if (videoError) throw videoError;

    // Upload thumbnail
    const thumbBase64 = await FileSystem.readAsStringAsync(thumbnailUri, {
      encoding: 'base64' as any,
    });

    const thumbFileName = `${shortId}/${Date.now()}-thumb.jpg`;

    const { data: thumbData, error: thumbError } = await supabase.storage
      .from('short-thumbnails')
      .upload(thumbFileName, decode(thumbBase64), {
        contentType: 'image/jpeg',
      });

    if (thumbError) throw thumbError;

    // Get public URLs
    const { data: { publicUrl: videoUrl } } = supabase.storage
      .from('short-videos')
      .getPublicUrl(videoFileName);

    const { data: { publicUrl: thumbnailUrl } } = supabase.storage
      .from('short-thumbnails')
      .getPublicUrl(thumbFileName);

    return { videoUrl, thumbnailUrl };
  } catch (error) {
    console.error('Error uploading short video:', error);
    throw new Error('No se pudo subir el video');
  }
}

/**
 * Helper para subir imagen de evento
 * @param eventId ID del evento (UUID)
 * @param imageUri URI local de la imagen
 * @returns URL pública de la imagen
 */
export async function uploadEventImage(eventId: string, imageUri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64' as any,
    });

    const fileName = `${eventId}/${Date.now()}.jpg`;

    const { data, error } = await supabase.storage
      .from('event-images')
      .upload(fileName, decode(base64), {
        contentType: 'image/jpeg',
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('event-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading event image:', error);
    throw new Error('No se pudo subir la imagen del evento');
  }
}

/**
 * Helper para eliminar un archivo de storage
 * @param bucket Nombre del bucket ('avatars', 'plan-images', etc.)
 * @param path Ruta del archivo dentro del bucket
 */
export async function deleteStorageFile(bucket: string, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting storage file:', error);
    throw new Error('No se pudo eliminar el archivo');
  }
}

/**
 * Helper para obtener tamaño de archivo
 * @param uri URI local del archivo
 * @returns Tamaño en bytes
 */
export async function getFileSize(uri: string): Promise<number> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return fileInfo.size || 0;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
}

/**
 * Validar tamaño de archivo antes de subir
 * @param uri URI del archivo
 * @param maxSizeMB Tamaño máximo en MB
 * @returns true si el archivo es válido
 */
export async function validateFileSize(uri: string, maxSizeMB: number): Promise<boolean> {
  const size = await getFileSize(uri);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
}

/**
 * Constantes de tamaños máximos por tipo de archivo
 */
export const MAX_FILE_SIZES = {
  AVATAR: 5, // 5MB
  PLAN_IMAGE: 10, // 10MB
  SHORT_VIDEO: 50, // 50MB
  SHORT_THUMBNAIL: 2, // 2MB
  EVENT_IMAGE: 10, // 10MB
} as const;
