import { useMemo } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export default function useStaggeredFade(count: number, baseDelay: number = 80, duration: number = 260, fromY: number = 12) {
  const opacities = useMemo(() => Array.from({ length: count }, () => useSharedValue(0)), [count]);
  const translateYs = useMemo(() => Array.from({ length: count }, () => useSharedValue(fromY)), [count, fromY]);

  const styles = opacities.map((sv, idx) =>
    useAnimatedStyle(() => ({
      opacity: sv.value,
      transform: [{ translateY: translateYs[idx].value }],
    }))
  );

  const start = () => {
    opacities.forEach((sv, i) => {
      sv.value = withTiming(1, { duration, easing: (t) => 1 - Math.pow(1 - t, 3) });
    });
    translateYs.forEach((tv, i) => {
      tv.value = withTiming(0, { duration, easing: (t) => 1 - Math.pow(1 - t, 3) });
    });
  };

  return { styles, start };
}


