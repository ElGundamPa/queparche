import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import Colors from '@/constants/colors';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  hapticFeedback = true,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    if (disabled || loading) return;

    // Efecto de rotación para el ícono si está cargando
    if (loading) {
      rotation.value = withSequence(
        withTiming(360, { duration: 1000 }),
        withTiming(0, { duration: 0 })
      );
    }

    // Efecto de pulso
    scale.value = withSequence(
      withSpring(1.05, { damping: 8 }),
      withSpring(1, { damping: 12 })
    );

    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: loading ? `${rotation.value}deg` : '0deg' },
      ],
      opacity: opacity.value,
    };
  });

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? Colors.light.lightGray : Colors.light.primary,
          borderColor: disabled ? Colors.light.lightGray : Colors.light.primary,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? Colors.light.lightGray : Colors.light.white,
          borderColor: disabled ? Colors.light.lightGray : Colors.light.primary,
          borderWidth: 2,
        };
      case 'success':
        return {
          backgroundColor: disabled ? Colors.light.lightGray : '#FF4444',
          borderColor: disabled ? Colors.light.lightGray : '#FF4444',
        };
      case 'error':
        return {
          backgroundColor: disabled ? Colors.light.lightGray : Colors.light.error,
          borderColor: disabled ? Colors.light.lightGray : Colors.light.error,
        };
      default:
        return {
          backgroundColor: disabled ? Colors.light.lightGray : Colors.light.primary,
          borderColor: disabled ? Colors.light.lightGray : Colors.light.primary,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
        };
      case 'medium':
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 12,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 16,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 12,
        };
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.light.darkGray;
    
    switch (variant) {
      case 'secondary':
        return Colors.light.primary;
      default:
        return Colors.light.white;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        style={[
          styles.button,
          getVariantStyles(),
          getSizeStyles(),
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {icon && (
          <Animated.View style={styles.iconContainer}>
            {icon}
          </Animated.View>
        )}
        
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: getTextSize(),
            },
            textStyle,
          ]}
        >
          {loading ? 'Procesando...' : title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AnimatedButton;
