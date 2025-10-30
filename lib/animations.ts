import { Easing } from 'react-native-reanimated';
import Animated, { withTiming, withSpring, useSharedValue, useAnimatedStyle, interpolate } from 'react-native-reanimated';

export const durations = {
  fast: 180,
  normal: 240,
  slow: 360,
} as const;

export const curves = {
  outExp: Easing.out(Easing.exp),
  ios: Easing.bezier(0.2, 0.8, 0.2, 1),
};

export function fadeIn(duration: number = durations.normal) {
  const opacity = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const start = () => {
    opacity.value = withTiming(1, { duration, easing: curves.outExp });
  };
  return { style, start };
}

export function slideUp(distance: number = 16, duration: number = durations.normal) {
  const t = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(t.value, [0, 1], [0, distance]) }],
    opacity: interpolate(t.value, [0, 1], [1, 0.0]),
  }));
  const start = () => {
    t.value = 1;
    t.value = withTiming(0, { duration, easing: curves.outExp });
  };
  return { style, start };
}

export function scaleTap(scaleDown: number = 0.96) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn = () => { scale.value = withSpring(scaleDown, { damping: 15, stiffness: 250 }); };
  const onPressOut = () => { scale.value = withSpring(1, { damping: 12, stiffness: 220 }); };
  return { style, onPressIn, onPressOut };
}

export function bounceIn() {
  const scale = useSharedValue(0.92);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: interpolate(scale.value, [0.92, 1], [0.8, 1]) }));
  const start = () => { scale.value = withSpring(1, { damping: 10, stiffness: 260 }); };
  return { style, start };
}

export type AnimationBundle = ReturnType<typeof fadeIn> | ReturnType<typeof slideUp> | ReturnType<typeof scaleTap> | ReturnType<typeof bounceIn>;


