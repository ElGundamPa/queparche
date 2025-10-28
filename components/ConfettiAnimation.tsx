import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  interpolate,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface ConfettiPieceProps {
  delay: number;
  color: string;
  size: number;
  startX: number;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({
  delay,
  color,
  size,
  startX,
}) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const animate = () => {
      opacity.value = withTiming(1, { duration: 200 });
      
      translateY.value = withDelay(
        delay,
        withTiming(height + 100, {
          duration: 3000,
          easing: Easing.out(Easing.cubic),
        })
      );
      
      translateX.value = withDelay(
        delay,
        withTiming(
          (Math.random() - 0.5) * 200,
          { duration: 3000, easing: Easing.out(Easing.cubic) }
        )
      );
      
      rotate.value = withDelay(
        delay,
        withRepeat(
          withTiming(360, { duration: 1000 }),
          -1,
          false
        )
      );
    };

    animate();
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { rotate: `${rotate.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          backgroundColor: color,
          width: size,
          height: size,
          left: startX,
        },
        animatedStyle,
      ]}
    />
  );
};

interface ConfettiAnimationProps {
  isActive: boolean;
  onComplete?: () => void;
}

const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  isActive,
  onComplete,
}) => {
  const containerOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      containerOpacity.value = withTiming(1, { duration: 300 });
      
      // Llamar onComplete después de la animación
      setTimeout(() => {
        onComplete?.();
      }, 4000);
    } else {
      containerOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isActive, onComplete]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: containerOpacity.value,
    };
  });

  if (!isActive) return null;

  const colors = [
    '#FF4444', '#CC3333', '#FF6666', '#FF7777', '#FF9999',
    '#CC4444', '#FF5555', '#CC2222', '#FF3333', '#CC5555'
  ];

  const confettiPieces = Array.from({ length: 50 }, (_, index) => {
    const delay = index * 50;
    const color = colors[index % colors.length];
    const size = Math.random() * 8 + 4;
    const startX = Math.random() * width;

    return (
      <ConfettiPiece
        key={index}
        delay={delay}
        color={color}
        size={size}
        startX={startX}
      />
    );
  });

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {confettiPieces}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 1000,
  },
  confettiPiece: {
    position: 'absolute',
    borderRadius: 2,
  },
});

export default ConfettiAnimation;
