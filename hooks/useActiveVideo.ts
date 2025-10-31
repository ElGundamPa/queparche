import { useEffect, useRef, useState } from 'react';
import { useVideoPlayer, AVPlaybackStatus } from 'expo-video';

interface UseActiveVideoOptions {
  videoUrl: string;
  isActive: boolean;
  autoPlay?: boolean;
  loop?: boolean;
}

const DEBUG = true; // Cambiar a false para producción
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
  // Validar que videoUrl sea un string válido
  if (!videoUrl || typeof videoUrl !== 'string') {
    if (DEBUG) console.error('[useActiveVideo] videoUrl inválido:', videoUrl);
    // Retornar valores por defecto seguros
    return {
      player: null as any,
      togglePlayPause: () => {},
      pause: () => {},
      play: () => {},
      isPlaying: false,
      isPaused: true,
      progress: 0,
      playbackRate: 1,
      setSpeed: () => {},
    };
  }

  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = loop;
    player.muted = true; // Iniciar mutado para evitar audio no deseado
  });

  const wasActiveRef = useRef(false);
  const lastProgressUpdateRef = useRef(0);
  // Validar que videoUrl sea string antes de usar substring
  const videoIdRef = useRef(
    typeof videoUrl === 'string' && videoUrl.length > 0
      ? videoUrl.substring(Math.max(0, videoUrl.length - 20))
      : 'unknown'
  ); // Para debug

  // Control de reproducción basado en visibilidad - más agresivo
  useEffect(() => {
    // SIEMPRE pausar primero si no está activo (incluso si ya estaba pausado)
    if (!isActive) {
      if (wasActiveRef.current || player.playing) {
        if (DEBUG) console.log(`[useActiveVideo] PAUSANDO video ${videoIdRef.current}`);
        player.pause();
        player.muted = true;
      }
      wasActiveRef.current = false;
      return; // Salir temprano si no está activo
    }

    // Solo aquí isActive === true
    if (DEBUG) console.log(`[useActiveVideo] ACTIVANDO video ${videoIdRef.current}`);
    player.muted = false;
    
    // Asegurar que otros videos están pausados primero
    if (autoPlay) {
      // Pausar primero para resetear cualquier estado previo
      player.pause();
      // Usar setTimeout para asegurar que la pausa se aplicó antes de reproducir
      const playTimer = setTimeout(() => {
        if (DEBUG) console.log(`[useActiveVideo] Reproduciendo video ${videoIdRef.current}`);
        player.play();
      }, 50); // Pequeño delay para asegurar pausa previa
      
      wasActiveRef.current = true;
      
      return () => {
        clearTimeout(playTimer);
      };
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

