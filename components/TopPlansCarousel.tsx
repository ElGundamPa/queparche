import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { mockPlans } from '@/mocks/plans';
import { Plan } from '@/types/plan';

const CARD_WIDTH = 230;
const CARD_HEIGHT = 165;
const ITEM_SPACING = 12;

const CATEGORY_COLORS = {
  barrio: '#E52D27',
  mirador: '#FF725E',
  rooftop: '#FF3B30',
  restaurante: '#5FBF88',
  cafe: '#CBAA7C',
  bar: '#F39C12',
  club: '#9B59B6',
  parque: '#7ED957',
} as const;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function normalizeCity(city?: string) {
  if (!city) return '';
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const TopPlansCarouselComponent = () => {
  const router = useRouter();

  const data = useMemo(() => {
    return mockPlans
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_WIDTH + ITEM_SPACING}
      pagingEnabled={false}
      decelerationRate="fast"
      contentContainerStyle={styles.listContent}
    >
      {data.map((item, index) => (
        <View key={`top-plan-${item.id}`} style={{ marginRight: index < data.length - 1 ? ITEM_SPACING : 0 }}>
          <TopPlanCard
            plan={item}
            index={index}
            onPress={() => router.push(`/plan/${item.id}`)}
          />
        </View>
      ))}
    </ScrollView>
  );
};

interface TopPlanCardProps {
  plan: Plan;
  onPress: () => void;
  index: number;
}

const TopPlanCard = memo(function TopPlanCard({ plan, onPress, index }: TopPlanCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.97, { damping: 15, stiffness: 250 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 220 });
  };

  const imageUrl = plan.images?.[0];
  const location = plan.location.zone || plan.location.city || 'Medellín';
  const accent = plan.primaryCategory ? CATEGORY_COLORS[plan.primaryCategory] : '#8B0000';

  return (
    <AnimatedTouchable
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.cardWrapper}
    >
      <Animated.View
        entering={FadeIn.delay(index * 80).duration(350)}
        style={[styles.card, animatedStyle]}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', `${accent}AA`, accent]}
          locations={[0, 0.65, 1]}
          style={styles.gradient}
        />

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {plan.name}
          </Text>

          <Text style={styles.rating}>⭐ {plan.rating.toFixed(1)}</Text>
          <Text style={styles.zone} numberOfLines={1}>
            {location}
          </Text>
        </View>
      </Animated.View>
    </AnimatedTouchable>
  );
});

export default memo(TopPlansCarouselComponent);

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#111111',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  },
  content: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    lineHeight: 24,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  zone: {
    fontSize: 12,
    color: '#BBBBBB',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

