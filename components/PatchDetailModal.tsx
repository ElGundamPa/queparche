import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  withSequence,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

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
  latitude?: number;
  longitude?: number;
  images?: string[]; // Múltiples imágenes para el carrusel
}

interface PatchDetailModalProps {
  patch: Patch;
  onClose: () => void;
}

const PatchDetailModal = ({ patch, onClose }: PatchDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heartScale = useSharedValue(1);
  const shareScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);
  const scrollY = useSharedValue(0);

  // Imágenes de ejemplo para el carrusel
  const images = patch.images || [
    patch.image,
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
    'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
  ];

  const handleHeartPress = () => {
    heartScale.value = withSequence(
      withTiming(1.3, { duration: 100, easing: Easing.out(Easing.ease) }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
  };

  const handleSharePress = () => {
    shareScale.value = withSequence(
      withTiming(1.2, { duration: 100, easing: Easing.out(Easing.ease) }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
  };

  const handleButtonPress = (type: 'view' | 'maps') => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100, easing: Easing.out(Easing.ease) }),
      withSpring(1, { damping: 15, stiffness: 200 })
    );
    
    if (type === 'maps' && patch.latitude && patch.longitude) {
      openMaps(patch.latitude, patch.longitude);
    }
  };

  const openMaps = (lat: number, lng: number) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}`,
    });
    if (url) {
      Linking.openURL(url);
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const heroImageStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 200],
      [0, -50],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ translateY }],
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 200],
      [0, -20],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ translateY }],
    };
  });

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const shareStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shareScale.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.5)" />
      
      {/* Hero Image with Carousel */}
      <Animated.View style={[styles.heroContainer, heroImageStyle]}>
        <Image
          source={{ uri: images[currentImageIndex] }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        
        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />
        
        {/* Header Icons */}
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.headerIconText}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerRightIcons}>
            <Animated.View style={shareStyle}>
              <TouchableOpacity
                style={styles.headerIcon}
                onPress={handleSharePress}
                activeOpacity={0.7}
              >
                <Text style={styles.headerIconText}>↗️</Text>
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View style={heartStyle}>
              <TouchableOpacity
                style={styles.headerIcon}
                onPress={handleHeartPress}
                activeOpacity={0.7}
              >
                <Text style={styles.headerIconText}>❤️</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Hotel Info Overlay */}
        <View style={styles.hotelInfoOverlay}>
          <View style={styles.hotelNameContainer}>
            <Text style={styles.hotelIcon}>🏠</Text>
            <View style={styles.hotelNameText}>
              <Text style={styles.hotelNameFirstLine}>{patch.name}</Text>
              <Text style={styles.hotelNameSecondLine}>{patch.category}</Text>
            </View>
          </View>
          <View style={styles.reviewSection}>
            <View style={styles.reviewAvatars}>
              <View style={styles.avatar} />
              <View style={styles.avatar} />
              <View style={styles.avatar} />
            </View>
            <Text style={styles.reviewCount}>12k Review</Text>
          </View>
        </View>

        {/* Image Carousel Indicator */}
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
      </Animated.View>

      {/* Content */}
      <Animated.View style={[styles.content, contentStyle]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          {/* Popular Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Amenities</Text>
            <View style={styles.amenitiesRow}>
              <View style={styles.amenityButton}>
                <Text style={styles.amenityIcon}>🛏️</Text>
                <Text style={styles.amenityText}>2 Beds</Text>
              </View>
              <View style={styles.amenityButton}>
                <Text style={styles.amenityIcon}>📺</Text>
                <Text style={styles.amenityText}>HDTV</Text>
              </View>
              <View style={styles.amenityButton}>
                <Text style={styles.amenityIcon}>📶</Text>
                <Text style={styles.amenityText}>Free Wi-Fi</Text>
              </View>
              <View style={styles.amenityButton}>
                <Text style={styles.amenityIcon}>🛁</Text>
                <Text style={styles.amenityText}>Bathtub</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              Riverside Grand Hotel offers luxury stays, stunning river views, fine dining, a spa, and elegant event spaces for unforgettable See More.....
            </Text>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceValue}>
            <Text style={styles.priceAmount}>
              {patch.price === 'Gratis' ? 'Gratis' : `$${patch.price === '$$' ? '90' : patch.price === '$$$' ? '150' : '50'}`}
            </Text>
            {patch.price !== 'Gratis' && (
              <Text style={styles.priceUnit}>/ noche</Text>
            )}
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <Animated.View style={[styles.actionButton, styles.viewMoreButton, buttonStyle]}>
            <TouchableOpacity
              style={styles.buttonContent}
              onPress={() => handleButtonPress('view')}
              activeOpacity={0.9}
            >
              <Text style={styles.viewMoreText}>Ver más</Text>
            </TouchableOpacity>
          </Animated.View>
          
          <Animated.View style={[styles.actionButton, styles.mapsButton, buttonStyle]}>
            <TouchableOpacity
              style={styles.buttonContent}
              onPress={() => handleButtonPress('maps')}
              activeOpacity={0.9}
            >
              <Text style={styles.mapsIcon}>🌍</Text>
              <Text style={styles.mapsText}>Llévame allá</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6F2', // Ivory background
  },
  heroContainer: {
    width: '100%',
    height: height * 0.5,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
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
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerIcons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerIconText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  headerRightIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  hotelInfoOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  hotelNameContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hotelIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  hotelNameText: {
    flex: 1,
  },
  hotelNameFirstLine: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 28,
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
  hotelNameSecondLine: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 28,
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
  reviewSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAvatars: {
    flexDirection: 'row',
    gap: 4,
    marginRight: 8,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  reviewCount: {
    fontSize: 14,
    color: '#FFFFFF',
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
  carouselIndicator: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    zIndex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
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
  amenitiesRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  amenityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  amenityIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  amenityText: {
    fontSize: 12,
    color: '#1A1A1A',
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
  description: {
    fontSize: 16,
    color: '#6C757D',
    lineHeight: 24,
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  priceContainer: {
    flex: 1,
  },
  priceValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
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
  priceUnit: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1A1A1A',
    marginLeft: 2,
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  viewMoreButton: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  mapsButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF4444',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  viewMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  mapsText: {
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
  mapsIcon: {
    fontSize: 16,
  },
});

export default PatchDetailModal;