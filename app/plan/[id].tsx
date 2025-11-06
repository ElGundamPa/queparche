import React, { useState, useEffect, useMemo } from "react";
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
  TextInput,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { 
  MapPin, 
  Users, 
  Calendar, 
  Navigation, 
  Star, 
  Heart, 
  MessageCircle, 
  Share2,
  Crown,
  Send,
  ArrowLeft
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "@/constants/colors";
import { usePlansStore } from "@/hooks/use-plans-store";
import { useUserStore } from "@/hooks/use-user-store";
import { trpc } from "@/lib/trpc";
import FallbackScreen from "@/components/FallbackScreen";
import { storage } from "@/lib/storage";
import { mockPlans } from "@/mocks/plans";

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { plans, joinPlan, likePlan } = usePlansStore();
  const { user } = useUserStore();
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
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
  
  // Fetch reviews and comments
  const reviewsQuery = trpc.reviews.getByPlan.useQuery({ planId: id || "" }, {
    enabled: !!id && !!plan,
  });
  const commentsQuery = trpc.comments.getByPlan.useQuery({ planId: id || "" }, {
    enabled: !!id && !!plan,
  });
  const createCommentMutation = trpc.comments.createPlanComment.useMutation({
    onSuccess: () => {
      commentsQuery.refetch();
      setNewComment("");
    },
  });

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
          // Try to refresh plans data
          router.replace('/(tabs)');
        }}
      />
    );
  }

  const reviews = reviewsQuery.data || [];
  const comments = commentsQuery.data || [];

  const handleJoinPlan = () => {
    if (plan.currentPeople >= plan.maxPeople) {
      Alert.alert(
        "Plan lleno",
        "Este plan ha alcanzado su número máximo de participantes."
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    joinPlan(plan.id);
    Alert.alert(
      "¡Te uniste al plan!",
      "Te has unido exitosamente a este plan. ¡Nos vemos allá!",
      [{ text: "OK" }]
    );
  };

  const handleLike = () => {
    if (!liked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      likePlan(plan.id);
      setLiked(true);
    }
  };

  const handleOpenMaps = () => {
    const { latitude, longitude } = plan.location;
    const label = encodeURIComponent(plan.name);
    
    let url;
    if (Platform.OS === "ios") {
      url = `maps:0,0?q=${label}@${latitude},${longitude}`;
    } else if (Platform.OS === "android") {
      url = `geo:0,0?q=${latitude},${longitude}(${label})`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    }
    
    Linking.openURL(url).catch((err) => {
      console.error("Error opening maps:", err);
      Alert.alert("Error", "No se pudo abrir la aplicación de mapas");
    });
  };

  const handleSendComment = () => {
    if (!newComment.trim() || !user) return;

    createCommentMutation.mutate({
      planId: plan.id,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: newComment.trim(),
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        color={i < rating ? Colors.light.premium : Colors.light.darkGray}
        fill={i < rating ? Colors.light.premium : "none"}
      />
    ));
  };

  const renderReview = ({ item }: { item: any }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: item.userAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000" }}
          style={styles.reviewAvatar}
          contentFit="cover"
        />
        <View style={styles.reviewInfo}>
          <View style={styles.reviewNameRow}>
            <Text style={styles.reviewUserName}>{item.userName}</Text>
            {item.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
          </View>
          <View style={styles.reviewStars}>
            {renderStars(item.rating)}
          </View>
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
      <Text style={styles.reviewDate}>
        {new Date(item.createdAt).toLocaleDateString('es-ES')}
      </Text>
    </View>
  );

  const renderComment = ({ item }: { item: any }) => (
    <View style={styles.commentItem}>
      <Image
        source={{ uri: item.userAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000" }}
        style={styles.commentAvatar}
        contentFit="cover"
      />
      <View style={styles.commentContent}>
        <Text style={styles.commentUserName}>{item.userName}</Text>
        <Text style={styles.commentText}>{item.content}</Text>
        <Text style={styles.commentDate}>
          {new Date(item.createdAt).toLocaleDateString('es-ES')}
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: plan.name,
          headerTransparent: true,
          headerTintColor: Colors.light.white,
          headerStyle: {
            backgroundColor: "transparent",
          },
        }}
      />
      <StatusBar style="light" />
      <ScrollView style={styles.container} testID={`plan-detail-${plan.id}`}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: plan.images[0] }}
            style={styles.image}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.overlay}
          />
          
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            testID="back-button"
          >
            <ArrowLeft size={24} color={Colors.light.white} />
          </TouchableOpacity>
          
          {plan.isPremium && (
            <View style={styles.premiumBadge}>
              <Crown size={16} color={Colors.light.premium} />
              <Text style={styles.premiumText}>PREMIUM</Text>
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.name}>{plan.name}</Text>
              <View style={styles.ratingContainer}>
                <Star size={16} color={Colors.light.premium} fill={Colors.light.premium} />
                <Text style={styles.ratingText}>{plan.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>({plan.reviewCount})</Text>
              </View>
            </View>
            
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>{plan.category}</Text>
            </View>
          </View>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <MapPin size={20} color={Colors.light.primary} />
              <Text style={styles.infoText}>
                {plan.location.address || "Medellín, Colombia"}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Users size={20} color={Colors.light.primary} />
              <Text style={styles.infoText}>
                {plan.currentPeople}/{plan.maxPeople} personas
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Calendar size={20} color={Colors.light.primary} />
              <Text style={styles.infoText}>
                {formatDate(plan.createdAt)}
              </Text>
            </View>
          </View>

          {plan.price && plan.price > 0 && (
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Precio:</Text>
              <Text style={styles.priceText}>
                ${plan.price.toLocaleString()} COP
              </Text>
            </View>
          )}
          
          {/* Tags/Amenities */}
          {plan.tags && plan.tags.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Amenidades</Text>
              <View style={styles.tagsContainer}>
                {plan.tags.map((tag, index) => (
                  <View key={index} style={styles.tagItem}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
          
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{plan.description}</Text>
          
          <Text style={styles.sectionTitle}>Creado por</Text>
          <Text style={styles.createdBy}>{plan.createdBy}</Text>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLike}
            >
              <Heart 
                size={20} 
                color={liked ? Colors.light.error : Colors.light.text}
                fill={liked ? Colors.light.error : "none"}
              />
              <Text style={styles.actionButtonText}>{plan.likes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowComments(!showComments)}
            >
              <MessageCircle size={20} color={Colors.light.text} />
              <Text style={styles.actionButtonText}>{comments.length}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={20} color={Colors.light.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.joinButton,
                plan.currentPeople >= plan.maxPeople && styles.disabledButton
              ]}
              onPress={handleJoinPlan}
              disabled={plan.currentPeople >= plan.maxPeople}
              testID="join-plan-button"
            >
              <LinearGradient
                colors={plan.currentPeople >= plan.maxPeople 
                  ? [Colors.light.darkGray, Colors.light.darkGray]
                  : [Colors.light.primary, '#00B894']
                }
                style={styles.joinButtonGradient}
              >
                <Text style={styles.joinButtonText}>
                  {plan.currentPeople >= plan.maxPeople
                    ? "Plan lleno"
                    : "Únete al plan"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.mapsButton}
              onPress={handleOpenMaps}
              testID="open-maps-button"
            >
              <Navigation size={20} color={Colors.light.white} />
              <Text style={styles.mapsButtonText}>¡Llévame allá!</Text>
            </TouchableOpacity>
          </View>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Reseñas ({reviews.length})</Text>
              <FlatList
                data={reviews.slice(0, 3)}
                keyExtractor={(item) => item.id}
                renderItem={renderReview}
                scrollEnabled={false}
              />
            </>
          )}

          {/* Comments Section */}
          {showComments && (
            <>
              <Text style={styles.sectionTitle}>Comentarios</Text>
              
              {/* Comment Input */}
              <View style={styles.commentInputContainer}>
                <Image
                  source={{ uri: user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000" }}
                  style={styles.commentInputAvatar}
                  contentFit="cover"
                />
                <TextInput
                  style={styles.commentInput}
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder="Escribe un comentario..."
                  placeholderTextColor={Colors.light.darkGray}
                  multiline
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSendComment}
                  disabled={!newComment.trim()}
                >
                  <Send size={16} color={Colors.light.primary} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                renderItem={renderComment}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={styles.emptyCommentsText}>
                    No hay comentarios aún. ¡Sé el primero en comentar!
                  </Text>
                }
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
    backgroundColor: Colors.light.background,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.background,
  },
  imageContainer: {
    height: 320,
    width: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  premiumBadge: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: Colors.light.black,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.light.premium,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.premium,
  },
  contentContainer: {
    padding: 20,
    marginTop: -40,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.light.text,
    flex: 1,
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.light.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.light.darkGray,
  },
  categoryContainer: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.black,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: Colors.light.card,
    padding: 12,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 16,
    color: Colors.light.text,
    marginRight: 8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 12,
    marginTop: 20,
  },
  description: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 20,
  },
  createdBy: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: '600',
  },
  buttonsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  joinButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  joinButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.white,
  },
  mapsButton: {
    backgroundColor: Colors.light.info,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  mapsButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.white,
    marginLeft: 8,
  },
  reviewItem: {
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginRight: 8,
  },
  verifiedBadge: {
    backgroundColor: Colors.light.verified,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  verifiedText: {
    fontSize: 10,
    color: Colors.light.white,
    fontWeight: '600',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.light.darkGray,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  commentInputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    maxHeight: 80,
  },
  sendButton: {
    padding: 8,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 12,
    color: Colors.light.darkGray,
  },
  emptyCommentsText: {
    fontSize: 14,
    color: Colors.light.darkGray,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  tagItem: {
    backgroundColor: Colors.light.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  tagText: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: '500',
  },
});