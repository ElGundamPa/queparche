import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, Sparkles } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  FadeIn,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';

import Colors from '@/constants/colors';

interface SuccessCardProps {
  title: string;
  message: string;
  onAction?: () => void;
  actionText?: string;
  showConfetti?: boolean;
}

const SuccessCard: React.FC<SuccessCardProps> = ({
  title,
  message,
  onAction,
  actionText = 'Continuar',
  showConfetti = true,
}) => {
  const scaleValue = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const sparkleRotation = useSharedValue(0);

  useEffect(() => {
    // Animación de entrada
    scaleValue.value = withDelay(
      200,
      withSpring(1, {
        damping: 15,
        stiffness: 150,
      })
    );

    // Animación del ícono
    iconScale.value = withDelay(
      400,
      withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 12 })
      )
    );

    // Animación de rotación de sparkles
    if (showConfetti) {
      sparkleRotation.value = withRepeat(
        withTiming(360, { duration: 2000 }),
        -1,
        false
      );
    }
  }, []);

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: iconScale.value }],
    };
  });

  const sparkleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${sparkleRotation.value}deg` }],
    };
  });

  return (
    <Animated.View
      style={[styles.container, cardStyle]}
      entering={FadeInUp.delay(100)}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Animated.View style={iconStyle}>
            <CheckCircle size={64} color={Colors.light.primary} />
          </Animated.View>
          
          {showConfetti && (
            <Animated.View style={[styles.sparkle, sparkleStyle]}>
              <Sparkles size={24} color="#FFD700" />
            </Animated.View>
          )}
        </View>

        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </Animated.View>

        {onAction && (
          <Animated.View entering={FadeInUp.delay(500)}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onAction}
            >
              <Text style={styles.actionButtonText}>{actionText}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.white,
    borderRadius: 20,
    padding: 24,
    margin: 20,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  sparkle: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: Colors.light.darkGray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
  },
});

export default SuccessCard;
