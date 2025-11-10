import React, { useEffect, useRef } from 'react';
import { Pressable, ViewStyle, Animated, Platform } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';

interface FABProps {
  onPress?: () => void;
  style?: ViewStyle;
}

export default function FAB({ onPress, style }: FABProps) {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const pulse = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Scale animation on press
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) {
      onPress();
    } else {
      router.push('/create');
    }
  };

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });

  const shadowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.45],
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          right: 16,
          bottom: Math.max(16, bottom + 12),
          transform: [{ scale }, { scale: scaleValue }],
          shadowColor: Colors.light.primary,
          shadowOpacity,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        },
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: Colors.light.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        testID="floating-action-button"
      >
        <Plus size={24} color={Colors.light.white} strokeWidth={2.5} />
      </Pressable>
    </Animated.View>
  );
}