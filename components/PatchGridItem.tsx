import React, { memo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ColorValue } from 'react-native';
import { Image } from 'expo-image';
import { Star, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Plan } from '@/types/plan';

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 3; // 3 columnas con padding (16px padding cada lado + 12px espaciado entre items)

const CATEGORY_COLORS = {
  barrio: "#E52D27",
  mirador: "#FF725E",
  rooftop: "#FF3B30",
  restaurante: "#5FBF88",
  cafe: "#CBAA7C",
  bar: "#F39C12",
  club: "#9B59B6",
  parque: "#7ED957",
} as const;

interface PatchGridItemProps {
  plan: Plan;
  onPress: () => void;
  index?: number; // Índice para animación escalonada
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const PatchGridItem = memo(function PatchGridItem({ plan, onPress, index = 0 }: PatchGridItemProps) {
  const isPlaceholder = plan.id.startsWith('placeholder-');
  const hasAnimated = useRef(false);
  
  // Animación de presión estilo Apple para planes reales
  const pressScale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.35);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
    shadowOpacity: shadowOpacity.value,
  }));

  const handlePressIn = () => {
    if (isPlaceholder) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pressScale.value = withSpring(0.96, { damping: 15, stiffness: 250 });
    shadowOpacity.value = withSpring(0.55, { damping: 15, stiffness: 250 });
  };

  const handlePressOut = () => {
    if (isPlaceholder) return;
    pressScale.value = withSpring(1, { damping: 12, stiffness: 220 });
    shadowOpacity.value = withSpring(0.35, { damping: 12, stiffness: 220 });
  };

  const handlePress = () => {
    // Si es placeholder, no hacer nada
    if (isPlaceholder) {
      return;
    }
    onPress();
  };

  // Extraer zona desde la dirección o location
  const getZoneFromPlan = (): string => {
    if (plan.location.zone) return plan.location.zone;
    if (plan.location.city) return plan.location.city;
    if (plan.location.address) {
      const zones = ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Sabaneta', 'La Estrella', 'Copacabana'];
      for (const zone of zones) {
        if (plan.location.address.includes(zone)) {
          return zone;
        }
      }
    }
    return 'Medellín';
  };

  const zone = getZoneFromPlan();
  const imageUrl = plan.images && plan.images.length > 0 ? plan.images[0] : 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800';
  const displayTags = plan.tags?.slice(0, 2) || [];
  const accent = plan.primaryCategory ? CATEGORY_COLORS[plan.primaryCategory] : '#8B0000';
  const gradientColors: [ColorValue, ColorValue, ColorValue] = ['rgba(0,0,0,0)', `${accent}AA`, accent];
  const capacityText =
    typeof plan.currentPeople === 'number' && typeof plan.maxPeople === 'number'
      ? `${plan.currentPeople}/${plan.maxPeople}`
      : undefined;
  const priceText = plan.priceAvg;

  // Renderizado para placeholder
  if (isPlaceholder) {
    const shouldAnimate = !hasAnimated.current;
    if (shouldAnimate) hasAnimated.current = true;
    
    return (
      <Animated.View
        entering={shouldAnimate ? FadeInUp.delay(index * 65).duration(320).easing((t) => t * (2 - t)) : undefined}
      >
        <View style={styles.container}>
          <View style={styles.placeholderImageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.placeholderImage}
              contentFit="cover"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
              style={styles.placeholderGradient}
            />
            <View style={styles.placeholderContent}>
              <Text style={styles.placeholderTitle} numberOfLines={2}>
                {plan.name}
              </Text>
              <Text style={styles.placeholderSubtitle}>
                Próximamente más parches 🌙
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }

  // Renderizado para plan normal
  const shouldAnimate = !hasAnimated.current;
  if (shouldAnimate) hasAnimated.current = true;
  
  return (
    <Animated.View
      entering={shouldAnimate ? FadeInUp.delay(index * 65).duration(320).easing(Easing.out(Easing.quad)) : undefined}
    >
      <AnimatedTouchable
        style={[styles.container, animatedStyle]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.planImageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.planImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={gradientColors}
            style={styles.planGradient}
          />
          {plan.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>⭐</Text>
            </View>
          )}
          
          <View style={styles.planContent}>
            <Text style={styles.planName} numberOfLines={2}>
              {plan.name}
            </Text>

            <View style={styles.planMetaRow}>
              <Text style={styles.planMetaText} numberOfLines={1}>
                📍 {zone}
              </Text>
              {capacityText && (
                <Text style={styles.planMetaText} numberOfLines={1}>
                  👥 {capacityText}
                </Text>
              )}
              {priceText && (
                <Text style={styles.planMetaText} numberOfLines={1}>
                  🎫 {priceText}
                </Text>
              )}
            </View>
            
            {typeof plan.rating === 'number' && plan.rating > 0 && (
              <View style={styles.planRatingRow}>
                <Star size={12} color="#FFD54F" fill="#FFD54F" />
                <Text style={styles.planRating}>{plan.rating.toFixed(1)}</Text>
              </View>
            )}
            
            <View style={styles.planLocationRow}>
              <MapPin size={12} color="#A1A1A1" />
              <Text style={styles.planLocation} numberOfLines={1}>
                {zone}
              </Text>
            </View>
            
            {displayTags.length > 0 && (
              <View style={styles.planTagsContainer}>
                {displayTags.map((tag, index) => (
                  <View key={index} style={styles.planTag}>
                    <Text style={styles.planTagText}>{tag}</Text>
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

export default PatchGridItem;

const styles = StyleSheet.create({
  container: {
    width: itemWidth,
    height: 230, // Altura fija total
    backgroundColor: '#121212',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: itemWidth, // Imagen cuadrada
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  // Estilos para planes reales con imagen de fondo completa
  planImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  planImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  planGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  planContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    paddingTop: 24, // Espacio superior para gradiente
  },
  planName: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    color: '#FFFFFF',
    marginBottom: 6,
    minHeight: 36,
  },
  planMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  planMetaText: {
    fontSize: 11,
    color: '#DADADA',
  },
  planRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  planRating: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFD54F',
  },
  planLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  planLocation: {
    fontSize: 11,
    color: '#A1A1A1',
    flex: 1,
  },
  planTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  planTag: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  planTagText: {
    fontSize: 9,
    color: '#EAEAEA',
    fontWeight: '500',
  },
  premiumBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  premiumText: {
    fontSize: 10,
  },
  content: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    color: '#FFFFFF',
    marginBottom: 6,
    minHeight: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  rating: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFD54F',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  location: {
    fontSize: 11,
    color: '#A1A1A1',
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
  },
  tagText: {
    fontSize: 9,
    color: '#A1A1A1',
    fontWeight: '500',
  },
  placeholderImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
  },
  placeholderGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  placeholderContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  placeholderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  placeholderSubtitle: {
    fontSize: 11,
    color: '#A1A1A1',
    textAlign: 'center',
  },
});

