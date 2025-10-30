import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import theme from '@/lib/theme';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import ParticleSphere from './ParticleSphere';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const router = useRouter();
  
  // Animaciones de entrada
  const sphereOpacity = useSharedValue(0);
  const sphereScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(20);
  const blurOpacity = useSharedValue(0);
  
  // Microinteracciones de botones
  const phoneButtonScale = useSharedValue(1);
  const phoneButtonOpacity = useSharedValue(1);
  const registerButtonScale = useSharedValue(1);
  const registerButtonOpacity = useSharedValue(1);

  // Animaciones de entrada coordinadas
  useEffect(() => {
    // 1. Esfera aparece primero (0-800ms)
    sphereOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    sphereScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    
    // 2. Texto aparece después (600-1200ms)
    textOpacity.value = withDelay(600, withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) }));
    textTranslateY.value = withDelay(600, withSpring(0, { damping: 15, stiffness: 100 }));
    
    // 3. Botones aparecen al final (1000-1400ms)
    buttonsOpacity.value = withDelay(1000, withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }));
    buttonsTranslateY.value = withDelay(1000, withSpring(0, { damping: 15, stiffness: 100 }));
    blurOpacity.value = withDelay(400, withTiming(1, { duration: 500, easing: Easing.out(Easing.exp) }));
  }, []);

  const handlePhoneLogin = () => {
    // Microinteracción del botón principal (sin withSequence)
    phoneButtonScale.value = withTiming(0.95, { duration: 100, easing: Easing.out(Easing.ease) }, () => {
      phoneButtonScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    });
    phoneButtonOpacity.value = withTiming(0.8, { duration: 100 }, () => {
      phoneButtonOpacity.value = withTiming(1, { duration: 200 });
    });

    // Navegar después de la animación
    setTimeout(() => {
      router.push('/(auth)/login-form');
    }, 150);
  };

  const handleRegister = () => {
    // Microinteracción del botón secundario (sin withSequence)
    registerButtonScale.value = withTiming(0.95, { duration: 100, easing: Easing.out(Easing.ease) }, () => {
      registerButtonScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    });
    registerButtonOpacity.value = withTiming(0.8, { duration: 100 }, () => {
      registerButtonOpacity.value = withTiming(1, { duration: 200 });
    });

    // Navegar después de la animación
    setTimeout(() => {
      router.push('/(auth)/register-form');
    }, 150);
  };

  // Estilos animados para la esfera
  const sphereStyle = useAnimatedStyle(() => ({
    opacity: sphereOpacity.value,
    transform: [{ scale: sphereScale.value }],
  }));

  // Estilos animados para el texto
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  // Estilos animados para los botones
  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  // Microinteracciones de botones
  const phoneButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: phoneButtonScale.value }],
    opacity: phoneButtonOpacity.value,
  }));

  const registerButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: registerButtonScale.value }],
    opacity: registerButtonOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Esfera de partículas con animación */}
      <Animated.View style={sphereStyle}>
        <ParticleSphere onAnimationStart={() => {
          // Sincronizar con la animación de la esfera
          console.log('Esfera iniciada');
        }} />
      </Animated.View>

      {/* Contenido principal */}
      <View style={styles.content}>
        {/* Texto de bienvenida con animación (fondo limpio, sin overlays) */}
        <Animated.View style={[styles.textContainer, textStyle]}>
          <View style={styles.titleContainer}>
            <Text style={styles.welcomeText}>Que Parche</Text>
            <Image
              source={require('../assets/logo/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.subtitleText}>Tu nueva experiencia te espera</Text>
        </Animated.View>

        {/* Botones de acción con animación */}
        <Animated.View style={[styles.buttonContainer, buttonsStyle]}>
          <Animated.View style={phoneButtonStyle}>
            <TouchableOpacity
              style={styles.phoneButton}
              onPress={handlePhoneLogin}
              activeOpacity={0.9}
            >
              <Text style={styles.phoneButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={registerButtonStyle}>
            <TouchableOpacity
              style={styles.appleButton}
              onPress={handleRegister}
              activeOpacity={0.9}
            >
              <Text style={styles.appleButtonText}>Registrarse</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Texto legal */}
        <View style={styles.legalContainer}>
          <Text style={styles.legalText}>
            Al continuar, aceptas nuestros{' '}
            <Text style={styles.linkText}>Términos de Servicio</Text> y{' '}
            <Text style={styles.linkText}>Política de Privacidad</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.horizontal,
    width: '100%',
    zIndex: 2,
    // Mejor centrado visual
    paddingTop: height * 0.15, // Espacio superior para la esfera
    paddingBottom: height * 0.1, // Espacio inferior para el texto legal
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
    marginTop: 120, // Ajustado para mejor centrado con la esfera
    position: 'relative',
  },
  // Eliminado blur detrás del título para fondo completamente limpio
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 16,
    height: 16,
    marginLeft: 4,
    tintColor: theme.colors.primary,
    shadowColor: 'rgba(255, 68, 68, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 40,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: -0.5,
    // Glow más sutil
    textShadowColor: 'rgba(255, 68, 68, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    // Sombra sutil para profundidad
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '700',
      },
      android: {
        fontFamily: 'sans-serif-medium',
        fontWeight: '700',
      },
    }),
  },
  subtitleText: {
    fontSize: 18,
    color: theme.colors.textSecondary, // Mejor contraste para legibilidad
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.2,
    fontStyle: 'italic',
    // Sombra sutil para mejor legibilidad
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '400',
      },
      android: {
        fontFamily: 'sans-serif',
        fontWeight: '400',
      },
    }),
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  phoneButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    // Glow más sutil
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    // Sombra adicional para profundidad
    borderWidth: 0,
    borderColor: 'transparent',
  },
  phoneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    letterSpacing: 0.2,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '600',
      },
      android: {
        fontFamily: 'sans-serif-medium',
        fontWeight: '600',
      },
    }),
  },
  appleButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    // Sombra sutil para el borde
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    letterSpacing: 0.2,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '600',
      },
      android: {
        fontFamily: 'sans-serif-medium',
        fontWeight: '600',
      },
    }),
  },
  legalContainer: {
    position: 'absolute',
    bottom: 50,
    left: 32,
    right: 32,
  },
  legalText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.1,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '400',
      },
      android: {
        fontFamily: 'sans-serif',
        fontWeight: '400',
      },
    }),
  },
  linkText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '600',
      },
      android: {
        fontFamily: 'sans-serif-medium',
        fontWeight: '600',
      },
    }),
  },
});

export default LoginScreen;