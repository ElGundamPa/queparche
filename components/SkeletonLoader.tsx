import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    );
  }, [shimmerValue]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmerValue.value, [0, 1], [0.3, 0.7]);
    return {
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

export const PlanCardSkeleton: React.FC<{ horizontal?: boolean }> = ({ horizontal = true }) => {
  if (horizontal) {
    return (
      <View style={styles.horizontalCardSkeleton}>
        <SkeletonLoader width={140} height={140} borderRadius={0} />
        <View style={styles.horizontalContentSkeleton}>
          <SkeletonLoader width="80%" height={16} borderRadius={4} />
          <SkeletonLoader width="60%" height={12} borderRadius={4} style={{ marginTop: 8 }} />
          <SkeletonLoader width="40%" height={12} borderRadius={4} style={{ marginTop: 8 }} />
          <SkeletonLoader width="50%" height={14} borderRadius={4} style={{ marginTop: 12 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.verticalCardSkeleton}>
      <SkeletonLoader width="100%" height={200} borderRadius={0} />
      <View style={styles.verticalContentSkeleton}>
        <SkeletonLoader width="90%" height={18} borderRadius={4} />
        <SkeletonLoader width="50%" height={12} borderRadius={4} style={{ marginTop: 8 }} />
        <View style={styles.skeletonRow}>
          <SkeletonLoader width="40%" height={12} borderRadius={4} />
          <SkeletonLoader width="30%" height={12} borderRadius={4} />
        </View>
        <SkeletonLoader width="60%" height={16} borderRadius={4} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.light.lightGray,
  },
  horizontalCardSkeleton: {
    width: 280,
    height: 140,
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    marginRight: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  horizontalContentSkeleton: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  verticalCardSkeleton: {
    width: '100%',
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  verticalContentSkeleton: {
    padding: 16,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});

export default SkeletonLoader;