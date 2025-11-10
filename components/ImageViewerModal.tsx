import React, { useRef, useState } from "react";
import { Modal, View, TouchableOpacity, Dimensions, FlatList, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { X } from "lucide-react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export default function ImageViewerModal({ visible, index, images, onClose }) {
  const [activeIndex, setActiveIndex] = useState(index);
  const scale = useSharedValue(1);
  const flatListRef = useRef<FlatList<string>>(null);

  const handleMomentumScrollEnd = (event: any) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(nextIndex);
    scale.value = 0.96;
    scale.value = withTiming(1, { duration: 220 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />

        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
          <X size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <FlatList
          ref={flatListRef}
          horizontal
          pagingEnabled
          data={images}
          initialScrollIndex={index}
          getItemLayout={(_, itemIndex) => ({
            length: width,
            offset: width * itemIndex,
            index: itemIndex,
          })}
          onScrollToIndexFailed={(info) => {
            const wait = new Promise((resolve) => setTimeout(resolve, 50));
            wait.then(() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToIndex({ index: info.index, animated: false });
              }
            });
          }}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ width, justifyContent: "center", alignItems: "center", paddingHorizontal: width * 0.05 }}>
              <Animated.View style={[styles.imageWrapper, animatedStyle]}>
                <Image
                  source={{ uri: item }}
                  style={styles.image}
                  contentFit="cover"
                />
              </Animated.View>
            </View>
          )}
        />

        <View style={styles.pagination}>
          {images.map((_, dotIndex) => (
            <View
              key={dotIndex}
              style={[
                styles.dot,
                dotIndex === activeIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 48,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  imageWrapper: {
    width: width * 0.9,
    maxHeight: height * 0.6,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotActive: {
    backgroundColor: "#FF3B30",
  },
});

