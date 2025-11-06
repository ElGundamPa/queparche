import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Star, MapPin } from 'lucide-react-native';
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
  const tapAnimation = scaleTap(0.96);

  const handlePress = () => {
    // Si es placeholder, no hacer nada
    if (plan.id.startsWith('placeholder-')) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // Extraer zona desde la dirección
  const getZoneFromAddress = (address?: string): string => {
    if (!address) return 'Medellín';
    // Buscar nombres de zonas conocidas en la dirección
    const zones = ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Sabaneta', 'La Estrella', 'Copacabana'];
    for (const zone of zones) {
      if (address.includes(zone)) {
        return zone;
      }
    }
    return 'Medellín';
  };

  const zone = getZoneFromAddress(plan.location.address);
  const imageUrl = plan.images && plan.images.length > 0 ? plan.images[0] : 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800';
  const displayTags = plan.tags?.slice(0, 2) || [];

  return (
    <Animated.View
      entering={FadeInUp.delay(200).duration(300).easing((t) => t * (2 - t))}
      style={tapAnimation.style}
    >
      <AnimatedTouchable
        style={styles.container}
        onPress={handlePress}
        onPressIn={plan.id.startsWith('placeholder-') ? undefined : tapAnimation.onPressIn}
        onPressOut={plan.id.startsWith('placeholder-') ? undefined : tapAnimation.onPressOut}
        activeOpacity={plan.id.startsWith('placeholder-') ? 1 : 0.95}
        disabled={plan.id.startsWith('placeholder-')}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
          {plan.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>⭐</Text>
            </View>
          )}
        </View>
        
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={2}>
            {plan.name}
          </Text>
          
          {plan.rating > 0 && (
            <View style={styles.ratingRow}>
              <Star size={12} color="#FFD54F" fill="#FFD54F" />
              <Text style={styles.rating}>{plan.rating.toFixed(1)}</Text>
            </View>
          )}
          
          <View style={styles.locationRow}>
            <MapPin size={12} color="#A1A1A1" />
            <Text style={styles.location} numberOfLines={1}>
              {zone}
            </Text>
          </View>
          
          {displayTags.length > 0 && (
            <View style={styles.tagsContainer}>
              {displayTags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
          
          {plan.id.startsWith('placeholder-') && (
            <Text style={styles.placeholderText}>Próximamente más parches 🌙</Text>
          )}
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
  placeholderText: {
    fontSize: 10,
    color: '#A1A1A1',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

