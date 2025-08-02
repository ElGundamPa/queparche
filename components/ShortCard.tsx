import { useRouter } from "expo-router";
import React, { useState, memo, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Heart, Bookmark, MessageCircle } from "lucide-react-native";

import Colors from "@/constants/colors";
import { usePlansStore } from "@/hooks/use-plans-store";
import { Short } from "@/types/plan";
import CommentModal from "./CommentModal";

interface ShortCardProps {
  short: Short;
  isOverlay?: boolean;
}

const { width, height } = Dimensions.get("window");

const ShortCard = memo(function ShortCard({ short, isOverlay = false }: ShortCardProps) {
  const router = useRouter();
  const { likeShort, favoriteShort } = usePlansStore();
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handlePress = useCallback(() => {
    router.push(`/short/${short.id}`);
  }, [router, short.id]);

  const handleLike = useCallback(() => {
    if (!liked) {
      likeShort(short.id);
      setLiked(true);
    }
  }, [liked, likeShort, short.id]);

  const handleFavorite = useCallback(() => {
    if (!favorited) {
      favoriteShort(short.id);
      setFavorited(true);
    }
  }, [favorited, favoriteShort, short.id]);

  const handleComments = useCallback(() => {
    setShowComments(true);
  }, []);

  return (
    <>
      <TouchableOpacity
        style={[styles.card, isOverlay && styles.overlayCard]}
        onPress={handlePress}
        testID={`short-card-${short.id}`}
      >
        {!isOverlay && (
          <>
            <Image
              source={{ uri: short.thumbnailUrl }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.overlay} />
          </>
        )}
        <View style={[styles.content, isOverlay && styles.overlayContent]}>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {short.placeName}
            </Text>
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>{short.category}</Text>
            </View>
            <Text style={styles.description} numberOfLines={2}>
              {short.description}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLike}
              testID={`like-button-${short.id}`}
            >
              <Heart
                size={24}
                color={liked ? Colors.light.error : Colors.light.white}
                fill={liked ? Colors.light.error : "none"}
              />
              <Text style={styles.actionText}>{short.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleFavorite}
              testID={`favorite-button-${short.id}`}
            >
              <Bookmark
                size={24}
                color={favorited ? Colors.light.secondary : Colors.light.white}
                fill={favorited ? Colors.light.secondary : "none"}
              />
              <Text style={styles.actionText}>{short.favorites}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleComments}
              testID={`comment-button-${short.id}`}
            >
              <MessageCircle size={24} color={Colors.light.white} />
              <Text style={styles.actionText}>{short.comments}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      <CommentModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        shortId={short.id}
      />
    </>
  );
});

export default ShortCard;

const styles = StyleSheet.create({
  card: {
    width: width,
    height: height - 150,
    backgroundColor: Colors.light.background,
    position: "relative",
  },
  overlayCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  overlayContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  info: {
    flex: 1,
    marginRight: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.light.white,
    marginBottom: 4,
  },
  categoryContainer: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.light.background,
  },
  description: {
    fontSize: 14,
    color: Colors.light.white,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 12,
    color: Colors.light.white,
    marginTop: 4,
  },
});