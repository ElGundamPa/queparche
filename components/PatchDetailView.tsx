import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { ArrowLeft, Heart, Share2, Bookmark, MapPin, Star, Navigation, MessageCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import theme from '@/lib/theme';
import { Patch } from '@/mocks/patches';

const { width, height } = Dimensions.get('window');

interface PatchDetailViewProps {
  patch: Patch;
  onBack?: () => void;
  showBackButton?: boolean;
}

export default function PatchDetailView({ patch, onBack, showBackButton = true }: PatchDetailViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Imágenes para el carrusel
  const images = patch.images || [patch.image];

  const handleHeartPress = () => {
    setIsLiked(!isLiked);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSavePress = () => {
    setIsSaved(!isSaved);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSharePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implementar compartir
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

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      'Restaurantes': '🍽️',
      'Rooftops': '🌃',
      'Planes Gratis': '🆓',
      'Cultura': '🎭',
      'Naturaleza': '🌳',
      'Vida Nocturna': '🍻',
      'Shopping': '🛍️',
    };
    return iconMap[category] || '✨';
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, string> = {
      'WiFi': '📶',
      'Reservas': '📅',
      'Terraza': '🌆',
      'Música en vivo': '🎵',
      'Vista panorámica': '🌇',
      'Aire libre': '🌳',
      'Familiar': '👨‍👩‍👧‍👦',
      'Exposiciones': '🖼️',
      'Café': '☕',
      'Ecológico': '♻️',
      'Guía': '🗺️',
      'DJ': '🎧',
      'Cocteles': '🍹',
      'Música': '🎶',
      'Parking': '🅿️',
      'Restaurantes': '🍽️',
    };
    return iconMap[amenity] || '✨';
  };

  const descriptionToShow = showFullDescription 
    ? patch.description 
    : patch.description.substring(0, 150) + (patch.description.length > 150 ? '...' : '');

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Hero Image with Carousel */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: images[currentImageIndex] }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <View style={styles.heroOverlay} />
          
          {/* Back Button */}
          {showBackButton && onBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <ArrowLeft size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          )}

          {/* Image Indicators */}
          {images.length > 1 && (
            <View style={styles.imageIndicators}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentImageIndex && styles.indicatorActive,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryIcon}>{getCategoryIcon(patch.category)}</Text>
            <Text style={styles.categoryText}>{patch.category}</Text>
          </View>

          {/* Title and Location */}
          <View style={styles.heroContent}>
            <Text style={styles.patchName}>{patch.name}</Text>
            {patch.location && (
              <View style={styles.locationRow}>
                <MapPin size={16} color={theme.colors.textSecondary} />
                <Text style={styles.locationText}>{patch.location}</Text>
              </View>
            )}
            <View style={styles.ratingRow}>
              <Star size={16} color={theme.colors.premium} fill={theme.colors.premium} />
              <Text style={styles.ratingText}>{patch.rating.toFixed(1)}</Text>
              <Text style={styles.reviewsText}>(12k reviews)</Text>
              {patch.price && (
                <Text style={styles.priceText}> · {patch.price}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Side Action Buttons */}
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

        {/* Content */}
        <View style={styles.content}>
          {/* Amenities */}
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
            <Text style={styles.descriptionText}>{descriptionToShow}</Text>
            {patch.description.length > 150 && (
              <TouchableOpacity
                onPress={() => setShowFullDescription(!showFullDescription)}
                style={styles.readMoreButton}
              >
                <Text style={styles.readMoreText}>
                  {showFullDescription ? 'Leer menos' : 'Leer más'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          {patch.latitude && patch.longitude && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleOpenMaps}
              activeOpacity={0.8}
            >
              <Navigation size={18} color={theme.colors.textPrimary} />
              <Text style={styles.secondaryButtonText}>¡Llévame allá!</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleJoinPlan}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Unirme al plan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0E0E0E', // Fondo según especificación
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  contentWrapper: {
    paddingBottom: 20,
  },
  heroContainer: {
    width: width,
    height: height * 0.5,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  imageIndicators: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    gap: 6,
    zIndex: 10,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  indicatorActive: {
    backgroundColor: theme.colors.primary,
    width: 20,
  },
  categoryBadge: {
    position: 'absolute',
    top: 100,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  heroContent: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  patchName: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    marginLeft: 4,
  },
  reviewsText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  priceText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '700',
    marginLeft: 4,
  },
  sideActions: {
    position: 'absolute',
    right: 16,
    top: height * 0.5 - 120,
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
  },
  sideActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  amenitiesScrollContainer: {
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginRight: 12,
    gap: 8,
  },
  amenityIcon: {
    fontSize: 22,
  },
  amenityText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  descriptionText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  readMoreButton: {
    marginTop: 8,
  },
  readMoreText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...theme.typography.button,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 8,
  },
  secondaryButtonText: {
    ...theme.typography.button,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
});

