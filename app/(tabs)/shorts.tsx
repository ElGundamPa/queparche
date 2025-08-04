import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { Plus } from "lucide-react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

import Colors from "@/constants/colors";
import ShortCard from "@/components/ShortCard";
import { usePlansStore } from "@/hooks/use-plans-store";

const { height, width } = Dimensions.get("window");
const ITEM_HEIGHT = height;

interface ShortItemProps {
  item: any;
  index: number;
  activeIndex: number;
  isVisible: boolean;
}

const ShortItem: React.FC<ShortItemProps> = ({ item, index, activeIndex, isVisible }) => {
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isVisible && index === activeIndex) {
        videoRef.current.playAsync();
      } else {
        videoRef.current.pauseAsync();
      }
    }
  }, [isVisible, activeIndex, index]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setIsBuffering(status.isBuffering || false);
    } else if (!status.isLoaded && 'error' in status && status.error) {
      console.error('Video playback error:', status.error);
      setVideoError(true);
    }
  };

  const handleError = (error: string) => {
    console.error('Video load error:', error);
    setVideoError(true);
    setIsLoading(false);
  };

  const handleRetry = () => {
    setVideoError(false);
    setIsLoading(true);
    if (videoRef.current) {
      videoRef.current.loadAsync({ uri: item.videoUrl }, {}, false);
    }
  };

  return (
    <Animated.View style={styles.shortContainer}>
      {Platform.OS !== "web" ? (
        <>
          {videoError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error al cargar el video</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={handleRetry}
              >
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Video
                ref={videoRef}
                source={{ uri: item.videoUrl }}
                style={styles.video}
                resizeMode={ResizeMode.COVER}
                shouldPlay={false} // Control manually
                isLooping
                isMuted={false}
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                onError={handleError}
                useNativeControls={false}
              />
              {(isLoading || isBuffering) && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={Colors.light.primary} />
                  <Text style={styles.loadingText}>
                    {isLoading ? 'Cargando video...' : 'Buffering...'}
                  </Text>
                </View>
              )}
            </>
          )}
          <ShortCard short={item} isOverlay={true} />
        </>
      ) : (
        <ShortCard short={item} />
      )}
    </Animated.View>
  );
};

export default function ShortsScreen() {
  const router = useRouter();
  const { shorts, isLoading } = usePlansStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const translateY = useSharedValue(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0 && !isScrolling) {
      const newIndex = viewableItems[0].index || 0;
      setActiveIndex(newIndex);
    }
  }, [isScrolling]);

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: { 
        itemVisiblePercentThreshold: 80,
        minimumViewTime: 300
      },
      onViewableItemsChanged: handleViewableItemsChanged,
    },
  ]);

  const handleCreatePress = () => {
    router.push("/create-short");
  };

  const scrollToIndex = (index: number) => {
    if (flatListRef.current && index >= 0 && index < shorts.length) {
      flatListRef.current.scrollToIndex({ index, animated: true });
      setActiveIndex(index);
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      runOnJS(setIsScrolling)(true);
    },
    onActive: (event) => {
      translateY.value = event.translationY;
    },
    onEnd: (event) => {
      const threshold = ITEM_HEIGHT * 0.3;
      
      if (event.translationY > threshold && activeIndex > 0) {
        // Swipe down - go to previous
        runOnJS(scrollToIndex)(activeIndex - 1);
      } else if (event.translationY < -threshold && activeIndex < shorts.length - 1) {
        // Swipe up - go to next
        runOnJS(scrollToIndex)(activeIndex + 1);
      }
      
      translateY.value = withSpring(0);
      runOnJS(setIsScrolling)(false);
    },
  });

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const isVisible = Math.abs(index - activeIndex) <= 1;
    return (
      <ShortItem 
        item={item} 
        index={index} 
        activeIndex={activeIndex} 
        isVisible={isVisible}
      />
    );
  }, [activeIndex]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Cargando shorts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {shorts.length > 0 ? (
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={styles.container}>
            <FlatList
              ref={flatListRef}
              data={shorts}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              getItemLayout={getItemLayout}
              pagingEnabled
              showsVerticalScrollIndicator={false}
              viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
              removeClippedSubviews={Platform.OS === 'android'}
              maxToRenderPerBatch={3}
              windowSize={5}
              initialNumToRender={2}
              scrollEnabled={!isScrolling}
              onScrollBeginDrag={() => setIsScrolling(true)}
              onScrollEndDrag={() => setIsScrolling(false)}
              testID="shorts-list"
            />
          </Animated.View>
        </PanGestureHandler>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay shorts disponibles</Text>
          <Text style={styles.emptySubtext}>
            ¡Sé el primero en compartir un video corto de tu lugar favorito!
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreatePress}
        testID="create-short-button"
      >
        <Plus size={24} color={Colors.light.background} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  shortContainer: {
    width: width,
    height: ITEM_HEIGHT,
    position: 'relative',
  },
  video: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.card,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.light.white,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loadingText: {
    color: Colors.light.white,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.light.darkGray,
    textAlign: "center",
  },
  createButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: Colors.light.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});