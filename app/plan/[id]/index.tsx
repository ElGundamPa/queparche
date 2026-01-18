import React, { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from "react";
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
  KeyboardAvoidingView,
  TextInput,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
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
  Share2,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";

import Colors from "@/constants/colors";
import { usePlansStore } from "@/hooks/use-plans-store";
import { usePlanStore } from "@/store/plansStore";
import { storage } from "@/lib/storage";
import { mockPlans } from "@/mocks/plans";
import { mockUsers } from "@/mocks/users";
import { Plan } from "@/types/plan";
import FallbackScreen from "@/components/FallbackScreen";
import PatchGridItem from "@/components/PatchGridItem";
import ImageViewerModal from "@/components/ImageViewerModal";
import { trpc } from "@/lib/trpc";
import { useCommentsStore, type Comment } from "@/store/commentsStore";
import { useAuthStore } from "@/hooks/use-auth-store";

const { width } = Dimensions.get('window');

const DEFAULT_AVATAR = "https://avatar.vercel.sh/queparche?size=64&background=111111&color=ffffff" as const;
const DEFAULT_IMAGE = "https://i.imgur.com/8fKQZqV.jpeg" as const;
const EMPTY_COMMENTS: Comment[] = [];

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

const formatRelativeTime = (timestamp: number) => {
  const now = Date.now();
  const diff = Math.max(0, now - timestamp);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return "hace instantes";
  }

  const minutes = Math.floor(diff / minute);
  if (minutes < 60) {
    return `hace ${minutes}min`;
  }

  const hours = Math.floor(diff / hour);
  if (hours < 24) {
    return `hace ${hours}h`;
  }

  const days = Math.floor(diff / day);
  if (days < 7) {
    return `hace ${days}d`;
  }

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `hace ${weeks}sem`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `hace ${months}m`;
  }

  const years = Math.floor(days / 365);
  return `hace ${years}a`;
};

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { plans } = usePlansStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const [videoPaused, setVideoPaused] = useState(false);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const heroListRef = useRef<FlatList<string>>(null);
  const planId = id ?? "";
  const planComments = useCommentsStore((state) =>
    planId ? state.comments[planId] ?? EMPTY_COMMENTS : EMPTY_COMMENTS
  );
  const addComment = useCommentsStore((state) => state.addComment);
  const toggleCommentLike = useCommentsStore((state) => state.toggleLike);

  const currentUser = useAuthStore((state) => state.currentUser);
  const [commentText, setCommentText] = useState("");
  const canSendComment = commentText.trim().length > 0;

  const glowProgress = useSharedValue(0);
  const takeMeButtonScale = useSharedValue(1);

  const usersDirectory = useMemo(() => {
    const directory: Map<string, { id: string; name: string; username: string; avatar: string }> = new Map();
    mockUsers.forEach((user) => {
      const safeName = user.name ?? user.username ?? "Explorador";
      const safeUsername = user.username ?? user.name ?? `user-${user.id}`;
      directory.set(user.id, {
        id: user.id,
        name: safeName,
        username: safeUsername,
        avatar: user.avatar ?? DEFAULT_AVATAR,
      });
    });
    return directory;
  }, []);

  useEffect(() => {
    glowProgress.value = withRepeat(
      withTiming(1, {
        duration: 2400,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    return () => {
      glowProgress.value = 0;
    };
  }, []);

  // Buscar plan en mockPlans primero, luego en plans del store
  const plan = useMemo(() => {
    const fromMocks = mockPlans.find((p) => p.id === id);
    if (fromMocks) return fromMocks;
    return plans.find((p) => p.id === id);
  }, [id, plans]);

  const planJoinId = plan?.id ?? planId;
  const { joinedPlans, toggleJoin, attendees } = usePlanStore();
  const isJoined = planJoinId ? joinedPlans.includes(planJoinId) : false;
  const attendeeIds = useMemo(
    () => (planJoinId ? attendees[planJoinId] ?? [] : []),
    [attendees, planJoinId]
  );

  const attendeeUsers = useMemo(() => {
    return attendeeIds
      .map((userId) => usersDirectory.get(userId))
      .filter((user): user is { id: string; name: string; username: string; avatar: string } => Boolean(user));
  }, [attendeeIds, usersDirectory]);

  const displayedAttendees = useMemo(() => attendeeUsers.slice(0, 6), [attendeeUsers]);
  const hasMoreAttendees = attendeeUsers.length > 6 && !!planJoinId;

  const handleSeeAllAttendees = useCallback(() => {
    if (!planJoinId) return;
    router.push(`/plan/${planJoinId}/attendees`);
  }, [planJoinId, router]);

  const handleOpenProfile = useCallback(
    (username: string) => {
      router.push(`/user/${username}`);
    },
    [router]
  );

  const joinAnimatedStyle = useAnimatedStyle(
    () => {
      const scale = interpolate(glowProgress.value, [0, 0.5, 1], [0.98, 1, 0.98]);
      return {
        transform: [{ scale }],
        shadowColor: "#FF3B30",
        shadowOpacity: 0.55,
        shadowRadius: isJoined ? 12 : 18,
        shadowOffset: { width: 0, height: 0 },
      };
    },
    [isJoined]
  );

  const takeMeButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: takeMeButtonScale.value }],
    };
  });

  const handleToggleJoin = useCallback(() => {
    if (!planJoinId) return;
    toggleJoin(planJoinId);
  }, [planJoinId, toggleJoin]);

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

  useLayoutEffect(() => {
    const headerTitle = plan?.name || "Plan";
    const locationLabel =
      plan?.location.address ||
      plan?.location.city ||
      plan?.location.zone ||
      'Medellín';
    const eventInfo = getEventInfo(plan?.eventDate);

    navigation.setOptions({
      headerShown: true,
      title: headerTitle,
      headerTransparent: true,
      headerTintColor: "#fff",
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            Share.share({
              message: `Bro 🤙 Vamos a este parche 🔥\n\n${plan.name} — ${locationLabel}\n${eventInfo?.formattedDate ?? ''}\n\nDescárgate Qué Parche:\nhttps://queparche.app`,
            });
          }}
          activeOpacity={0.85}
          style={{ paddingHorizontal: 12, paddingVertical: 6 }}
        >
          <Share2 size={22} color="#FFFFFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, plan]);

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

  const handleTakeMePress = useCallback(() => {
    takeMeButtonScale.value = withTiming(0.95, { duration: 100 }, () => {
      takeMeButtonScale.value = withTiming(1, { duration: 100 });
    });
    handleOpenMaps();
  }, [takeMeButtonScale]);

  const renderStars = (rating: number) => {
    const starColor = accent || "#FF3B30";
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={18}
        color={i < Math.round(rating) ? starColor : "#444444"}
        fill={i < Math.round(rating) ? starColor : "none"}
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
    const rawImages = Array.isArray(plan?.images) ? plan.images : [];
    const images = rawImages.filter((img): img is string => typeof img === "string" && img.length > 3);
    return images.length > 0 ? images : [DEFAULT_IMAGE];
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

  const handleToggleLike = useCallback((commentId: string) => {
    if (!currentUser || !planJoinId) {
      Alert.alert("Error", "Debes iniciar sesión para dar like a comentarios.");
      return;
    }
    toggleCommentLike(planJoinId, commentId, currentUser.id);
  }, [currentUser, toggleCommentLike, planJoinId]);

  const handleSendComment = useCallback(() => {
    if (!planJoinId) return;
    if (!currentUser) {
      Alert.alert("Inicia sesión", "Debes iniciar sesión para comentar.");
      return;
    }
    if (!commentText.trim()) return;

    addComment(planJoinId, currentUser.id, commentText);
    setCommentText("");
  }, [planJoinId, currentUser, commentText, addComment]);

  const renderCommentItem = useCallback(
    ({ item }: { item: Comment }) => {
      const author = usersDirectory.get(item.userId);
      const displayName = author?.name || author?.username || "Explorador";
      const avatar = author?.avatar || DEFAULT_AVATAR;
      const hasLiked = !!currentUser && item.likes.includes(currentUser.id);
 
      return (
        <View style={styles.commentItem}>
          <Image source={{ uri: avatar }} style={styles.commentAvatar} />
          <View style={styles.commentBody}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentAuthor}>{displayName}</Text>
              <Text style={styles.commentTime}>{formatRelativeTime(item.createdAt)}</Text>
            </View>
            <Text style={styles.commentText}>{item.text}</Text>
            <View style={styles.commentFooter}>
              <TouchableOpacity
                style={styles.commentLikeButton}
                onPress={() => handleToggleLike(item.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.commentLikeIcon, hasLiked && styles.commentLikeIconActive]}>
                  {hasLiked ? "❤️‍🔥" : "❤️"}
                </Text>
                {item.likes.length > 0 && (
                  <Text style={styles.commentLikeCount}>{item.likes.length}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    },
    [usersDirectory, currentUser, handleToggleLike]
  );

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.screen}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          testID={`plan-detail-${plan.id}`}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Image - Solo imagen, sin texto */}
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
            {/* Overlay suave solo en esquinas inferiores */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.15)']}
              style={styles.heroGradientOverlay}
            />
            
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              testID="back-button"
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Tarjeta de información estilo Apple/Airbnb */}
          <View style={styles.infoCard}>
            {/* 1. Nombre del plan */}
            <Text style={styles.infoCardTitle}>{plan.name}</Text>
            
            {/* 2. Rating (estrellas + número) */}
            {displayRating > 0 && (
              <View style={styles.infoCardRating}>
                <View style={styles.ratingStarsContainer}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={14}
                      color={i < Math.round(displayRating) ? accent : "#444444"}
                      fill={i < Math.round(displayRating) ? accent : "none"}
                    />
                  ))}
                </View>
                <Text style={styles.ratingNumber}>{displayRating.toFixed(1)}</Text>
                {totalReviewCount > 0 && (
                  <Text style={styles.ratingCount}>({totalReviewCount})</Text>
                )}
              </View>
            )}

            {/* 3. Dirección */}
            {locationLabel && (
              <View style={styles.infoCardLocation}>
                <MapPin size={16} color="#9F9F9F" />
                <Text style={styles.infoCardLocationText}>{locationLabel}</Text>
              </View>
            )}

            {/* 4. Capacidad, precio y categoría - Pills */}
            <View style={styles.infoCardPills}>
              {capacityLabel && (
                <View style={styles.infoPill}>
                  <Users size={14} color="#FFFFFF" />
                  <Text style={styles.infoPillText}>{capacityLabel}</Text>
                </View>
              )}
              {averagePriceLabel && (
                <View style={styles.infoPill}>
                  <DollarSign size={14} color="#FFFFFF" />
                  <Text style={styles.infoPillText}>{averagePriceLabel}</Text>
                </View>
              )}
              {plan.primaryCategory && (
                <View style={styles.infoPill}>
                  <Text style={styles.infoPillText}>
                    {plan.primaryCategory.charAt(0).toUpperCase() + plan.primaryCategory.slice(1)}
                  </Text>
                </View>
              )}
            </View>

            {/* 5. Chips de tags estilo Instagram */}
            {plan.tags && plan.tags.length > 0 && (
              <View style={styles.infoCardTags}>
                {plan.tags.map((tag) => (
                  <View key={tag} style={styles.infoTagChip}>
                    <Text style={styles.infoTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Galería de imágenes secundaria */}
          {imageSources.length > 1 && (
            <View style={styles.galleryContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryScrollContent}
              >
                {imageSources.map((src, index) => (
                  <TouchableOpacity
                    key={`${src}-gallery-${index}`}
                    onPress={() => {
                      setViewerIndex(index);
                      setViewerVisible(true);
                    }}
                    activeOpacity={0.85}
                  >
                    <Image
                      source={{ uri: src }}
                      style={[
                        styles.galleryImage,
                        { marginRight: index === imageSources.length - 1 ? 0 : 10 },
                      ]}
                      contentFit="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Botón "Llévame allá" */}
          <View style={styles.takeMeButtonContainer}>
            <Animated.View style={takeMeButtonAnimatedStyle}>
              <TouchableOpacity
                style={styles.takeMeButton}
                onPress={handleTakeMePress}
                testID="open-maps-button"
                activeOpacity={1}
              >
                <Navigation size={20} color="#FFFFFF" />
                <Text style={styles.takeMeButtonText}>Llévame allá</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={styles.contentContainer}>

            <View style={styles.attendeesSection}>
              <Text style={styles.sectionTitle}>Personas que van</Text>
              {attendeeUsers.length === 0 ? (
                <Text style={styles.attendeeEmptyText}>Sé la primera persona en unirse.</Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.attendeeScrollContent}
                >
                  {displayedAttendees.map((user, index) => (
                    <TouchableOpacity
                      key={user.id}
                      onPress={() => handleOpenProfile(user.username)}
                      style={[
                        styles.attendeeAvatarWrapper,
                        index === displayedAttendees.length - 1 && styles.attendeeAvatarWrapperLast,
                      ]}
                      activeOpacity={0.85}
                    >
                      <Image
                        source={{ uri: user.avatar }}
                        style={styles.attendeeAvatar}
                        contentFit="cover"
                      />
                      <Text style={styles.attendeeAvatarName} numberOfLines={1}>
                        {user.name.split(" ")[0]}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  {hasMoreAttendees && (
                    <TouchableOpacity
                      onPress={handleSeeAllAttendees}
                      style={[styles.attendeeMoreButton, { backgroundColor: `${accent}20` }]}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.attendeeMoreText, { color: accent }]}>Invita a tus bros</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              )}
            </View>

            {/* Description - usar vibe si existe, sino description */}
            <Text style={styles.description}>
              {plan.vibe || plan.description || "Plan perfecto si buscas ambiente chill, luces cálidas y música suave."}
            </Text>

            {communityReviews.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Comentarios de la comunidad</Text>
                <View style={styles.communityReviewsList}>
                  {communityReviews.map((review, index) => (
                    <View key={`${review.user}-${index}`} style={styles.communityReviewBubble}>
                      <View style={styles.communityReviewHeader}>
                        <Text style={styles.communityReviewAuthor}>{review.user}</Text>
                        <View style={styles.communityReviewRatingContainer}>
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              size={12}
                              color={i < Math.round(review.rating) ? accent : "#444444"}
                              fill={i < Math.round(review.rating) ? accent : "none"}
                            />
                          ))}
                        </View>
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
                <View style={styles.reviewsContainer}>
                  {remoteReviews.slice(0, 5).map((item) => (
                    <View key={item.id}>
                      {renderRemoteReview({ item })}
                    </View>
                  ))}
                </View>
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

          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>Comentarios</Text>
            {planComments.length === 0 ? (
              <View style={styles.emptyCommentsContainer}>
                <Text style={styles.emptyCommentsText}>Sé la primera persona en comentar.</Text>
              </View>
            ) : (
              <View style={styles.commentsList}>
                {planComments.map((item) => (
                  <View key={item.id}>
                    {renderCommentItem({ item })}
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 84 : 0}
          style={styles.commentComposerWrapper}
        >
          <View style={styles.bottomActionsContainer}>
            {planJoinId ? (
              <Animated.View style={[styles.joinButtonGlow, joinAnimatedStyle]}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleToggleJoin}
                  style={styles.joinButton}
                >
                  <Text style={styles.joinButtonText}>
                    {isJoined ? "Ya vas 🔥" : "Unirme al parche"}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ) : null}

            <View style={styles.commentComposer}>
              <Image
                source={{ uri: currentUser?.avatar || DEFAULT_AVATAR }}
                style={styles.commentComposerAvatar}
              />
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Escribe un comentario..."
                placeholderTextColor="#555555"
                multiline
                style={styles.commentInput}
                keyboardAppearance="dark"
                autoCorrect={true}
                autoCapitalize="sentences"
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={[
                  styles.commentSendButton,
                  { backgroundColor: canSendComment ? accent : '#3A3A3A' },
                ]}
                onPress={handleSendComment}
                activeOpacity={0.8}
                disabled={!canSendComment}
              >
                <Text style={[styles.commentSendButtonText, { color: canSendComment ? '#FFFFFF' : '#777777' }]}>
                  Enviar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

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
  screen: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  scrollContent: {
    paddingBottom: 160,
  },
  // Hero Image - Solo imagen, sin texto
  heroContainer: {
    width: '100%',
    height: 290,
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
  heroGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
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
  // Tarjeta de información estilo Apple/Airbnb
  infoCard: {
    backgroundColor: '#0D0D0D',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: -24,
    marginHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  infoCardTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  infoCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  ratingStarsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 14,
    color: '#9F9F9F',
    marginLeft: 4,
  },
  infoCardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  infoCardLocationText: {
    fontSize: 14,
    color: '#9F9F9F',
    flex: 1,
  },
  infoCardPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  infoPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  infoCardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoTagChip: {
    backgroundColor: '#111111',
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  infoTagText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  // Galería de imágenes secundaria
  galleryContainer: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  galleryScrollContent: {
    paddingRight: 20,
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: 14,
    backgroundColor: '#111111',
  },
  // Botón "Llévame allá"
  takeMeButtonContainer: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  takeMeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderRadius: 30,
    paddingVertical: 16,
    gap: 10,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  takeMeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Content
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  // Attendees Section
  attendeesSection: {
    marginBottom: 24,
  },
  attendeeScrollContent: {
    alignItems: 'center',
    paddingRight: 16,
  },
  attendeeAvatarWrapper: {
    width: 56,
    alignItems: 'center',
    marginRight: 12,
  },
  attendeeAvatarWrapperLast: {
    marginRight: 0,
  },
  attendeeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 6,
    backgroundColor: '#1F1F1F',
  },
  attendeeAvatarName: {
    color: '#BBBBBB',
    fontSize: 12,
    maxWidth: 64,
    textAlign: 'center',
  },
  attendeeMoreButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  attendeeMoreText: {
    fontSize: 13,
    fontWeight: '600',
  },
  attendeeEmptyText: {
    color: '#BBBBBB',
    fontSize: 13,
    marginTop: 8,
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
  communityReviewRatingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  communityReviewRating: {
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
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentBody: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  commentTime: {
    fontSize: 11,
    color: '#888888',
  },
  commentText: {
    fontSize: 13,
    color: '#EAEAEA',
    lineHeight: 18,
    marginBottom: 8,
  },
  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  commentLikeIcon: {
    fontSize: 16,
  },
  commentLikeIconActive: {
    color: '#FFD54F',
  },
  commentLikeCount: {
    fontSize: 12,
    color: '#BBBBBB',
    marginLeft: 4,
  },
  // Comments Section
  commentsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  emptyCommentsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyCommentsText: {
    fontSize: 16,
    color: '#BBBBBB',
    textAlign: 'center',
  },
  commentsList: {
    paddingBottom: 16,
  },
  // Comment Composer
  commentComposerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B0B0B',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 0,
    paddingVertical: 12,
    zIndex: 10,
  },
  bottomActionsContainer: {
    width: '100%',
    gap: 12,
    paddingHorizontal: 16,
  },
  joinButtonGlow: {
    borderRadius: 32,
    overflow: 'visible',
  },
  joinButton: {
    width: '100%',
    backgroundColor: '#181818',
    borderRadius: 32,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  commentComposer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
    width: '100%',
  },
  commentComposerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    paddingVertical: 0,
    paddingHorizontal: 0,
    minHeight: 40,
    maxHeight: 120,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  commentSendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentSendButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
