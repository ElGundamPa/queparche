import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
  FlatList,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { VideoView, useVideoPlayer } from "expo-video";
import { 
  MapPin, 
  Star, 
  ArrowLeft,
  Navigation,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";

import Colors from "@/constants/colors";
import { usePlansStore } from "@/hooks/use-plans-store";
import { storage } from "@/lib/storage";
import { mockPlans } from "@/mocks/plans";
import { Plan } from "@/types/plan";
import FallbackScreen from "@/components/FallbackScreen";
import PatchGridItem from "@/components/PatchGridItem";
import { trpc } from "@/lib/trpc";

const { width } = Dimensions.get('window');

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { plans } = usePlansStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const [videoPaused, setVideoPaused] = useState(false);
  
  // Buscar plan en mockPlans primero, luego en plans del store
  const plan = useMemo(() => {
    const fromMocks = mockPlans.find((p) => p.id === id);
    if (fromMocks) return fromMocks;
    return plans.find((p) => p.id === id);
  }, [id, plans]);
  
  // Add to recent plans when viewing
  useEffect(() => {
    if (plan && id) {
      storage.addToRecentPlans(id);
    }
  }, [plan, id]);

  // Fetch reviews
  const reviewsQuery = trpc.reviews.getByPlan.useQuery({ planId: id || "" }, {
    enabled: !!id && !!plan,
  });

  const reviews = reviewsQuery.data || [];

  // Find similar plans (same category, exclude current plan)
  const similarPlans = useMemo(() => {
    if (!plan) return [];
    return mockPlans
      .filter(p => p.id !== plan.id && p.category === plan.category)
      .slice(0, 6);
  }, [plan]);

  // Video player for preview (if video URL exists)
  // For now, we'll use image carousel as fallback
  const hasVideo = false; // Placeholder - add videoUrl to Plan type if needed
  const videoUrl = ''; // Placeholder

  // Video player setup (if video exists)
  const player = hasVideo ? useVideoPlayer(videoUrl, (player) => {
    player.loop = true;
    player.muted = true;
    if (!videoPaused) {
      player.play();
    }
  }) : null;

  // Handle scroll to pause video when off-screen
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const heroHeight = 320;
    if (offsetY > heroHeight && !videoPaused) {
      setVideoPaused(true);
      if (player) player.pause();
    } else if (offsetY <= heroHeight && videoPaused) {
      setVideoPaused(false);
      if (player) player.play();
    }
  };

  if (!id) {
    return (
      <FallbackScreen
        title="ID de plan inválido"
        message="No se pudo identificar el plan solicitado."
        showBackButton={true}
        showHomeButton={true}
      />
    );
  }

  if (!plan) {
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

  const handleOpenMaps = () => {
    const address = plan.location.address || `${plan.location.latitude},${plan.location.longitude}`;
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    
    Linking.openURL(url).catch((err) => {
      console.error("Error opening maps:", err);
      Alert.alert("Error", "No se pudo abrir Google Maps");
    });
  };

  const getPriceTypeLabel = (priceType?: string) => {
    switch (priceType) {
      case 'free':
        return 'Gratis';
      case 'paid':
        return plan.price ? `$${plan.price.toLocaleString()}` : 'Económico';
      case 'minimum_consumption':
        return 'Consumo mínimo';
      default:
        return plan.price === 0 ? 'Gratis' : 'Económico';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={18}
        color={i < Math.round(rating) ? "#FFD54F" : "#444444"}
        fill={i < Math.round(rating) ? "#FFD54F" : "none"}
      />
    ));
  };

  const renderReview = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(300)}
      style={styles.reviewBubble}
    >
      <Text style={styles.reviewText}>{item.comment}</Text>
      <Text style={styles.reviewMeta}>
        {item.userName} · {new Date(item.createdAt).toLocaleDateString('es-ES')}
      </Text>
    </Animated.View>
  );

  const renderPhoto = ({ item, index }: { item: string; index: number }) => (
    <Image
      source={{ uri: item }}
      style={styles.photoItem}
      contentFit="cover"
    />
  );

  const renderSimilarPlan = ({ item }: { item: Plan }) => (
    <View style={styles.similarPlanWrapper}>
      <PatchGridItem
        plan={item}
        onPress={() => router.push(`/plan/${item.id}`)}
        index={0}
      />
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar style="light" />
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        testID={`plan-detail-${plan.id}`}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: plan.images[0] }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.75)', 'rgba(0,0,0,1)']}
            style={styles.heroGradient}
          />
          
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            testID="back-button"
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Hero Content */}
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{plan.name}</Text>
            
            {/* Rating Stars */}
            <View style={styles.ratingRow}>
              {renderStars(plan.rating)}
              <Text style={styles.ratingText}>{plan.rating.toFixed(1)}</Text>
              {plan.reviewCount > 0 && (
                <Text style={styles.reviewCountText}>({plan.reviewCount})</Text>
              )}
            </View>

            {/* Price Type Badge */}
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>
                {getPriceTypeLabel(plan.priceType)}
              </Text>
            </View>
          </View>
        </View>

        {/* Video Preview or Image Carousel */}
        {hasVideo && player ? (
          <View style={styles.videoContainer}>
            <VideoView
              player={player}
              style={styles.video}
              allowsFullscreen={false}
              allowsPictureInPicture={false}
              isMuted={true}
            />
          </View>
        ) : plan.images.length > 1 ? (
          <View style={styles.photoCarouselWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoCarousel}
            >
              {plan.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.photoCarouselItem}
                  contentFit="cover"
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.contentContainer}>
          {/* Info Block */}
          <View style={styles.infoBlock}>
            <View style={styles.locationRow}>
              <MapPin size={18} color="#D9D9D9" />
              <Text style={styles.locationText}>
                {plan.location.address || "Medellín, Colombia"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.takeMeButton}
              onPress={handleOpenMaps}
              testID="open-maps-button"
            >
              <Navigation size={18} color="#FFFFFF" />
              <Text style={styles.takeMeButtonText}>Llévame allá</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            {plan.description || "Plan perfecto si buscas ambiente chill, luces cálidas y música suave."}
          </Text>

          {/* Photo Carousel (horizontal, 120px) */}
          {plan.images.length > 1 && (
            <>
              <Text style={styles.sectionTitle}>Fotos</Text>
              <FlatList
                data={plan.images}
                renderItem={renderPhoto}
                keyExtractor={(item, index) => `photo-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photosContainer}
              />
            </>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Lo que dice la gente 💬</Text>
              <FlatList
                data={reviews.slice(0, 5)}
                renderItem={renderReview}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.reviewsContainer}
              />
            </>
          )}

          {/* Similar Plans */}
          {similarPlans.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Parches parecidos</Text>
              <FlatList
                data={similarPlans}
                renderItem={renderSimilarPlan}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.similarPlansContainer}
                removeClippedSubviews={false}
                initialNumToRender={3}
                windowSize={5}
              />
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E0E',
  },
  // Hero Header
  heroContainer: {
    width: '100%',
    height: 320,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 34,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  reviewCountText: {
    fontSize: 14,
    color: '#BBBBBB',
    marginLeft: 4,
  },
  priceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  priceBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Video/Photo Preview
  videoContainer: {
    width: '100%',
    height: 320,
    marginTop: -20,
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#111111',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  photoCarouselWrapper: {
    marginTop: -20,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  photoCarousel: {
    gap: 12,
    paddingRight: 16,
  },
  photoCarouselItem: {
    width: width - 64,
    height: 320,
    borderRadius: 18,
  },
  // Content
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  // Info Block
  infoBlock: {
    marginBottom: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  locationText: {
    fontSize: 15,
    color: '#D9D9D9',
    flex: 1,
    lineHeight: 20,
  },
  takeMeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
  },
  takeMeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Description
  description: {
    fontSize: 14,
    color: '#BBBBBB',
    lineHeight: 20,
    marginBottom: 32,
  },
  // Section Title
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    marginTop: 8,
  },
  // Photo Carousel (horizontal)
  photosContainer: {
    gap: 12,
    paddingRight: 16,
    marginBottom: 32,
  },
  photoItem: {
    width: 120,
    height: 120,
    borderRadius: 14,
  },
  // Reviews
  reviewsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  reviewBubble: {
    backgroundColor: '#111111',
    padding: 12,
    borderRadius: 12,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  reviewText: {
    fontSize: 13,
    color: '#EAEAEA',
    lineHeight: 18,
    marginBottom: 6,
  },
  reviewMeta: {
    fontSize: 11,
    color: '#888888',
  },
  // Similar Plans
  similarPlansContainer: {
    gap: 12,
    paddingRight: 16,
    marginBottom: 32,
  },
  similarPlanWrapper: {
    width: (width - 64) / 3,
  },
});
