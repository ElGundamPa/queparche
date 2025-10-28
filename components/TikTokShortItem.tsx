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
  FadeIn,
  SlideInUp,
  SlideOutDown,
} from "react-native-reanimated";
import { Heart, MessageCircle, Bookmark, Share } from "lucide-react-native";

import Colors from "@/constants/colors";
import { Short } from "@/types/plan";

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

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.container}
    >
      {/* Video */}
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
            entering={FadeIn.duration(200)}
            style={styles.pauseOverlay}
          >
            <View style={styles.pauseIcon}>
              <View style={styles.pauseBar} />
              <View style={styles.pauseBar} />
            </View>
          </Animated.View>
        )}
      </TouchableOpacity>

      {/* Contenido del video */}
      <View style={styles.content}>
        {/* Información del video (izquierda) */}
        <View style={styles.videoInfo}>
          <Animated.View
            entering={SlideInUp.delay(500).duration(400)}
            style={styles.infoContainer}
          >
            <Text style={styles.placeName}>{item.placeName}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>#{item.category}</Text>
            </View>
          </Animated.View>
        </View>

        {/* Botones de interacción (derecha) */}
        <Animated.View
          entering={SlideInUp.delay(700).duration(400)}
          style={styles.actionsContainer}
        >
          {/* Like */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLike}
          >
            <Heart
              size={32}
              color={isLiked ? "#FF4444" : "white"}
              fill={isLiked ? "#FF4444" : "transparent"}
            />
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>

          {/* Comentarios */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onComment(item.id)}
          >
            <MessageCircle size={32} color="white" />
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>

          {/* Guardar */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSave}
          >
            <Bookmark
              size={32}
              color={isSaved ? Colors.light.primary : "white"}
              fill={isSaved ? Colors.light.primary : "transparent"}
            />
            <Text style={styles.actionText}>{item.favorites}</Text>
          </TouchableOpacity>

          {/* Compartir */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onShare(item.id)}
          >
            <Share size={32} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "black",
  },
  videoContainer: {
    flex: 1,
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
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
  content: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  videoInfo: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 20,
  },
  infoContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 16,
    padding: 16,
    backdropFilter: "blur(12px)",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  placeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "white",
    lineHeight: 20,
    marginBottom: 8,
  },
  categoryContainer: {
    alignSelf: "flex-start",
  },
  category: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: "600",
  },
  actionsContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 20,
  },
  actionButton: {
    alignItems: "center",
    marginBottom: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    minWidth: 48,
    minHeight: 48,
    justifyContent: "center",
  },
  actionText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
});

export default TikTokShortItem;
