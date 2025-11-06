import React, { memo, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { mockPlans } from '@/mocks/plans';

interface TrendingTagsProps {
  onTagSelect: (tag: string | null) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface TagChipProps {
  tag: string;
  isSelected: boolean;
  onPress: () => void;
}

const TagChip = memo(function TagChip({ tag, isSelected, onPress }: TagChipProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.94, { damping: 15, stiffness: 250 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 220 });
  };

  return (
    <AnimatedTouchable
      style={[animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <View
        style={[
          styles.chip,
          isSelected ? styles.chipActive : styles.chipInactive,
        ]}
      >
        <Text
          style={[
            styles.chipText,
            isSelected ? styles.chipTextActive : styles.chipTextInactive,
          ]}
        >
          {tag}
        </Text>
      </View>
    </AnimatedTouchable>
  );
});

const TrendingTags = memo(function TrendingTags({ onTagSelect }: TrendingTagsProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Obtener tags más usados
  const popularTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    
    mockPlans.forEach(plan => {
      if (plan.tags) {
        plan.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }, []);

  const handleTagPress = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newTag = selectedTag === tag ? null : tag;
    setSelectedTag(newTag);
    onTagSelect(newTag);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {popularTags.map((tag) => (
        <TagChip
          key={tag}
          tag={tag}
          isSelected={selectedTag === tag}
          onPress={() => handleTagPress(tag)}
        />
      ))}
    </ScrollView>
  );
});

export default TrendingTags;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  chipActive: {
    backgroundColor: '#FF3B30',
  },
  chipInactive: {
    backgroundColor: '#1A1A1A',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextInactive: {
    color: '#BBBBBB',
  },
});

