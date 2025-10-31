import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import Animated, {
  FadeInUp,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, MessageCircle, Bookmark, Share } from "lucide-react-native";

import Colors from "@/constants/colors";
import { Short } from "@/types/plan";
import { scaleTap } from "@/lib/animations";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface TikTokShortItemProps {
  item: Short;
  isActive: boolean;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onSave: (id: string) => void;
  onShare: (id: string) => void;
  onTap: () => void;
}

const TikTokShortItem: React.FC<TikTokShortItemProps> = ({
  item,
  isActive,
  onLike,
  onComment,
  onSave,
  onShare,
  onTap,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const player = useVideoPlayer(item.videoUrl, (player) => {
    player.loop = true;
    player.muted = !isActive; // Solo el video activo tiene audio
    
    if (isActive && !isPaused) {
      player.play();
    } else {
      player.pause();
    }
  });

  // Control de reproducción basado en visibilidad
  useEffect(() => {
    if (isActive && !isPaused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isPaused, player]);

  // Control de audio basado en visibilidad
  useEffect(() => {
    player.muted = !isActive;
  }, [isActive, player]);

  const handleTap = () => {
    setIsPaused(!isPaused);
    onTap();
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(item.id);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave(item.id);
  };

  // Animación scaleTap para cada botón
  const likeAnimation = scaleTap(0.9);
  const commentAnimation = scaleTap(0.9);
  const saveAnimation = scaleTap(0.9);
  const shareAnimation = scaleTap(0.9);

  return (
    <View style={styles.container}>
      {/* Video de fondo */}
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={handleTap}
      >
        <VideoView
          player={player}
          style={styles.video}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />
        
        {/* Overlay de pausa */}
        {isPaused && (
          <Animated.View
            entering={FadeInUp.duration(200).easing(Easing.out(Easing.cubic))}
            style={styles.pauseOverlay}
          >
            <View style={styles.pauseIcon}>
              <View style={styles.pauseBar} />
              <View style={styles.pauseBar} />
            </View>
          </Animated.View>
        )}
      </TouchableOpacity>

      {/* Gradient fade inferior */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
        style={styles.gradient}
        pointerEvents="none"
      />

      {/* Descripción y hashtags (izquierda) */}
      <Animated.View
        entering={FadeInUp.delay(300).duration(400).easing(Easing.out(Easing.cubic))}
        style={styles.descriptionContainer}
      >
        <Text style={styles.placeName}>{item.placeName}</Text>
        <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
        <Text style={styles.hashtag}>#{item.category}</Text>
      </Animated.View>

      {/* Íconos de interacción (derecha) */}
      <Animated.View
        entering={FadeInUp.delay(400).duration(400).easing(Easing.out(Easing.cubic))}
        style={styles.actionsContainer}
      >
        {/* Like */}
        <Animated.View style={likeAnimation.style}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLike}
            onPressIn={likeAnimation.onPressIn}
            onPressOut={likeAnimation.onPressOut}
          >
            <Heart
              size={28}
              color={isLiked ? "#FF3B30" : "white"}
              fill={isLiked ? "#FF3B30" : "transparent"}
            />
            <Text style={styles.actionCount}>{item.likes}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Comment */}
        <Animated.View style={commentAnimation.style}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onComment(item.id)}
            onPressIn={commentAnimation.onPressIn}
            onPressOut={commentAnimation.onPressOut}
          >
            <MessageCircle size={28} color="white" />
            <Text style={styles.actionCount}>{item.comments}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Save */}
        <Animated.View style={saveAnimation.style}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSave}
            onPressIn={saveAnimation.onPressIn}
            onPressOut={saveAnimation.onPressOut}
          >
            <Bookmark
              size={28}
              color={isSaved ? "#FF3B30" : "white"}
              fill={isSaved ? "#FF3B30" : "transparent"}
            />
            <Text style={styles.actionCount}>{item.favorites}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Share */}
        <Animated.View style={shareAnimation.style}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onShare(item.id)}
            onPressIn={shareAnimation.onPressIn}
            onPressOut={shareAnimation.onPressOut}
          >
            <Share size={28} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#0E0E0E",
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
  },
  pauseOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  pauseIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
  },
  pauseBar: {
    width: 4,
    height: 24,
    backgroundColor: "white",
    marginHorizontal: 2,
    borderRadius: 2,
  },
  // Descripción a la izquierda
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
  // Íconos a la derecha
  actionsContainer: {
    position: "absolute",
    right: 15,
    bottom: 100,
    alignItems: "center",
    gap: 20,
  },
  actionButton: {
    alignItems: "center",
  },
  actionCount: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
});

export default TikTokShortItem;
