import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
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

// Función para calcular el score de interacción
const getInteractionScore = (plan: Plan): number => {
  // Prioridad: visits > saves > rating
  // Usamos visits y saves si existen, si no usamos rating como fallback
  const visits = plan.visits || 0;
  const saves = plan.saves || 0;
  const rating = plan.rating || 0;
  
  // Si hay métricas de interacción, las priorizamos
  if (visits > 0 || saves > 0) {
    return (visits * 1.5) + (saves * 2) + (rating * 10);
  }
  
  // Fallback: solo rating
  return rating * 10;
};

const TrendingPlansCarouselComponent = () => {
  const router = useRouter();

  const data = useMemo(() => {
    return mockPlans
      .map(plan => ({
        plan,
        score: getInteractionScore(plan),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ plan }) => plan);
  }, []);

  const renderItem = ({ item, index }: { item: Plan; index: number }) => (
    <TrendingPlanCard
      plan={item}
      index={index}
      onPress={() => router.push(`/plan/${item.id}`)}
    />
  );

  return (
    <FlatList
      horizontal
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => `trending-plan-${item.id}`}
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_WIDTH + ITEM_SPACING}
      pagingEnabled={false}
      decelerationRate="fast"
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={{ width: ITEM_SPACING }} />}
    />
  );
};

interface TrendingPlanCardProps {
  plan: Plan;
  onPress: () => void;
  index: number;
}

const TrendingPlanCard = memo(function TrendingPlanCard({ 
  plan, 
  onPress, 
  index 
}: TrendingPlanCardProps) {
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
        entering={FadeIn.delay(index * 60).duration(320)}
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

          <View style={styles.infoRow}>
            <Text style={styles.rating}>⭐ {plan.rating.toFixed(1)}</Text>
            <Text style={styles.zone} numberOfLines={1}>
              {location}
            </Text>
          </View>
        </View>
      </Animated.View>
    </AnimatedTouchable>
  );
});

export default memo(TrendingPlansCarouselComponent);

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
  infoRow: {
    flexDirection: 'column',
    gap: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
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

