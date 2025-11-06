import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Star, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Plan } from '@/types/plan';
import { scaleTap } from '@/lib/animations';

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 3; // 3 columnas con padding (16px padding cada lado + 12px espaciado entre items)

interface PatchGridItemProps {
  plan: Plan;
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const PatchGridItem = memo(function PatchGridItem({ plan, onPress }: PatchGridItemProps) {
  const isPlaceholder = plan.id.startsWith('placeholder-');
  const tapAnimation = scaleTap(0.96);

  const handlePress = () => {
    // Si es placeholder, no hacer nada
    if (isPlaceholder) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  // Renderizado para placeholder
  if (isPlaceholder) {
    return (
      <Animated.View
        entering={FadeInUp.delay(200).duration(300).easing((t) => t * (2 - t))}
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
  return (
    <Animated.View
      entering={FadeInUp.delay(200).duration(300).easing((t) => t * (2 - t))}
      style={tapAnimation.style}
    >
      <AnimatedTouchable
        style={styles.container}
        onPress={handlePress}
        onPressIn={tapAnimation.onPressIn}
        onPressOut={tapAnimation.onPressOut}
        activeOpacity={0.95}
      >
        <View style={styles.planImageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.planImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
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
            
            {plan.rating > 0 && (
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
  },
  planTagText: {
    fontSize: 9,
    color: '#A1A1A1',
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

