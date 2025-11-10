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
  Users,
  DollarSign,
  Calendar,
  Hourglass,
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
import ImageViewerModal from "@/components/ImageViewerModal";
import { trpc } from "@/lib/trpc";

const { width } = Dimensions.get('window');

const CATEGORY_COLORS = {
  barrio: '#E52D27',
  mirador: '#FF725E',
  rooftop: '#FF3B30',
  restaurante: '#5FBF88',
  cafe: '#CBAA7C',
  bar: '#F39C12',
  club: '#9B59B6',
  parque: '#7ED957',
} as const;

const WEEKDAYS = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
] as const;

const MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
] as const;

type EventInfo = {
  formattedDate: string;
  countdown: string;
};

const capitalizeWord = (value: string) =>
  value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;

export const getEventInfo = (eventDate?: string | null): EventInfo | null => {
  if (!eventDate) return null;

  const event = new Date(eventDate);
  if (Number.isNaN(event.getTime())) {
    return null;
  }

  const weekday = capitalizeWord(WEEKDAYS[event.getDay()]);
  const day = event.getDate();
  const month = capitalizeWord(MONTHS[event.getMonth()]);
  const hours = event.getHours();
  const minutes = event.getMinutes().toString().padStart(2, '0');
  const hour12 = hours % 12 || 12;
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedDate = `${weekday} ${day} ${month} - ${hour12}:${minutes} ${period}`;

  const dayDifference = Math.ceil((event.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(dayDifference, 0);
  const countdown = `Faltan ${daysRemaining} días`;

  return {
    formattedDate,
    countdown,
  };
};

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { plans } = usePlansStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const [videoPaused, setVideoPaused] = useState(false);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const heroListRef = useRef<FlatList<string>>(null);
  
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

  const remoteReviews = reviewsQuery.data || [];

  // Find similar plans (same category, exclude current plan)
  const similarPlans = useMemo(() => {
    if (!plan) return [];
    const targetCategory = plan.primaryCategory || plan.category;
    return mockPlans
      .filter(p => {
        const candidateCategory = p.primaryCategory || p.category;
        return p.id !== plan.id && candidateCategory === targetCategory;
      })
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

  const accent = plan.primaryCategory ? CATEGORY_COLORS[plan.primaryCategory] : '#8B0000';
  const communityReviews = plan.reviews ?? [];
  const displayRating = useMemo(() => {
    if (typeof plan.rating === 'number') return plan.rating;
    if (communityReviews.length > 0) {
      const total = communityReviews.reduce((sum, review) => sum + review.rating, 0);
      return parseFloat((total / communityReviews.length).toFixed(1));
    }
    return 0;
  }, [plan.rating, communityReviews]);
  const totalReviewCount =
    plan.reviewCount ??
    (communityReviews.length > 0 ? communityReviews.length : remoteReviews.length);
  const locationLabel =
    plan.location.address ||
    plan.location.city ||
    plan.location.zone ||
    'Medellín';
  const capacityValue = plan.capacity ?? plan.maxPeople ?? null;
  const attendeesValue = plan.currentAttendees ?? plan.currentPeople ?? null;
  const capacityLabel =
    capacityValue != null && attendeesValue != null
      ? `${attendeesValue}/${capacityValue}`
      : null;
  const averagePriceValue =
    typeof plan.averagePrice === 'number' ? plan.averagePrice : plan.price ?? null;
  const averagePriceLabel =
    averagePriceValue != null
      ? averagePriceValue === 0
        ? 'Gratis'
        : `$${averagePriceValue.toLocaleString('es-CO')}`
      : null;
  const categoriesList =
    plan.categories && plan.categories.length > 0 ? plan.categories : plan.tags ?? [];
  const categoriesLabel = categoriesList.length > 0 ? categoriesList.join(' • ') : null;
  const eventInfo = getEventInfo(plan.eventDate);

  const handleOpenMaps = () => {
    let address = plan.location.address;
    
    // Si no hay address, construir desde zone y city
    if (!address) {
      const parts = [];
      if (plan.location.zone) parts.push(plan.location.zone);
      if (plan.location.city) parts.push(plan.location.city);
      address = parts.length > 0 ? parts.join(', ') : 'Medellín, Colombia';
    }
    
    // Si hay coordenadas, usarlas; si no, usar la dirección
    if (plan.location.lat != null && plan.location.lng != null) {
      address = `${plan.location.lat},${plan.location.lng}`;
    } else if (plan.location.latitude && plan.location.longitude) {
      address = `${plan.location.latitude},${plan.location.longitude}`;
    }
    
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    
    Linking.openURL(url).catch((err) => {
      console.error("Error opening maps:", err);
      Alert.alert("Error", "No se pudo abrir Google Maps");
    });
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

  const renderRemoteReview = ({ item, index }: { item: any; index: number }) => (
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

  const imageSources = useMemo(() => {
    if (plan?.images && plan.images.length > 0) {
      return plan.images;
    }
    const categoryKey = plan?.primaryCategory || 'nightlife';
    return Array.from({ length: 3 }, (_, index) =>
      `https://source.unsplash.com/600x600/?${encodeURIComponent(categoryKey)},night,art,urban&sig=${index}`
    );
  }, [plan]);

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
          <FlatList
            ref={heroListRef}
            data={imageSources}
            keyExtractor={(item, index) => `${item}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width}
            decelerationRate="fast"
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setActiveHeroIndex(index);
            }}
            renderItem={({ item }) => (
              <View style={styles.heroSlide}>
                <Image
                  source={{ uri: item }}
                  style={styles.heroImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              </View>
            )}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', `${accent}AA`, accent]}
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
            {displayRating > 0 && (
              <View style={styles.ratingRow}>
                {renderStars(displayRating)}
                <Text style={styles.ratingText}>{displayRating.toFixed(1)}</Text>
                {totalReviewCount > 0 && (
                  <Text style={styles.reviewCountText}>({totalReviewCount})</Text>
                )}
              </View>
            )}

            <View style={styles.heroInfoContainer}>
              {locationLabel && (
                <View style={styles.heroInfoRow}>
                  <MapPin size={18} color="#BBBBBB" />
                  <Text style={styles.heroInfoText} numberOfLines={1}>
                    {locationLabel}
                  </Text>
                </View>
              )}
              {capacityLabel && (
                <View style={styles.heroInfoRow}>
                  <Users size={18} color="#BBBBBB" />
                  <Text style={styles.heroInfoText}>
                    {capacityLabel}
                  </Text>
                </View>
              )}
              {averagePriceLabel && (
                <View style={styles.heroInfoRow}>
                  <DollarSign size={18} color="#BBBBBB" />
                  <Text style={styles.heroInfoText}>
                    {averagePriceLabel}
                  </Text>
                </View>
              )}
              {categoriesLabel && (
                <View style={styles.heroInfoRow}>
                  <Text style={styles.heroInfoIcon}>🏷</Text>
                  <Text style={styles.heroInfoText} numberOfLines={2}>
                    {categoriesLabel}
                  </Text>
                </View>
              )}
              {eventInfo && (
                <>
                  <View style={styles.heroInfoRow}>
                    <Calendar size={18} color="#BBBBBB" />
                    <Text style={styles.heroInfoText}>
                      {eventInfo.formattedDate}
                    </Text>
                  </View>
                  <View style={styles.heroInfoRow}>
                    <Hourglass size={18} color="#BBBBBB" />
                    <Text style={styles.heroInfoText}>
                      {eventInfo.countdown}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {plan.tags && plan.tags.length > 0 && (
              <View style={styles.heroTagsRow}>
                {plan.tags.map((tag) => (
                  <View key={tag} style={styles.heroTagChip}>
                    <Text style={styles.heroTagText}>🏷️ {tag}</Text>
                  </View>
                ))}
              </View>
            )}
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
        ) : null}

        <View style={styles.thumbnailContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailScrollContent}
          >
            {imageSources.map((src, index) => (
              <TouchableOpacity
                key={`${src}-thumb-${index}`}
                onPress={() => {
                  setViewerIndex(index);
                  setViewerVisible(true);
                }}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: src }}
                  style={[
                    styles.thumbnailImage,
                    index === activeHeroIndex && styles.thumbnailImageActive,
                    { marginRight: index === imageSources.length - 1 ? 0 : 12 },
                  ]}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.contentContainer}>
          {/* Info Block */}
          <View style={styles.infoBlock}>
            <View style={styles.locationRow}>
              <MapPin size={18} color="#D9D9D9" />
              <Text style={styles.locationText}>
                {locationLabel}
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

          {/* Description - usar vibe si existe, sino description */}
          <Text style={styles.description}>
            {plan.vibe || plan.description || "Plan perfecto si buscas ambiente chill, luces cálidas y música suave."}
          </Text>

          {communityReviews.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Comentarios de la comunidad 💬</Text>
              <View style={styles.communityReviewsList}>
                {communityReviews.map((review, index) => (
                  <View key={`${review.user}-${index}`} style={styles.communityReviewBubble}>
                    <View style={styles.communityReviewHeader}>
                      <Text style={styles.communityReviewAuthor}>{review.user}</Text>
                      <Text style={styles.communityReviewRating}>
                        {"⭐".repeat(Math.round(review.rating)).padEnd(5, "☆")}
                      </Text>
                    </View>
                    <Text style={styles.communityReviewText}>{review.comment}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Reviews */}
          {remoteReviews.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Lo que dice la gente 💬</Text>
              <FlatList
                data={remoteReviews.slice(0, 5)}
                renderItem={renderRemoteReview}
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

      <ImageViewerModal
        visible={viewerVisible}
        images={imageSources}
        index={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />
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
  heroSlide: {
    width,
    height: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
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
  heroInfoContainer: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    marginBottom: 12,
  },
  heroInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroInfoText: {
    color: '#BBBBBB',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  heroInfoIcon: {
    color: '#BBBBBB',
    fontSize: 16,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  heroMetaItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  heroMetaText: {
    color: '#F1F1F1',
    fontSize: 13,
    fontWeight: '600',
  },
  heroTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroTagChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
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
  thumbnailContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  thumbnailScrollContent: {
    paddingRight: 16,
  },
  thumbnailImage: {
    width: 96,
    height: 72,
    borderRadius: 12,
    opacity: 0.85,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  thumbnailImageActive: {
    opacity: 1,
    borderColor: 'rgba(255,255,255,0.35)',
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
  // Reviews
  communityReviewsList: {
    gap: 12,
    marginBottom: 32,
  },
  communityReviewBubble: {
    backgroundColor: '#111111',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  communityReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  communityReviewAuthor: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  communityReviewRating: {
    color: '#FFD54F',
    fontSize: 12,
    letterSpacing: 1,
  },
  communityReviewText: {
    color: '#CFCFCF',
    fontSize: 12,
    lineHeight: 16,
  },
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
