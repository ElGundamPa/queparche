import React, { useState, useRef, useCallback, memo, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  AppState,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import theme from "@/lib/theme";
import EmptyState from "@/components/EmptyState";
import TikTokShortItem from "@/components/TikTokShortItem";
import { usePlansStore } from "@/hooks/use-plans-store";
import { videoStateManager } from "@/lib/videoStateManager";

const DEBUG = false; // Cambiar a true para logs de desarrollo

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ShortsScreen() {
  const router = useRouter();
  const { shorts, isLoading } = usePlansStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const isScreenFocused = useIsFocused();
  const lastValidIndexRef = useRef(0);
  const flashListRef = useRef<FlashList<any>>(null);

  // Log de inicialización
  useEffect(() => {
    console.log('🛡️ Shorts hardening applied: isFocused, appState, throttleMs (120ms)');
  }, []);

  // Pausar todos los videos cuando la pantalla pierde foco
  useEffect(() => {
    if (!isScreenFocused) {
      if (DEBUG) console.log('[Shorts] Screen unfocused - pausing videos');
      setActiveIndex(-1);
      lastValidIndexRef.current = activeIndex;
    } else if (lastValidIndexRef.current >= 0) {
      // Restaurar último índice válido al volver
      if (DEBUG) console.log('[Shorts] Screen focused - restoring index:', lastValidIndexRef.current);
      setActiveIndex(lastValidIndexRef.current);
    }
  }, [isScreenFocused, activeIndex]);

  // Suscribirse a eventos globales de pausa (AppState)
  useEffect(() => {
    const handleGlobalPause = () => {
      if (DEBUG) console.log('[Shorts] Global pause event received');
      setActiveIndex(-1);
    };

    videoStateManager.on('GLOBAL_PAUSE_VIDEOS', handleGlobalPause);
    return () => videoStateManager.off('GLOBAL_PAUSE_VIDEOS', handleGlobalPause);
  }, []);

  // AppState listener para pausar en background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (DEBUG) console.log('[Shorts] App going to background - pausing videos');
        videoStateManager.pauseAllVideos();
      }
    });

    return () => subscription?.remove();
  }, []);

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0 && isScreenFocused) {
      const newIndex = viewableItems[0].index || 0;
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
        lastValidIndexRef.current = newIndex;
        if (DEBUG) console.log('[Shorts] Active video changed to:', newIndex);
      }
    }
  }, [shorts, isScreenFocused, activeIndex]);

  // Configuración optimizada para viewability
  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 100,
  });

  const handleLike = useCallback((id: string) => {
    if (DEBUG) console.log('[Shorts] Like short:', id);
  }, []);

  const handleComment = useCallback((id: string) => {
    if (DEBUG) console.log('[Shorts] Comment short:', id);
  }, []);

  const handleSave = useCallback((id: string) => {
    if (DEBUG) console.log('[Shorts] Save short:', id);
  }, []);

  const handleShare = useCallback((id: string) => {
    if (DEBUG) console.log('[Shorts] Share short:', id);
  }, []);

  const ShortAnimatedItem = memo(({ item, isActive }: { item: any; isActive: boolean }) => {
    return (
      <View style={{ height: SCREEN_HEIGHT }}>
        <TikTokShortItem
          item={item}
          isActive={isActive}
          onLike={handleLike}
          onComment={handleComment}
          onSave={handleSave}
          onShare={handleShare}
          onTap={() => {}}
        />
      </View>
    );
  });

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const isActive = isScreenFocused && index === activeIndex;
    return <ShortAnimatedItem item={item} isActive={isActive} />;
  }, [activeIndex, isScreenFocused, handleLike, handleComment, handleSave, handleShare]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando shorts...</Text>
      </View>
    );
  }

  if (!shorts || shorts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          type="shorts"
          onAction={() => router.push('/create')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      

      <FlashList
        ref={flashListRef}
        data={shorts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={SCREEN_HEIGHT}
        pagingEnabled={true}
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        viewabilityConfig={viewabilityConfigRef.current}
        onViewableItemsChanged={handleViewableItemsChanged}
        removeClippedSubviews={false}
        maxToRenderPerBatch={4}
        windowSize={5}
        initialNumToRender={3}
        scrollEventThrottle={16}
        testID="tiktok-shorts-list"
        drawDistance={SCREEN_HEIGHT * 2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A0A0A",
  },
  loadingText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#0A0A0A",
  },
});