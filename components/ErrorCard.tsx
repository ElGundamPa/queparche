import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  FadeIn,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';

import Colors from '@/constants/colors';

interface ErrorCardProps {
  title: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  onDismiss?: () => void;
  dismissText?: string;
}

const ErrorCard: React.FC<ErrorCardProps> = ({
  title,
  message,
  onRetry,
  retryText = 'Intentar de nuevo',
  onDismiss,
  dismissText = 'Cerrar',
}) => {
  const scaleValue = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const shakeValue = useSharedValue(0);

  useEffect(() => {
    // Animación de entrada
    scaleValue.value = withDelay(
      200,
      withSpring(1, {
        damping: 15,
        stiffness: 150,
      })
    );

    // Animación del ícono con shake
    iconScale.value = withDelay(
      400,
      withSequence(
        withSpring(1.1, { damping: 8 }),
        withSpring(1, { damping: 12 })
      )
    );

    // Efecto de shake
    shakeValue.value = withDelay(
      600,
      withSequence(
        withSpring(-5, { damping: 8 }),
        withSpring(5, { damping: 8 }),
        withSpring(-3, { damping: 8 }),
        withSpring(3, { damping: 8 }),
        withSpring(0, { damping: 12 })
      )
    );
  }, []);

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scaleValue.value },
        { translateX: shakeValue.value },
      ],
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: iconScale.value }],
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
            <AlertCircle size={64} color={Colors.light.error} />
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </Animated.View>

        <Animated.View 
          style={styles.buttonContainer}
          entering={FadeInUp.delay(500)}
        >
          {onRetry && (
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={onRetry}
            >
              <RefreshCw size={20} color={Colors.light.white} />
              <Text style={styles.retryButtonText}>{retryText}</Text>
            </TouchableOpacity>
          )}

          {onDismiss && (
            <TouchableOpacity
              style={[styles.button, styles.dismissButton]}
              onPress={onDismiss}
            >
              <Text style={styles.dismissButtonText}>{dismissText}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
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
    marginBottom: 20,
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dismissButton: {
    backgroundColor: Colors.light.lightGray,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
  },
  dismissButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
});

export default ErrorCard;
