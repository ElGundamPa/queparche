import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  withSequence,
} from 'react-native-reanimated';
import { extractZoneFromLocationString } from '@/lib/zone-utils';

const { width } = Dimensions.get('window');

interface Patch {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: string;
  description: string;
  category: string;
  image: string;
  amenities: string[];
  isFavorite?: boolean;
}

interface PatchCardProps {
  patch: Patch;
  onPress: () => void;
  delay?: number;
}

const PatchCard = ({ patch, onPress, delay = 0 }: PatchCardProps) => {
  const router = useRouter();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const heartScale = useSharedValue(1);
  const shareScale = useSharedValue(1);
  const heartGlow = useSharedValue(0);
  const shareGlow = useSharedValue(0);
  const isPressed = useSharedValue(false);
  
  const handlePatchPress = () => {
    // Navegar a la zona correspondiente
    const zoneKey = extractZoneFromLocationString(patch.location);
    router.push({ pathname: '/zones/[zone]', params: { zone: zoneKey } });
    if (onPress) {
      onPress();
    }
  };

  useEffect(() => {
    // Animación de entrada más rápida y directa
    const timer = setTimeout(() => {
      scale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
      opacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
      translateY.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const handlePressIn = () => {
    isPressed.value = true;
    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    isPressed.value = false;
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handleHeartPress = () => {
    heartScale.value = withSequence(
      withTiming(1.3, { duration: 150, easing: Easing.out(Easing.ease) }),
      withSpring(1, { damping: 15, stiffness: 200 })
    );
    heartGlow.value = withSequence(withTiming(0.25, { duration: 120 }), withTiming(0, { duration: 180 }));
  };

  const handleSharePress = () => {
    shareScale.value = withSequence(
      withTiming(1.2, { duration: 150, easing: Easing.out(Easing.ease) }),
      withSpring(1, { damping: 15, stiffness: 200 })
    );
    shareGlow.value = withSequence(withTiming(0.25, { duration: 120 }), withTiming(0, { duration: 180 }));
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    translateY: translateY.value,
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const shareStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shareScale.value }],
  }));
  const heartGlowStyle = useAnimatedStyle(() => ({ opacity: heartGlow.value }));
  const shareGlowStyle = useAnimatedStyle(() => ({ opacity: shareGlow.value }));

  const getPriceColor = (price: string) => {
    switch (price) {
      case 'Gratis':
        return '#28A745';
      case '$':
        return '#FFC107';
      case '$$':
        return '#FF4444';
      case '$$$':
        return '#6F42C1';
      default:
        return '#6C757D';
    }
  };

  const getPriceBackground = (price: string) => {
    switch (price) {
      case 'Gratis':
        return '#D4EDDA';
      case '$':
        return '#FFF3CD';
      case '$$':
        return '#F8D7DA';
      case '$$$':
        return '#E2D9F3';
      default:
        return '#E9ECEF';
    }
  };

  return (
    <Animated.View style={[styles.container, cardStyle]}>
      <TouchableOpacity
        style={styles.card}
        onPress={handlePatchPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: patch.image }}
            style={styles.image}
            resizeMode="cover"
          />
          
          {/* Overlay Icons */}
          <View style={styles.overlayIcons}>
            <Animated.View style={heartStyle}>
              <Animated.View style={[styles.iconGlow, heartGlowStyle]} />
              <TouchableOpacity
                style={styles.overlayIcon}
                onPress={handleHeartPress}
                activeOpacity={0.7}
              >
                <Text style={styles.overlayIconText}>❤️</Text>
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View style={shareStyle}>
              <Animated.View style={[styles.iconGlow, shareGlowStyle]} />
              <TouchableOpacity
                style={styles.overlayIcon}
                onPress={handleSharePress}
                activeOpacity={0.7}
              >
                <Text style={styles.overlayIconText}>↗️</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Price Badge */}
          <View style={[
            styles.priceBadge,
            { backgroundColor: getPriceBackground(patch.price) }
          ]}>
            <Text style={[
              styles.priceText,
              { color: getPriceColor(patch.price) }
            ]}>
              {patch.price}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {patch.name}
              </Text>
              <Text style={styles.location} numberOfLines={1}>
                {patch.location}
              </Text>
            </View>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>⭐ {patch.rating}</Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {patch.description}
          </Text>

          {/* Amenities */}
          <View style={styles.amenitiesContainer}>
            {patch.amenities.slice(0, 3).map((amenity, index) => (
              <View key={index} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
            {patch.amenities.length > 3 && (
              <View style={styles.amenityTag}>
                <Text style={styles.amenityText}>+{patch.amenities.length - 3}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayIcons: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  overlayIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  overlayIconText: {
    fontSize: 16,
  },
  iconGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 59, 48, 0.25)',
  },
  priceBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '600',
      },
      android: {
        fontFamily: 'sans-serif-medium',
        fontWeight: '600',
      },
    }),
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '700',
      },
      android: {
        fontFamily: 'sans-serif-medium',
        fontWeight: '700',
      },
    }),
  },
  location: {
    fontSize: 14,
    color: '#B3B3B3',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '400',
      },
      android: {
        fontFamily: 'sans-serif',
        fontWeight: '400',
      },
    }),
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF4444',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '600',
      },
      android: {
        fontFamily: 'sans-serif-medium',
        fontWeight: '600',
      },
    }),
  },
  description: {
    fontSize: 14,
    color: '#B3B3B3',
    lineHeight: 20,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '400',
      },
      android: {
        fontFamily: 'sans-serif',
        fontWeight: '400',
      },
    }),
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityTag: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  amenityText: {
    fontSize: 12,
    color: '#B3B3B3',
    fontWeight: '500',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '500',
      },
      android: {
        fontFamily: 'sans-serif-medium',
        fontWeight: '500',
      },
    }),
  },
});

export default PatchCard;
