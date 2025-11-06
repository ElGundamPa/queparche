import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { mockPlans } from '@/mocks/plans';
import { Plan } from '@/types/plan';

const CARD_WIDTH = 90;
const CARD_HEIGHT = 120;
const ACCENT_COLOR = '#FF3B30';

interface TrendingCardProps {
  plan: Plan;
  index: number;
  onPress: () => void;
}

const TrendingCard = memo(function TrendingCard({ plan, index, onPress }: TrendingCardProps) {
  return (
    <Animated.View entering={FadeInLeft.delay(index * 50)}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={onPress}
      >
        <Image
          source={{ uri: plan.images?.[0] }}
          style={styles.image}
          contentFit="cover"
        />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🔥 Popular</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.name} numberOfLines={2}>
            {plan.name}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const TrendingStrip = () => {
  const router = useRouter();

  const data = useMemo(() => {
    return [...mockPlans]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
  }, []);

  return (
    <FlatList
      horizontal
      data={data}
      renderItem={({ item, index }) => (
        <TrendingCard
          plan={item}
          index={index}
          onPress={() => router.push(`/plan/${item.id}`)}
        />
      )}
      keyExtractor={(item) => `trend-${item.id}`}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
    />
  );
};

export default memo(TrendingStrip);

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    backgroundColor: '#111111',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 70,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'flex-start',
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 14,
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: ACCENT_COLOR,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

