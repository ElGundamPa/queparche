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

const DEBUG = true; // Cambiar a false para producción

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
    if (!isScreenFocused) {
      // Si la pantalla no está enfocada, pausar todo
      if (activeIndex !== -1) {
        setActiveIndex(-1);
      }
      return;
    }

    // Encontrar el item más visible basado en viewability
    if (viewableItems.length > 0) {
      // Buscar el primer item que esté marcado como viewable
      const viewableItem = viewableItems.find((item: any) => item.isViewable);
      
      if (viewableItem && viewableItem.index !== null && viewableItem.index !== undefined) {
        const newIndex = viewableItem.index;
        if (newIndex !== activeIndex) {
          if (DEBUG) console.log(`[Shorts] 🔄 Active video: ${activeIndex} → ${newIndex}`);
          setActiveIndex(newIndex);
          lastValidIndexRef.current = newIndex;
        }
      } else if (viewableItems.length > 0) {
        // Si hay items pero ninguno está marcado como viewable, usar el primero
        const firstItem = viewableItems[0];
        if (firstItem && firstItem.index !== null && firstItem.index !== undefined) {
          const newIndex = firstItem.index;
          if (newIndex !== activeIndex) {
            if (DEBUG) console.log(`[Shorts] 🔄 Active video (fallback): ${activeIndex} → ${newIndex}`);
            setActiveIndex(newIndex);
            lastValidIndexRef.current = newIndex;
          }
        }
      }
    } else {
      // Si no hay items visibles, pausar todo
      if (activeIndex !== -1) {
        if (DEBUG) console.log('[Shorts] ⏸️ No visible items, pausing all');
        setActiveIndex(-1);
      }
    }
  }, [isScreenFocused, activeIndex]);

  // Configuración optimizada para viewability - más estricta
  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 90, // Solo considerar visible si está 90% visible
    minimumViewTime: 200, // Esperar 200ms antes de considerar visible
    waitForInteraction: false,
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
    // Validar que el item exista antes de renderizar
    if (!item || !item.id) {
      return (
        <View style={{ height: SCREEN_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.textSecondary }}>Item no disponible</Text>
        </View>
      );
    }

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

  ShortAnimatedItem.displayName = 'ShortAnimatedItem';

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    // Validar item antes de renderizar
    if (!item || !item.id) {
      if (DEBUG) console.error('[Shorts] Item inválido en índice:', index, item);
      return (
        <View style={{ height: SCREEN_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.textSecondary }}>Item no disponible</Text>
        </View>
      );
    }

    // Validar videoUrl
    if (!item.videoUrl || typeof item.videoUrl !== 'string') {
      if (DEBUG) console.error('[Shorts] videoUrl inválido en item:', item.id, 'videoUrl:', item.videoUrl);
      return (
        <View style={{ height: SCREEN_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.textSecondary }}>Video URL no válido</Text>
        </View>
      );
    }

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