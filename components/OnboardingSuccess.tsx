import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  runOnJS,
  withRepeat,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Sparkles, Star } from 'lucide-react-native';
import Colors from '@/constants/colors';

const { width, height } = Dimensions.get('window');

interface OnboardingSuccessProps {
  onComplete: () => void;
  userName?: string;
}

export default function OnboardingSuccess({ onComplete, userName }: OnboardingSuccessProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const logoPulse = useSharedValue(1);
  const ringScale = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);

  // Confetti positions (aumentado de 30 a 50)
  const confetti = Array.from({ length: 50 }).map(() => ({
    x: useSharedValue(Math.random() * width),
    y: useSharedValue(-50),
    rotation: useSharedValue(0),
    opacity: useSharedValue(0),
  }));

  useEffect(() => {
    // Animación del círculo principal
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );

    // Animación del anillo pulsante
    ringScale.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(1.15, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1, // Repetir infinitamente
        true
      )
    );

    // Animación del logo con rotación
    logoRotation.value = withDelay(
      300,
      withTiming(360, { duration: 800 })
    );
    logoScale.value = withDelay(
      300,
      withSequence(
        withSpring(1.3, { damping: 8 }),
        withSpring(1, { damping: 10 })
      )
    );

    // Efecto de pulso sutil en el logo
    logoPulse.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1, // Repetir infinitamente
        true
      )
    );

    // Animación del check (aparece después del logo)
    checkOpacity.value = withDelay(900, withTiming(1, { duration: 300 }));
    checkScale.value = withDelay(
      900,
      withSequence(
        withSpring(1.3, { damping: 8 }),
        withSpring(1, { damping: 10 })
      )
    );

    // Animación del texto
    textOpacity.value = withDelay(1100, withTiming(1, { duration: 500 }));
    textTranslateY.value = withDelay(1100, withSpring(0, { damping: 12 }));

    // Animación de confetti mejorada
    confetti.forEach((c, index) => {
      c.opacity.value = withDelay(index * 20, withTiming(1, { duration: 300 }));
      c.y.value = withDelay(
        index * 20,
        withTiming(height + 100, { duration: 2500 })
      );
      c.rotation.value = withTiming(Math.random() * 1080, { duration: 2500 });
    });

    // Navegar después de la animación
    const timer = setTimeout(() => {
      runOnJS(onComplete)();
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value * logoPulse.value },
      { rotate: `${logoRotation.value}deg` }
    ],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: checkOpacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B0B0B', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />

      {/* Confetti */}
      {confetti.map((c, index) => {
        const confettiStyle = useAnimatedStyle(() => ({
          position: 'absolute',
          left: c.x.value,
          top: c.y.value,
          opacity: c.opacity.value,
          transform: [{ rotate: `${c.rotation.value}deg` }],
        }));

        const colors = [Colors.light.primary, Colors.light.secondary, '#FFD93D', '#6BCF7F', '#FF6B9D'];
        const color = colors[index % colors.length];

        return (
          <Animated.View key={index} style={confettiStyle}>
            <Sparkles size={16} color={color} fill={color} />
          </Animated.View>
        );
      })}

      {/* Pulsating Ring */}
      <Animated.View style={[styles.ringOuter, ringStyle]}>
        <LinearGradient
          colors={[Colors.light.primary + '30', Colors.light.secondary + '30']}
          style={styles.ringGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Success Circle with Logo */}
      <Animated.View style={[styles.successCircle, circleStyle]}>
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.secondary]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View style={logoStyle}>
            <Image
              source={require('@/assets/logo/app-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Check mark overlay */}
          <Animated.View style={[styles.checkOverlay, checkStyle]}>
            <Check size={60} color="#FFFFFF" strokeWidth={4} />
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* Success Text */}
      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.title}>¡Todo listo! 🎉</Text>
        <Text style={styles.subtitle}>
          {userName ? `¡Bienvenido ${userName}!` : '¡Bienvenido!'}
        </Text>
        <Text style={styles.description}>
          Tu perfil ha sido configurado exitosamente
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0B0B',
  },
  ringOuter: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    overflow: 'hidden',
  },
  ringGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 115,
  },
  successCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  checkOverlay: {
    position: 'absolute',
  },
  textContainer: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
});
