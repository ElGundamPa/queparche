import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { VideoView, useVideoPlayer } from "expo-video";
import { Image } from "expo-image";
import { Heart, Bookmark, X, Share2, MessageCircle } from "lucide-react-native";

import Colors from "@/constants/colors";
import { usePlansStore } from "@/hooks/use-plans-store";
import CommentModal from "@/components/CommentModal";

const { width, height } = Dimensions.get("window");

export default function ShortDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { shorts, likeShort, favoriteShort } = usePlansStore();
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  const short = shorts.find((s) => s.id === id);

  if (!short) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Short no encontrado</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleLike = () => {
    if (!liked) {
      likeShort(short.id);
      setLiked(true);
    }
  };

  const handleFavorite = () => {
    if (!favorited) {
      favoriteShort(short.id);
      setFavorited(true);
    }
  };

  const handleShare = () => {
    console.log("Share short:", short.id);
  };

  const handleComments = () => {
    setShowComments(true);
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <View style={styles.container} testID={`short-detail-${short.id}`}>
        {Platform.OS !== "web" ? (
          <VideoView
            player={useVideoPlayer(short.videoUrl, (player) => {
              player.loop = true;
              player.play();
            })}
            style={styles.video}
            allowsFullscreen
            allowsPictureInPicture
            isMuted={false}
          />
        ) : (
          <Image
            source={{ uri: short.thumbnailUrl }}
            style={styles.image}
            contentFit="cover"
          />
        )}
        
        <View style={styles.overlay} />
        
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          testID="close-button"
        >
          <X size={24} color={Colors.light.white} />
        </TouchableOpacity>
        
        <View style={styles.contentContainer}>
          <View style={styles.info}>
            <Text style={styles.placeName}>{short.placeName}</Text>
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>{short.category}</Text>
            </View>
            <Text style={styles.description}>{short.description}</Text>
          </View>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLike}
              testID="like-button"
            >
              <Heart
                size={28}
                color={liked ? Colors.light.error : Colors.light.white}
                fill={liked ? Colors.light.error : "none"}
              />
              <Text style={styles.actionText}>{short.likes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleFavorite}
              testID="favorite-button"
            >
              <Bookmark
                size={28}
                color={favorited ? Colors.light.secondary : Colors.light.white}
                fill={favorited ? Colors.light.secondary : "none"}
              />
              <Text style={styles.actionText}>{short.favorites}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleComments}
              testID="comments-button"
            >
              <MessageCircle size={28} color={Colors.light.white} />
              <Text style={styles.actionText}>{short.comments}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShare}
              testID="share-button"
            >
              <Share2 size={28} color={Colors.light.white} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <CommentModal
          visible={showComments}
          onClose={() => setShowComments(false)}
          shortId={short.id}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.black,
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
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.white,
  },
  video: {
    width: width,
    height: height,
  },
  image: {
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  contentContainer: {
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
  placeName: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.light.white,
    marginBottom: 8,
  },
  categoryContainer: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.white,
  },
  description: {
    fontSize: 16,
    color: Colors.light.white,
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 14,
    color: Colors.light.white,
    marginTop: 4,
  },
});