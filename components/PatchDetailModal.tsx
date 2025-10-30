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
import Colors from '@/constants/colors';

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
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Imágenes de ejemplo para el carrusel
  const images = patch.images || [
    patch.image,
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
    'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
  ];

  const handleHeartPress = () => {
    // Función para manejar el like
  };

  const handleSharePress = () => {
    // Función para compartir
  };

  const handleLinkPress = () => {
    // Función para copiar enlace
  };

  const handleButtonPress = () => {
    if (patch.latitude && patch.longitude) {
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.background} />
      
      {/* Hero Image with Carousel */}
      <View style={styles.heroContainer}>
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
            style={styles.backButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerRightIcons}>
            <TouchableOpacity
              style={styles.floatingButton}
              onPress={handleSharePress}
              activeOpacity={0.7}
            >
              <Text style={styles.floatingButtonIcon}>↗️</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.floatingButton}
              onPress={handleLinkPress}
              activeOpacity={0.7}
            >
              <Text style={styles.floatingButtonIcon}>🔗</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hotel Info Overlay */}
        <View style={styles.hotelInfoOverlay}>
          <View style={styles.hotelNameContainer}>
            <Text style={styles.hotelIcon}>🏠</Text>
            <Text style={styles.hotelName}>{patch.name}</Text>
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
      </View>

      {/* Content Card */}
      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Popular Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Amenities</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.amenitiesScrollContainer}
            >
              <View style={styles.amenityItem}>
                <Text style={styles.amenityIcon}>🛏️</Text>
                <Text style={styles.amenityText}>2 Beds</Text>
              </View>
              <View style={styles.amenityItem}>
                <Text style={styles.amenityIcon}>📺</Text>
                <Text style={styles.amenityText}>HDTV</Text>
              </View>
              <View style={styles.amenityItem}>
                <Text style={styles.amenityIcon}>📶</Text>
                <Text style={styles.amenityText}>Free Wi-Fi</Text>
              </View>
              <View style={styles.amenityItem}>
                <Text style={styles.amenityIcon}>🛁</Text>
                <Text style={styles.amenityText}>Bathtub</Text>
              </View>
              <View style={styles.amenityItem}>
                <Text style={styles.amenityIcon}>🚗</Text>
                <Text style={styles.amenityText}>Parking</Text>
              </View>
            </ScrollView>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
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
            <Text style={styles.priceAmount}>
              {patch.price === 'Gratis' ? 'Gratis' : `$${patch.price === '$$' ? '90' : patch.price === '$$$' ? '150' : '50'}`}
            </Text>
            {patch.price !== 'Gratis' && (
              <Text style={styles.priceUnit}>/ noche</Text>
            )}
          </Text>
        </View>
        
        <View style={styles.bookButton}>
          <TouchableOpacity
            style={styles.bookButtonContent}
            onPress={handleButtonPress}
            activeOpacity={0.9}
          >
            <Text style={styles.bookButtonText}>Llévame allá</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
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
    height: 140,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backIcon: {
    fontSize: 20,
    color: Colors.light.white,
    fontWeight: '600',
  },
  headerRightIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonIcon: {
    fontSize: 18,
    color: Colors.light.text,
  },
  hotelInfoOverlay: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  hotelNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hotelIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  hotelName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.white,
    lineHeight: 32,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '800',
      },
      android: {
        fontFamily: 'sans-serif-black',
        fontWeight: '800',
      },
    }),
  },
  reviewSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewAvatars: {
    flexDirection: 'row',
    gap: 6,
    marginRight: 12,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  reviewCount: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
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
    backgroundColor: Colors.light.white,
    width: 24,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    zIndex: 1,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
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
  amenitiesScrollContainer: {
    paddingRight: 24,
  },
  amenityItem: {
    alignItems: 'center',
    backgroundColor: Colors.light.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: 12,
    minWidth: 80,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  amenityIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  amenityText: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: '600',
    textAlign: 'center',
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
  descriptionContainer: {
    position: 'relative',
  },
  description: {
    fontSize: 16,
    color: Colors.light.darkGray,
    lineHeight: 26,
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
  seeMoreContainer: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  seeMoreText: {
    fontSize: 16,
    color: Colors.light.primary,
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.card,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  priceContainer: {
    flex: 1,
  },
  priceValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.text,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '800',
      },
      android: {
        fontFamily: 'sans-serif-black',
        fontWeight: '800',
      },
    }),
  },
  priceUnit: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.light.darkGray,
    marginLeft: 4,
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
  bookButton: {
    borderRadius: 16,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bookButtonContent: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.white,
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
});

export default PatchDetailModal;