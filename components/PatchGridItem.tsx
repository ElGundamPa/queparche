import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Star, MapPin } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Plan } from '@/types/plan';

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 3; // 3 columnas con padding (16px padding cada lado + 12px espaciado entre items)

interface PatchGridItemProps {
  plan: Plan;
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function PatchGridItem({ plan, onPress }: PatchGridItemProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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

  return (
    <AnimatedTouchable
      style={[styles.container, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
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
            <Star size={12} color="#FFD700" fill="#FFD700" />
            <Text style={styles.rating}>{plan.rating.toFixed(1)}</Text>
          </View>
        )}
        
        <View style={styles.locationRow}>
          <MapPin size={10} color="#999999" />
          <Text style={styles.location} numberOfLines={1}>
            {zone}
          </Text>
        </View>
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: itemWidth,
    backgroundColor: '#111111',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: itemWidth, // Hace la imagen cuadrada
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
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
    padding: 10,
    minHeight: 70, // Asegura altura mínima consistente
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 18,
    minHeight: 36, // 2 líneas aprox
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
    color: '#FFD700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  location: {
    fontSize: 10,
    color: '#999999',
    flex: 1,
  },
});

