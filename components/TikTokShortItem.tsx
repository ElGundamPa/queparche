import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
} from "react-native";
import { VideoView } from "expo-video";
import Animated, { FadeInUp, useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { Short } from "@/types/plan";
import { useActiveVideo } from "@/hooks/useActiveVideo";
import { ShortOverlay } from "./ShortOverlay";

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

const DEBUG_ITEM = true; // Cambiar a false para producción

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
  const [isFastForwarding, setIsFastForwarding] = useState(false);

  // Debug: Log cuando isActive cambia
  React.useEffect(() => {
    if (DEBUG_ITEM) {
      console.log(`[TikTokShortItem] ${item.placeName} - isActive: ${isActive}, isPaused: ${isPaused}`);
    }
  }, [isActive, isPaused, item.placeName]);

  // Hook optimizado para manejo de video
  // Pasar isActive directamente (sin considerar isPaused aquí, el hook lo maneja)
  const { player, togglePlayPause, progress, setSpeed } = useActiveVideo({
    videoUrl: item.videoUrl,
    isActive: isActive && !isPaused, // Solo activo si está visible Y no está pausado manualmente
    autoPlay: true,
    loop: true,
  });

  // Animación de barra de progreso
  const progressWidth = useSharedValue(0);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress * 100}%`,
    opacity: withTiming(isActive ? 0.95 : 0, { duration: 200 }),
  }));

  const handleTap = () => {
    togglePlayPause();
    setIsPaused(!isPaused);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTap();
  };

  const handlePressIn = (e: any) => {
    const { pageX, pageY } = e.nativeEvent;
    // Esquina superior derecha (75% width y 25% height)
    if (pageX > SCREEN_WIDTH * 0.75 && pageY < SCREEN_HEIGHT * 0.25) {
      setIsFastForwarding(true);
      setSpeed(2.0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePressOut = () => {
    if (isFastForwarding) {
      setIsFastForwarding(false);
      setSpeed(1.0);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLike(item.id);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSave(item.id);
  };

  return (
    <View style={styles.container}>
      {/* Video de fondo */}
      <Pressable
        style={styles.videoContainer}
        onPress={handleTap}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <VideoView
          player={player}
          style={styles.video}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />
        
        {/* Barra de progreso superior */}
        <Animated.View style={[styles.progressBar, progressStyle]} />
        
        {/* Indicador de velocidad 2x */}
        {isFastForwarding && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            style={styles.speedIndicator}
          >
            <View style={styles.speedBadge}>
              <Text style={styles.speedText}>2x</Text>
            </View>
          </Animated.View>
        )}
        
        {/* Overlay de pausa */}
        {isPaused && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            style={styles.pauseOverlay}
          >
            <View style={styles.pauseIcon}>
              <View style={styles.pauseBar} />
              <View style={styles.pauseBar} />
            </View>
          </Animated.View>
        )}
      </Pressable>

      {/* Overlay desacoplado */}
      <ShortOverlay
        short={item}
        isActive={isActive}
        isLiked={isLiked}
        isSaved={isSaved}
        onLike={handleLike}
        onComment={onComment}
        onSave={handleSave}
        onShare={onShare}
      />
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
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 3,
    backgroundColor: "#FF3B30",
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  speedIndicator: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10,
  },
  speedBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  speedText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
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
});

export default TikTokShortItem;
