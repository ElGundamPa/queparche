import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { VideoView } from "expo-video";
import Animated, { FadeInUp } from "react-native-reanimated";

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

  // Hook optimizado para manejo de video
  const { player, togglePlayPause } = useActiveVideo({
    videoUrl: item.videoUrl,
    isActive: isActive && !isPaused,
    autoPlay: true,
    loop: true,
  });

  const handleTap = () => {
    togglePlayPause();
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
            entering={FadeInUp.duration(200)}
            style={styles.pauseOverlay}
          >
            <View style={styles.pauseIcon}>
              <View style={styles.pauseBar} />
              <View style={styles.pauseBar} />
            </View>
          </Animated.View>
        )}
      </TouchableOpacity>

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
