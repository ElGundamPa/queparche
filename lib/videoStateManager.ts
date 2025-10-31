/**
 * Gestor global del estado de reproducción de videos
 * Emite eventos para pausar/reanudar todos los videos de la app
 * Implementación simple compatible con React Native (sin dependencias de Node.js)
 */
type EventType = 'GLOBAL_PAUSE_VIDEOS' | 'GLOBAL_RESUME_VIDEOS';
type Listener = () => void;

class VideoStateManager {
  private listeners: Map<EventType, Set<Listener>> = new Map();

  constructor() {
    // Inicializar listeners para cada tipo de evento
    this.listeners.set('GLOBAL_PAUSE_VIDEOS', new Set());
    this.listeners.set('GLOBAL_RESUME_VIDEOS', new Set());
  }

  /**
   * Suscribirse a un evento
   */
  on(event: EventType, listener: Listener) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.add(listener);
    }
  }

  /**
   * Desuscribirse de un evento
   */
  off(event: EventType, listener: Listener) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  /**
   * Emite evento para pausar todos los videos
   */
  pauseAllVideos() {
    const eventListeners = this.listeners.get('GLOBAL_PAUSE_VIDEOS');
    if (eventListeners) {
      eventListeners.forEach(listener => listener());
    }
  }

  /**
   * Emite evento para reanudar reproducción
   */
  resumeAllVideos() {
    const eventListeners = this.listeners.get('GLOBAL_RESUME_VIDEOS');
    if (eventListeners) {
      eventListeners.forEach(listener => listener());
    }
  }
}

export const videoStateManager = new VideoStateManager();

