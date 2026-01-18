import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useUserStore } from '@/hooks/use-user-store';
import { resolveUserName } from '@/lib/userName';
import theme from '@/lib/theme';

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return { greeting: '¡Buenos días', emoji: '☀️' };
  } else if (hour >= 12 && hour < 18) {
    return { greeting: '¡Buenas tardes', emoji: '🌤️' };
  } else if (hour >= 18 && hour < 22) {
    return { greeting: '¡Buenas noches', emoji: '🌙' };
  } else {
    return { greeting: '¡Hola', emoji: '✨' };
  }
};

export const UserGreeting = () => {
  // Try auth store first (used in Profile), then user store (used in Home)
  const authUser = useAuthStore((s) => s.currentUser);
  const userStoreUser = useUserStore((s) => s.user);

  // Use whichever user is available
  const currentUser = authUser || userStoreUser;

  const name = "Parcero";

  const { greeting, emoji } = getTimeBasedGreeting();

  // Animations
  const avatarScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateX = useSharedValue(-20);

  useEffect(() => {
    avatarScale.value = withSequence(
      withSpring(1.1, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );

    textOpacity.value = withDelay(150, withTiming(1, { duration: 500 }));
    textTranslateX.value = withDelay(150, withSpring(0, { damping: 12 }));
  }, []);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateX: textTranslateX.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.avatarContainer, avatarStyle]}>
        <View style={styles.glowContainer}>
          <LinearGradient
            colors={[theme.colors.primary + '40', theme.colors.secondary + '40']}
            style={styles.glowRing}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.defaultAvatar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image
            source={require('@/assets/logo/app-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[textStyle, styles.textContainer]}>
        <Text style={styles.greetingText} numberOfLines={1} ellipsizeMode="tail">
          {greeting} {name}!
        </Text>
        <Text style={styles.subtitleText} numberOfLines={1}>
          ¿Qué parche buscas hoy?
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    maxWidth: '100%',
    paddingRight: 80,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  avatarContainer: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
  },
  glowRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  defaultAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    padding: 2,
    backgroundColor: '#000000',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  greetingText: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitleText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginTop: 1,
  },
});

export default UserGreeting;

