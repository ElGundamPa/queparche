import { useMemo } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export default function useStaggeredFade(count: number, baseDelay: number = 80, duration: number = 240) {
  const opacities = useMemo(() => Array.from({ length: count }, () => useSharedValue(0)), [count]);

  const styles = opacities.map((sv) =>
    useAnimatedStyle(() => ({ opacity: sv.value }))
  );

  const start = () => {
    opacities.forEach((sv, i) => {
      sv.value = withTiming(1, { duration, easing: (t) => 1 - Math.pow(1 - t, 3) }, baseDelay * i);
    });
  };

  return { styles, start };
}


