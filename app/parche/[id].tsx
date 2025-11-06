/**
 * @deprecated Esta pantalla está deprecada.
 * 
 * TODAS las navegaciones de parches ahora deben ir a: /plan/[id]
 * 
 * Esta ruta se mantiene solo para compatibilidad temporal.
 * Por favor, actualiza todas las navegaciones para usar /plan/[id] en su lugar.
 * 
 * El diseño oficial de detalle de parches está en: app/plan/[id].tsx
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft, Heart, Share2, Bookmark, MapPin, Star, Navigation, MessageCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import theme from '@/lib/theme';
import { mockPatches, Patch } from '@/mocks/patches';
import { usePlansStore } from '@/hooks/use-plans-store';
import { Event } from '@/types/plan';
import FallbackScreen from '@/components/FallbackScreen';

const { width, height } = Dimensions.get('window');

// Función para convertir un Event a Patch
const eventToPatch = (event: Event): Patch => {
  // Formatear precio: convertir número a formato string similar a los parches
  let priceString = 'Gratis';
  if (event.price && event.price > 0) {
    if (event.price < 30000) {
      priceString = '$';
    } else if (event.price < 80000) {
      priceString = '$$';
    } else {
      priceString = '$$$';
    }
  }
  
  return {
    id: event.id,
    name: event.title,
    location: event.location.address || 'Medellín',
    rating: event.rating || 4.5,
    price: priceString,
    description: event.description,
    category: event.category,
    image: event.image,
    images: [event.image],
    amenities: event.tags || [],
    latitude: event.location.latitude,
    longitude: event.location.longitude,
  };
};

export default function ParcheDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { events } = usePlansStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Buscar primero en parches (los parches tienen prioridad)
  // Si no se encuentra, buscar en eventos (solo si el ID tiene prefijo "event-")
  let patch: Patch | undefined = mockPatches.find((p) => p.id === id);
  
  // Solo buscar en eventos si no se encontró un parche Y el ID tiene el prefijo "event-"
  if (!patch && id.startsWith('event-')) {
    const event = events.find((e) => e.id === id);
    if (event) {
      patch = eventToPatch(event);
    }
  }

  // Si no existe el parche
  if (!id) {
    return (
      <FallbackScreen
        title="ID de parche inválido"
        message="No se pudo identificar el parche solicitado."
        showBackButton={true}
        showHomeButton={true}
      />
    );
  }

  if (!patch) {
    return (
      <FallbackScreen
        title="Plan no encontrado"
        message="Este plan no existe o ha sido eliminado."
        showBackButton={true}
        showHomeButton={true}
        onRetry={() => {
          router.replace('/(tabs)');
        }}
      />
    );
  }

  // Imágenes para el carrusel
  const images = patch.images || [patch.image];

  const handleHeartPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLiked(!isLiked);
  };

  const handleSharePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implementar compartir
  };

  const handleSavePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSaved(!isSaved);
  };

  const handleOpenMaps = () => {
    if (patch.latitude && patch.longitude) {
      const label = encodeURIComponent(patch.name);
      const url = Platform.select({
        ios: `maps:0,0?q=${label}@${patch.latitude},${patch.longitude}`,
        android: `geo:0,0?q=${patch.latitude},${patch.longitude}(${label})`,
      });
      if (url) {
        Linking.openURL(url).catch((err) => {
          console.error('Error opening maps:', err);
        });
      }
    }
  };

  const handleJoinPlan = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // TODO: Implementar unirse al plan
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, string> = {
      'WiFi': '📶',
      'Reservas': '📋',
      'Terraza': '🏖️',
      'Música en vivo': '🎵',
      'Vista panorámica': '🌆',
      'Aire libre': '🌳',
      'Familiar': '👨‍👩‍👧‍👦',
      'Naturaleza': '🌿',
      'Exposiciones': '🖼️',
      'Café': '☕',
      'Cultura': '🎨',
      'Ecológico': '♻️',
      'Guía': '🗺️',
      'DJ': '🎧',
      'Cocteles': '🍹',
      'Música': '🎤',
      'Parking': '🅿️',
      'Restaurantes': '🍽️',
    };
    return iconMap[amenity] || '✨';
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: patch.name,
          headerShown: false 
        }} 
      />
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Hero Image with Carousel */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: images[currentImageIndex] }}
            style={styles.heroImage}
            contentFit="cover"
          />
          
          {/* Gradient Overlay */}
          <View style={styles.gradientOverlay} />
          
          {/* Header Icons */}
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ArrowLeft size={22} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            
            <View style={styles.headerRightIcons}>
              <TouchableOpacity
                style={styles.floatingButton}
                onPress={handleSavePress}
                activeOpacity={0.7}
              >
                <Bookmark
                  size={22}
                  color={isSaved ? theme.colors.primary : theme.colors.textPrimary}
                  fill={isSaved ? theme.colors.primary : 'none'}
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.floatingButton}
                onPress={handleSharePress}
                activeOpacity={0.7}
              >
                <Share2 size={22} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Patch Info Overlay */}
          <View style={styles.patchInfoOverlay}>
            <View style={styles.patchNameContainer}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{patch.category}</Text>
              </View>
              <Text style={styles.patchName}>{patch.name}</Text>
              {patch.location && (
                <View style={styles.locationRow}>
                  <MapPin size={16} color={theme.colors.textPrimary} />
                  <Text style={styles.locationText}>{patch.location}</Text>
                </View>
              )}
              <View style={styles.ratingRow}>
                <Star size={16} color={theme.colors.primary} fill={theme.colors.primary} />
                <Text style={styles.ratingText}>{patch.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>(12k reviews)</Text>
              </View>
            </View>
          </View>

          {/* Image Carousel Indicator */}
          {images.length > 1 && (
            <View style={styles.carouselIndicator}>
              {images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dot,
                    index === currentImageIndex && styles.dotActive
                  ]}
                  onPress={() => setCurrentImageIndex(index)}
                />
              ))}
            </View>
          )}

          {/* Side Action Buttons - Vertical */}
          <View style={styles.sideActions}>
            <TouchableOpacity
              style={styles.sideActionButton}
              onPress={handleHeartPress}
              activeOpacity={0.7}
            >
              <Heart
                size={22}
                color={isLiked ? theme.colors.primary : theme.colors.textPrimary}
                fill={isLiked ? theme.colors.primary : 'none'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.sideActionButton}
              onPress={() => {
                // TODO: Implementar comentarios
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              activeOpacity={0.7}
            >
              <MessageCircle
                size={22}
                color={theme.colors.textPrimary}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.sideActionButton}
              onPress={handleSavePress}
              activeOpacity={0.7}
            >
              <Bookmark
                size={22}
                color={isSaved ? theme.colors.primary : theme.colors.textPrimary}
                fill={isSaved ? theme.colors.primary : 'none'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.sideActionButton}
              onPress={handleSharePress}
              activeOpacity={0.7}
            >
              <Share2
                size={22}
                color={theme.colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Card */}
        <View style={styles.content}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Popular Amenities */}
            {patch.amenities && patch.amenities.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Amenidades</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.amenitiesScrollContainer}
                >
                  {patch.amenities.map((amenity, index) => (
                    <View key={index} style={styles.amenityItem}>
                      <Text style={styles.amenityIcon}>{getAmenityIcon(amenity)}</Text>
                      <Text style={styles.amenityText} numberOfLines={1}>{amenity}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <View style={styles.descriptionContainer}>
                <Text style={styles.description}>
                  {showFullDescription 
                    ? patch.description 
                    : patch.description.length > 150 
                      ? `${patch.description.substring(0, 150)}...` 
                      : patch.description
                  }
                </Text>
                {patch.description.length > 150 && (
                  <TouchableOpacity 
                    onPress={() => setShowFullDescription(!showFullDescription)}
                    style={styles.seeMoreContainer}
                  >
                    <Text style={styles.seeMoreText}>
                      {showFullDescription ? 'Ver menos' : 'Ver más...'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceValue}>
              {patch.price === 'Gratis' ? (
                <Text style={styles.priceAmount}>Gratis</Text>
              ) : (
                <>
                  <Text style={styles.priceAmount}>{patch.price}</Text>
                </>
              )}
            </Text>
          </View>
          
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleOpenMaps}
              activeOpacity={0.9}
            >
              <Navigation size={18} color={theme.colors.textPrimary} />
              <Text style={styles.secondaryButtonText}>¡Llévame allá!</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleJoinPlan}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>Unirme al plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  heroContainer: {
    width: '100%',
    height: height * 0.6,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerIcons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
    ...theme.shadows.button,
  },
  headerRightIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  floatingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
    ...theme.shadows.button,
  },
  patchInfoOverlay: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  patchNameContainer: {
    gap: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radii.md,
    marginBottom: 8,
  },
  categoryText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.background,
  },
  patchName: {
    ...theme.typography.h1,
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    lineHeight: 34,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  locationText: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textPrimary,
    opacity: 0.95,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  ratingText: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  reviewCount: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    opacity: 0.8,
  },
  carouselIndicator: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    backgroundColor: theme.colors.textPrimary,
    width: 24,
  },
  sideActions: {
    position: 'absolute',
    right: 20,
    bottom: 140,
    gap: 16,
    alignItems: 'center',
  },
  sideActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
    ...theme.shadows.button,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    zIndex: 1,
    ...theme.shadows.card,
  },
  scrollContent: {
    padding: theme.spacing.horizontal,
    paddingBottom: 120,
  },
  section: {
    marginBottom: theme.spacing.section,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  amenitiesScrollContainer: {
    paddingRight: theme.spacing.horizontal,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    gap: 6,
    ...theme.shadows.card,
  },
  amenityIcon: {
    fontSize: 22,
  },
  amenityText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  descriptionContainer: {
    position: 'relative',
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  seeMoreContainer: {
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  seeMoreText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.horizontal,
    paddingVertical: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.card,
  },
  priceContainer: {
    marginBottom: theme.spacing.md,
  },
  priceValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    ...theme.typography.h1,
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.button,
  },
  primaryButtonText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.background,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.button,
  },
  secondaryButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});

