import React, { useEffect, useRef } from 'react';
import { Pressable, Text, Animated, Platform } from 'react-native';
import { Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}

export function PrimaryButton({ title, onPress, disabled = false }: ButtonProps) {
  const glow = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!disabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 1,
            duration: 1400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(glow, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [glow, disabled]);

  const handlePress = () => {
    if (disabled) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Scale animation on press
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.();
  };

  const shadowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.45],
  });

  return (
    <Animated.View
      style={{
        shadowColor: Colors.light.primary,
        shadowOpacity: disabled ? 0.1 : shadowOpacity,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
        elevation: disabled ? 2 : 6,
        transform: [{ scale: scaleValue }],
      }}
    >
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 16,
          backgroundColor: disabled ? Colors.light.lightGray : Colors.light.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        testID="primary-button"
      >
        <Text
          style={{
            color: disabled ? Colors.light.darkGray : Colors.light.white,
            fontWeight: '600',
            fontSize: 16,
          }}
        >
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function OutlineButton({ title, onPress, disabled = false }: ButtonProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled) return;
    
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    
    // Scale animation on press
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: disabled ? Colors.light.lightGray : Colors.light.primary,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
        }}
        testID="outline-button"
      >
        <Text
          style={{
            color: disabled ? Colors.light.darkGray : Colors.light.primary,
            fontWeight: '600',
            fontSize: 16,
          }}
        >
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}