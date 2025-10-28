import React, { useEffect, useMemo } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: number;
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
  isDestination: boolean; // Nueva propiedad para puntos de destino
  destinationName?: string; // Nombre del destino
}

interface ParticleSphereProps {
  onAnimationStart?: () => void;
}

const ParticleSphere = ({ onAnimationStart }: ParticleSphereProps) => {
  const rotationY = useSharedValue(0);
  const rotationX = useSharedValue(0);
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const destinationOpacity = useSharedValue(0);
  const flashOpacity = useSharedValue(0);
  const flashScale = useSharedValue(0);
  const currentDestination = useSharedValue(0);

  // Configuración optimizada para mejor rendimiento
  const CONFIG = {
    radius: 60, // Ajustado para el nuevo tamaño
    particleCount: 200, // Reducido para mejor rendimiento
    destinationCount: 6, // Menos destinos para fluidez
    rotationSpeed: 0.3, // Velocidad más lenta y meditativa
    pulseSpeed: 0.2,
    flashSpeed: 0.4,
  };

  // Generar partículas optimizadas (memoizado para mejor rendimiento)
  const particles = useMemo((): Particle[] => {
    const particles: Particle[] = [];
    const { radius, particleCount } = CONFIG;

    // Nombres de destinos temáticos
    const destinationNames = [
      'París', 'Tokio', 'Nueva York', 'Londres', 
      'Roma', 'Barcelona', 'Amsterdam', 'Sídney'
    ];

    // Generar partículas con distribución más inteligente
    for (let i = 0; i < particleCount; i++) {
      // Distribución más uniforme en la esfera
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      // Tamaños más variados para mejor efecto visual
      const sizeVariation = Math.random();
      const size = sizeVariation < 0.7 ? 
        Math.random() * 0.8 + 0.4 : // 70% partículas pequeñas
        Math.random() * 1.2 + 0.8;  // 30% partículas más grandes

      particles.push({
        id: i,
        x,
        y,
        z,
        size,
        opacity: Math.random() * 0.4 + 0.6, // Mayor opacidad base
        isDestination: false,
        destinationName: undefined,
      });
    }

    return particles;
  }, []);

  useEffect(() => {
    // Notificar que la animación ha comenzado
    if (onAnimationStart) {
      onAnimationStart();
    }

    // Rotación principal - más lenta y meditativa
    rotationY.value = withRepeat(
      withTiming(360, {
        duration: 30000, // Más lento para efecto planetario
        easing: Easing.linear,
      }),
      -1
    );

    // Rotación secundaria - muy sutil para dinamismo natural
    rotationX.value = withRepeat(
      withTiming(15, {
        duration: 18000, // Más lento y suave
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Pulso global sincronizado - respiración del planeta
    scale.value = withRepeat(
      withTiming(1.08, {
        duration: 8000, // Más lento para efecto meditativo
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Efecto de pulso para los destinos
    pulseScale.value = withRepeat(
      withTiming(1.3, {
        duration: 2000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );

    // Animación optimizada de destinos - más fluida y menos frecuente
    const animateDestinations = () => {
      const randomParticleIndex = Math.floor(Math.random() * CONFIG.particleCount);
      currentDestination.value = randomParticleIndex;
      
      // Resetear valores iniciales
      flashOpacity.value = 0;
      flashScale.value = 0;
      destinationOpacity.value = 0;
      
      // Secuencia de animación más fluida
      flashOpacity.value = withTiming(1, { 
        duration: 200,
        easing: Easing.out(Easing.ease)
      });
      
      flashScale.value = withTiming(1.8, { 
        duration: 400,
        easing: Easing.out(Easing.back(1.1))
      }, () => {
        // Transición suave
        flashScale.value = withTiming(0.2, { 
          duration: 300,
          easing: Easing.inOut(Easing.ease)
        });
        
        flashOpacity.value = withTiming(0.2, { 
          duration: 300,
          easing: Easing.inOut(Easing.ease)
        }, () => {
          // Aparición del destino
          destinationOpacity.value = withTiming(1, { 
            duration: 300,
            easing: Easing.out(Easing.ease)
          }, () => {
            // Mantener visible
            destinationOpacity.value = withTiming(1, { duration: 1000 }, () => {
              // Desvanecer suavemente
              destinationOpacity.value = withTiming(0, { 
                duration: 500,
                easing: Easing.inOut(Easing.ease)
              });
            });
          });
        });
      });
    };

    // Intervalo más espaciado para efecto más meditativo
    const interval = setInterval(animateDestinations, 4000);
    
    return () => clearInterval(interval);
  }, []);

  // Función optimizada para renderizar partículas
  const renderParticle = (particle: Particle) => {
    const isCurrentDestination = useDerivedValue(() => {
      return particle.id === Math.floor(currentDestination.value);
    });

    const animatedStyle = useAnimatedStyle(() => {
      // Cálculos de rotación optimizados
      const cosY = Math.cos((rotationY.value * Math.PI) / 180);
      const sinY = Math.sin((rotationY.value * Math.PI) / 180);
      const cosX = Math.cos((rotationX.value * Math.PI) / 180);
      const sinX = Math.sin((rotationX.value * Math.PI) / 180);

      // Rotación 3D optimizada
      let x = particle.x * cosY - particle.z * sinY;
      let y = particle.y;
      let z = particle.x * sinY + particle.z * cosY;

      const rotatedY = y * cosX - z * sinX;
      const rotatedZ = y * sinX + z * cosX;

      // Aplicar pulso global sincronizado
      x *= scale.value;
      const scaledY = rotatedY * scale.value;
      const scaledZ = rotatedZ * scale.value;

      // Proyección perspectiva mejorada
      const distance = 250;
      const perspective = distance / (distance + scaledZ);
      
      const projectedX = x * perspective;
      const projectedY = scaledY * perspective;

      // Opacidad basada en profundidad con mejor interpolación
      const depthOpacity = interpolate(
        scaledZ,
        [-CONFIG.radius, CONFIG.radius],
        [0.1, 1],
        'clamp'
      );

      // Efectos especiales para destinos
      const isDestination = isCurrentDestination.value;
      const finalScale = isDestination 
        ? perspective * pulseScale.value 
        : perspective;

      const combinedScale = isDestination 
        ? finalScale * (1 + flashScale.value * 0.6)
        : finalScale;

      const combinedOpacity = isDestination 
        ? particle.opacity * depthOpacity * Math.max(destinationOpacity.value, flashOpacity.value * 0.5)
        : particle.opacity * depthOpacity;

      return {
        transform: [
          { translateX: projectedX },
          { translateY: projectedY },
          { scale: combinedScale },
        ],
        opacity: combinedOpacity,
        backgroundColor: isDestination ? '#FF4444' : '#FFFFFF',
        shadowColor: isDestination ? '#FF4444' : '#FFFFFF',
        shadowOpacity: isDestination ? (0.9 + flashOpacity.value * 0.2) : 0.8,
        shadowRadius: particle.size * (isDestination ? (2.5 + flashScale.value * 0.3) : 2),
        elevation: isDestination ? (15 + flashOpacity.value * 5) : 10,
        borderWidth: isDestination ? (1.5 + flashOpacity.value * 0.3) : 0,
        borderColor: isDestination ? '#FF6666' : 'transparent',
      };
    });

    return (
      <Animated.View
        key={particle.id}
        style={[
          {
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            borderRadius: particle.size / 2,
            backgroundColor: '#FFFFFF', // Todas las partículas son blancas por defecto
            shadowColor: '#FFFFFF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9,
            shadowRadius: particle.size * 1.5,
            elevation: 8,
            borderWidth: 0,
            borderColor: 'transparent',
          },
          animatedStyle,
        ]}
      >
        {/* Efecto de destello adicional */}
        {isCurrentDestination.value && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: particle.size * 4,
                height: particle.size * 4,
                borderRadius: (particle.size * 4) / 2,
                backgroundColor: 'rgba(255, 68, 68, 0.4)',
                top: -particle.size * 1.5,
                left: -particle.size * 1.5,
                opacity: flashOpacity.value * 0.8,
                transform: [{ scale: flashScale.value * 0.8 }],
              },
            ]}
          />
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Glow ambiental de fondo */}
      <Animated.View style={styles.ambientGlow} />
      
      {/* Contenedor de partículas optimizado */}
      <View style={styles.particleContainer}>
        {particles.map(renderParticle)}
      </View>
    </View>
  );
};

// Estilos optimizados y responsivos
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: height * 0.12,
    alignSelf: 'center', // Centrado horizontal simple
    width: Math.min(width * 0.5, 200), // Tamaño más moderado
    height: Math.min(width * 0.5, 200),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  ambientGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 125, // Círculo perfecto
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 50,
    elevation: 5,
  },
  particleContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ParticleSphere;
