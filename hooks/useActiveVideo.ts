import { useEffect, useRef, useState } from 'react';
import { useVideoPlayer, AVPlaybackStatus } from 'expo-video';

interface UseActiveVideoOptions {
  videoUrl: string;
  isActive: boolean;
  autoPlay?: boolean;
  loop?: boolean;
}

const DEBUG = false; // Cambiar a true para logs de desarrollo
const PROGRESS_THROTTLE_MS = 120; // Throttling del progreso para reducir renders

/**
 * Hook para manejar la reproducción de videos de forma optimizada
 * Evita re-renders innecesarios y maneja pausa/reproducción automática
 */
export function useActiveVideo({ 
  videoUrl, 
  isActive, 
  autoPlay = true,
  loop = true 
}: UseActiveVideoOptions) {
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = loop;
    player.muted = false;
  });

  const wasActiveRef = useRef(false);
  const lastProgressUpdateRef = useRef(0);

  // Control de reproducción basado en visibilidad
  useEffect(() => {
    if (isActive) {
      // Video está activo - reanudación segura
      if (DEBUG) console.log(`[useActiveVideo] Video activo`);
      player.muted = false;
      
      if (autoPlay) {
        // Pausar primero y luego reproducir para evitar "doble play"
        if (wasActiveRef.current) {
          player.pause();
          requestAnimationFrame(() => {
            player.play();
          });
        } else {
          player.play();
        }
      }
      wasActiveRef.current = true;
    } else {
      // Video NO está activo - pausar siempre
      if (DEBUG) console.log(`[useActiveVideo] Pausando video`);
      player.pause();
      player.muted = true;
      wasActiveRef.current = false;
    }
  }, [isActive, player, autoPlay]);

  // Listener para actualizar progreso con throttling
  useEffect(() => {
    const subscription = player.addListener('playbackStatusUpdate', (status: AVPlaybackStatus) => {
      if (status.isLoaded && status.durationMillis) {
        const now = Date.now();
        // Throttling: solo actualizar cada PROGRESS_THROTTLE_MS
        if (now - lastProgressUpdateRef.current >= PROGRESS_THROTTLE_MS) {
          const newProgress = status.currentTimeMillis / status.durationMillis;
          setProgress(newProgress);
          lastProgressUpdateRef.current = now;
        }
      }
    });

    return () => subscription?.remove();
  }, [player]);

  // Control de velocidad de reproducción
  useEffect(() => {
    try {
      // @ts-ignore - playbackRate puede no estar en tipos
      if (player.playbackRate !== undefined) {
        // @ts-ignore
        player.playbackRate = playbackRate;
      }
    } catch (e) {
      // Rate no soportado en esta plataforma
      if (DEBUG) console.log('Playback rate not supported');
    }
  }, [playbackRate, player]);

  const togglePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const pause = () => player.pause();
  const play = () => player.play();

  const setSpeed = (rate: number) => setPlaybackRate(rate);

  return {
    player,
    togglePlayPause,
    pause,
    play,
    isPlaying: player.playing,
    isPaused: !player.playing,
    progress,
    playbackRate,
    setSpeed,
  };
}

