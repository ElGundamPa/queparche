import { EventEmitter } from 'events';

/**
 * Gestor global del estado de reproducción de videos
 * Emite eventos para pausar/reanudar todos los videos de la app
 */
class VideoStateManager extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Soporta hasta 50 suscriptores
  }

  /**
   * Emite evento para pausar todos los videos
   */
  pauseAllVideos() {
    this.emit('GLOBAL_PAUSE_VIDEOS');
  }

  /**
   * Emite evento para reanudar reproducción
   */
  resumeAllVideos() {
    this.emit('GLOBAL_RESUME_VIDEOS');
  }
}

export const videoStateManager = new VideoStateManager();

