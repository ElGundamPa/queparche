import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Image } from 'expo-image';
import { Play, Pause, RotateCcw, Check } from 'lucide-react-native';
import AnimatedButton from './AnimatedButton';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

import Colors from '@/constants/colors';

interface VideoPreviewProps {
  videoUri: string;
  thumbnailUri?: string;
  onRetake?: () => void;
  onConfirm?: () => void;
  showControls?: boolean;
  isProcessing?: boolean;
}

const { width } = Dimensions.get('window');
const PREVIEW_HEIGHT = width * 1.78; // 9:16 aspect ratio

const VideoPreview: React.FC<VideoPreviewProps> = ({
  videoUri,
  thumbnailUri,
  onRetake,
  onConfirm,
  showControls = true,
  isProcessing = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const scaleValue = useSharedValue(1);
  const opacityValue = useSharedValue(1);

  const player = useVideoPlayer(videoUri, (player) => {
    player.loop = true;
    player.muted = true;
  });

  useEffect(() => {
    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
        setCurrentTime(status.currentTimeMillis || 0);
        
        if (status.isPlaying !== isPlaying) {
          setIsPlaying(status.isPlaying);
        }
      }
    });

    return () => subscription?.remove();
  }, [player, isPlaying]);

  const handlePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
      setShowThumbnail(false);
    }
  };

  const handleRetake = () => {
    scaleValue.value = withSpring(0.95, {}, () => {
      scaleValue.value = withSpring(1);
    });
    onRetake?.();
  };

  const handleConfirm = () => {
    opacityValue.value = withTiming(0.8, { duration: 200 });
    onConfirm?.();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
      opacity: opacityValue.value,
    };
  });

  const getTimeString = (millis: number) => {
    const seconds = Math.floor(millis / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.videoContainer}>
        {Platform.OS !== 'web' ? (
          <>
            <VideoView
              player={player}
              style={styles.video}
              allowsFullscreen={false}
              allowsPictureInPicture={false}
            />
            
            {showThumbnail && thumbnailUri && (
              <Animated.View 
                style={styles.thumbnailOverlay}
                entering={FadeIn}
                exiting={FadeOut}
              >
                <Image
                  source={{ uri: thumbnailUri }}
                  style={styles.thumbnail}
                  contentFit="cover"
                />
                <View style={styles.playButtonOverlay}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={handlePlayPause}
                  >
                    <Play size={32} color={Colors.light.white} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </>
        ) : (
          <View style={styles.webFallback}>
            <Image
              source={{ uri: thumbnailUri || videoUri }}
              style={styles.thumbnail}
              contentFit="cover"
            />
            <View style={styles.playButtonOverlay}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayPause}
              >
                <Play size={32} color={Colors.light.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isProcessing && (
          <Animated.View 
            style={styles.processingOverlay}
            entering={FadeIn}
          >
            <View style={styles.processingContent}>
              <Text style={styles.processingText}>Procesando video...</Text>
            </View>
          </Animated.View>
        )}
      </View>

      {showControls && (
        <View style={styles.controls}>
          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>
              {getTimeString(currentTime)} / {getTimeString(duration)}
            </Text>
          </View>

          <View style={styles.controlButtons}>
            <AnimatedButton
              title="Retomar"
              onPress={handleRetake}
              variant="secondary"
              size="medium"
              icon={<RotateCcw size={20} color={Colors.light.text} />}
              style={styles.retakeButton}
            />

            <AnimatedButton
              title="Confirmar"
              onPress={handleConfirm}
              variant="primary"
              size="medium"
              icon={<Check size={20} color={Colors.light.white} />}
              style={styles.confirmButton}
            />
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  videoContainer: {
    width: width - 40,
    height: PREVIEW_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.light.lightGray,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  webFallback: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingContent: {
    alignItems: 'center',
  },
  processingText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '600',
  },
  controls: {
    width: '100%',
    marginTop: 16,
  },
  timeInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timeText: {
    fontSize: 14,
    color: Colors.light.darkGray,
    fontWeight: '500',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  retakeButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});

export default VideoPreview;
