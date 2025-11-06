import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, Bookmark, Share } from 'lucide-react-native';
import { scaleTap } from '@/lib/animations';
import { Short } from '@/types/plan';

interface ShortOverlayProps {
  short: Short;
  isActive: boolean;
  isLiked: boolean;
  isSaved: boolean;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onSave: (id: string) => void;
  onShare: (id: string) => void;
}

/**
 * Overlay desacoplado para Shorts que no se re-renderiza en cada scroll
 * Solo se anima cuando isActive cambia
 */
export const ShortOverlay = memo(({
  short,
  isActive,
  isLiked,
  isSaved,
  onLike,
  onComment,
  onSave,
  onShare,
}: ShortOverlayProps) => {
  const router = useRouter();
  // Animaciones de tap para cada botón
  const likeAnimation = scaleTap(0.9);
  const commentAnimation = scaleTap(0.9);
  const saveAnimation = scaleTap(0.9);
  const shareAnimation = scaleTap(0.9);

  // Navegar al short detail cuando se toca el título
  const handlePlaceNamePress = () => {
    if (short?.id) {
      router.push(`/short/${short.id}`);
    }
  };

  // Solo renderizar cuando el video es activo
  if (!isActive) {
    return null;
  }

  return (
    <>
      {/* Gradient fade inferior */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
        style={styles.gradient}
        pointerEvents="none"
      />

      {/* Descripción y hashtags (izquierda) */}
      <Animated.View
        entering={FadeInUp.delay(200).duration(300).easing(Easing.out(Easing.cubic))}
        style={styles.descriptionContainer}
      >
        <TouchableOpacity onPress={handlePlaceNamePress} disabled={!short?.id}>
          <Text style={styles.placeName} numberOfLines={1}>{short?.placeName || 'Sin nombre'}</Text>
        </TouchableOpacity>
        <Text style={styles.description} numberOfLines={2}>{short?.description || ''}</Text>
        <Text style={styles.hashtag}>#{short?.category || 'general'}</Text>
      </Animated.View>

      {/* Íconos de interacción (derecha) */}
      <Animated.View
        entering={FadeInUp.delay(250).duration(300).easing(Easing.out(Easing.cubic))}
        style={styles.actionsContainer}
      >
        {/* Like */}
        <Animated.View style={likeAnimation.style}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onLike(short?.id || '')}
            onPressIn={likeAnimation.onPressIn}
            onPressOut={likeAnimation.onPressOut}
          >
            <Heart
              size={24}
              color={isLiked ? "#FF3B30" : "white"}
              fill={isLiked ? "#FF3B30" : "transparent"}
            />
            <Text style={styles.actionCount}>{short?.likes || 0}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Comment */}
        <Animated.View style={commentAnimation.style}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onComment(short?.id || '')}
            onPressIn={commentAnimation.onPressIn}
            onPressOut={commentAnimation.onPressOut}
          >
            <MessageCircle size={24} color="white" />
            <Text style={styles.actionCount}>{short?.comments || 0}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Save */}
        <Animated.View style={saveAnimation.style}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onSave(short?.id || '')}
            onPressIn={saveAnimation.onPressIn}
            onPressOut={saveAnimation.onPressOut}
          >
            <Bookmark
              size={24}
              color={isSaved ? "#FF3B30" : "white"}
              fill={isSaved ? "#FF3B30" : "transparent"}
            />
            <Text style={styles.actionCount}>{short?.favorites || 0}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Share */}
        <Animated.View style={shareAnimation.style}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onShare(short?.id || '')}
            onPressIn={shareAnimation.onPressIn}
            onPressOut={shareAnimation.onPressOut}
          >
            <Share size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </>
  );
});

ShortOverlay.displayName = 'ShortOverlay';

const styles = StyleSheet.create({
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
  },
  descriptionContainer: {
    position: "absolute",
    bottom: 90,
    left: 12,
    right: 70,
  },
  placeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "white",
    lineHeight: 20,
    marginBottom: 4,
  },
  hashtag: {
    fontSize: 14,
    color: "#FF3B30",
    fontWeight: "600",
  },
  actionsContainer: {
    position: "absolute",
    right: 14,
    bottom: 100,
    alignItems: "center",
    gap: 26,
  },
  actionButton: {
    alignItems: "center",
  },
  actionCount: {
    color: "#D9D9D9",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
});

