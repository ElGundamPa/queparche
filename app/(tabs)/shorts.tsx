import React, { useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { Plus } from "lucide-react-native";

import Colors from "@/constants/colors";
import ShortCard from "@/components/ShortCard";
import { usePlansStore } from "@/hooks/use-plans-store";

const { height } = Dimensions.get("window");

interface ShortItemProps {
  item: any;
  index: number;
  activeIndex: number;
}

const ShortItem: React.FC<ShortItemProps> = ({ item, index, activeIndex }) => {
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      if (status.error) {
        console.error('Video playback error:', status.error);
        setVideoError(true);
      }
    }
  };

  const handleError = (error: string) => {
    console.error('Video load error:', error);
    setVideoError(true);
    setIsLoading(false);
  };

  return (
    <View style={styles.shortContainer}>
      {Platform.OS !== "web" ? (
        <>
          {videoError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error al cargar el video</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  setVideoError(false);
                  setIsLoading(true);
                }}
              >
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Video
                source={{ uri: item.videoUrl }}
                style={styles.video}
                resizeMode={ResizeMode.COVER}
                shouldPlay={index === activeIndex && !videoError}
                isLooping
                isMuted={false}
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                onError={handleError}
                useNativeControls={false}
              />
              {isLoading && (
                <View style={styles.loadingOverlay}>
                  <Text style={styles.loadingText}>Cargando video...</Text>
                </View>
              )}
            </>
          )}
          <ShortCard short={item} isOverlay={true} />
        </>
      ) : (
        <ShortCard short={item} />
      )}
    </View>
  );
};

export default function ShortsScreen() {
  const router = useRouter();
  const { shorts } = usePlansStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: { itemVisiblePercentThreshold: 50 },
      onViewableItemsChanged: handleViewableItemsChanged,
    },
  ]);

  const handleCreatePress = () => {
    router.push("/create-short");
  };

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    return <ShortItem item={item} index={index} activeIndex={activeIndex} />;
  }, [activeIndex]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: height - 150,
      offset: (height - 150) * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {shorts.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={shorts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
          removeClippedSubviews={true}
          maxToRenderPerBatch={2}
          windowSize={3}
          initialNumToRender={1}
          testID="shorts-list"
        />
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
  shortContainer: {
    width: "100%",
    height: height - 150,
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