import { useEffect, useRef } from 'react';
import { useVideoPlayer } from 'expo-video';

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

  const togglePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const pause = () => player.pause();
  const play = () => player.play();

  return {
    player,
    togglePlayPause,
    pause,
    play,
    isPlaying: player.playing,
    isPaused: !player.playing,
  };
}

