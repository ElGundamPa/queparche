import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '@/constants/colors';

interface ProgressBarProps {
  progress: number;
  stage: 'loading' | 'processing' | 'uploading' | 'complete' | 'error';
  message: string;
  showPulse?: boolean;
}

const { width } = Dimensions.get('window');

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  stage,
  message,
  showPulse = true,
}) => {
  const progressWidth = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Animar el progreso
    progressWidth.value = withTiming(progress, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });

    // Efecto de pulso para el indicador
    if (showPulse && stage === 'processing') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        false
      );
    } else {
      pulseScale.value = withSpring(1);
    }

    // Efecto de brillo
    if (stage === 'complete') {
      glowOpacity.value = withTiming(1, { duration: 300 });
    } else if (stage === 'error') {
      glowOpacity.value = withTiming(0.3, { duration: 300 });
    } else {
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [progress, stage, showPulse]);

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  const getStageColor = () => {
    switch (stage) {
      case 'complete':
        return ['#FF4444', '#CC3333'];
      case 'error':
        return ['#FF4444', '#CC3333'];
      case 'processing':
        return ['#FF4444', '#CC3333'];
      default:
        return [Colors.light.primary, Colors.light.secondary];
    }
  };

  const getStageIcon = () => {
    switch (stage) {
      case 'complete':
        return '✨';
      case 'error':
        return '❌';
      case 'processing':
        return '⚡';
      default:
        return '📹';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stageIcon}>{getStageIcon()}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressGlow, glowStyle]} />
          <LinearGradient
            colors={getStageColor() as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            <Animated.View style={[styles.progressBar, progressBarStyle]}>
              <Animated.View style={[styles.progressIndicator, pulseStyle]} />
            </Animated.View>
          </LinearGradient>
        </View>
        
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stageIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.light.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: Colors.light.primary,
    borderRadius: 6,
    opacity: 0.3,
  },
  gradient: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    position: 'relative',
  },
  progressIndicator: {
    position: 'absolute',
    right: -4,
    top: -2,
    width: 12,
    height: 12,
    backgroundColor: Colors.light.white,
    borderRadius: 6,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 12,
    minWidth: 40,
    textAlign: 'right',
  },
});

export default ProgressBar;
