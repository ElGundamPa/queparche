import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Plan } from '@/types/plan';

const { width } = Dimensions.get('window');
const cardWidth = 260;
const cardHeight = 266; // Más pequeña que Spotlight

interface TrendingCardProps {
  plan: Plan;
  onPress: () => void;
  index?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const TrendingCard = memo(function TrendingCard({ plan, onPress, index = 0 }: TrendingCardProps) {
  const pressScale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pressScale.value = withSpring(0.97, { damping: 15, stiffness: 250 });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 12, stiffness: 220 });
  };

  const handlePress = () => {
    onPress();
  };

  const imageUrl = plan.images && plan.images.length > 0 ? plan.images[0] : 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800';
  const location = plan.location.zone || plan.location.city || 'Medellín';

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 80).duration(320)}
    >
      <AnimatedTouchable
        style={[styles.container, animatedStyle]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          />
          
          <View style={styles.content}>
            <Text style={styles.name} numberOfLines={2}>
              {plan.name}
            </Text>
            
            {plan.rating > 0 && (
              <View style={styles.ratingRow}>
                <Star size={14} color="#FFD54F" fill="#FFD54F" />
                <Text style={styles.rating}>{plan.rating.toFixed(1)}</Text>
              </View>
            )}
            
            <Text style={styles.location} numberOfLines={1}>
              {location}
            </Text>
            
            {plan.tags && plan.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {plan.tags.slice(0, 2).map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </AnimatedTouchable>
    </Animated.View>
  );
});

export default TrendingCard;

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    height: cardHeight,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#111111',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
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
    height: '60%',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 22,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD54F',
  },
  location: {
    fontSize: 12,
    color: '#A1A1A1',
    marginBottom: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  tagText: {
    fontSize: 10,
    color: '#EAEAEA',
    fontWeight: '500',
  },
});

