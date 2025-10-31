import { useEffect, useRef, useState } from 'react';
import { useVideoPlayer, AVPlaybackStatus } from 'expo-video';

interface UseActiveVideoOptions {
  videoUrl: string;
  isActive: boolean;
  autoPlay?: boolean;
  loop?: boolean;
}

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

  // Control de reproducción basado en visibilidad
  useEffect(() => {
    if (isActive && !wasActiveRef.current) {
      // Video acaba de volverse activo
      player.muted = false;
      if (autoPlay) {
        player.play();
      }
      wasActiveRef.current = true;
    } else if (!isActive && wasActiveRef.current) {
      // Video acaba de dejar de ser activo
      player.pause();
      player.muted = true;
      wasActiveRef.current = false;
    }
  }, [isActive, player, autoPlay]);

  // Listener para actualizar progreso
  useEffect(() => {
    const subscription = player.addListener('playbackStatusUpdate', (status: AVPlaybackStatus) => {
      if (status.isLoaded && status.durationMillis) {
        const newProgress = status.currentTimeMillis / status.durationMillis;
        setProgress(newProgress);
      }
    });

    return () => subscription?.remove();
  }, [player]);

  // Control de velocidad de reproducción
  useEffect(() => {
    // Intentar cambiar rate (puede no estar soportado en todas las plataformas)
    try {
      // @ts-ignore - playbackRate puede no estar en tipos
      if (player.playbackRate !== undefined) {
        // @ts-ignore
        player.playbackRate = playbackRate;
      }
    } catch (e) {
      // Rate no soportado en esta plataforma
      console.log('Playback rate not supported');
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

