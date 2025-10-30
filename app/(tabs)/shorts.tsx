import React, { useState, useRef, useCallback, useEffect, memo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Plus } from "lucide-react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { scaleTap } from "@/lib/animations";
import Toast from "react-native-toast-message";

import theme from "@/lib/theme";
import EmptyState from "@/components/EmptyState";
import TikTokShortItem from "@/components/TikTokShortItem";
import { usePlansStore } from "@/hooks/use-plans-store";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ShortsScreen() {
  const router = useRouter();
  const { shorts, isLoading } = usePlansStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Debug: Log shorts data
  console.log('=== TIKTOK SHORTS DEBUG ===');
  console.log('Shorts data:', shorts);
  console.log('Shorts length:', shorts?.length);
  console.log('Is loading:', isLoading);
  console.log('Active index:', activeIndex);
  if (shorts && shorts.length > 0) {
    console.log('First short:', shorts[0]);
    console.log('All short IDs:', shorts.map(s => s.id));
  }
  console.log('===========================');

  // Pausar todos los videos cuando se sale de la pantalla
  useFocusEffect(
    useCallback(() => {
      // Cuando se enfoca la pantalla, no hacer nada especial
      console.log('Shorts screen focused');
      
      return () => {
        // Cuando se desenfoca la pantalla, pausar todos los videos
        console.log('Shorts screen unfocused - pausing all videos');
        // Forzar pausa de todos los videos estableciendo activeIndex a -1
        setActiveIndex(-1);
      };
    }, [])
  );

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index || 0;
      setActiveIndex(newIndex);
      console.log('Active video changed to:', newIndex, shorts[newIndex]?.placeName);
    }
  }, [shorts]);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const ShortAnimatedItem = memo(({ item, isActive }: { item: any; isActive: boolean }) => {
    const opacity = useSharedValue(isActive ? 1 : 0.2);
    const scale = useSharedValue(isActive ? 1 : 0.98);
    const style = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    }));
    useEffect(() => {
      opacity.value = withTiming(isActive ? 1 : 0.2, { duration: 220 });
      scale.value = withTiming(isActive ? 1 : 0.98, { duration: 220 });
    }, [isActive]);

    return (
      <Animated.View style={[{ height: SCREEN_HEIGHT }, style]}>
        <TikTokShortItem
          item={item}
          isActive={isActive}
          onLike={() => {}}
          onComment={() => {}}
          onSave={() => {}}
          onShare={() => {}}
          onTap={() => {}}
        />
      </Animated.View>
    );
  });

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const isActive = index === activeIndex;
    return <ShortAnimatedItem item={item} isActive={isActive} />;
  }, [activeIndex]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: SCREEN_HEIGHT,
      offset: SCREEN_HEIGHT * index,
      index,
    }),
    []
  );

  const handleCreatePress = () => {
    Toast.show({
      type: "success",
      text1: "¡Crear Short!",
      text2: "Redirigiendo al creador de videos...",
    });
    router.push("/create-short");
  };

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
          onAction={handleCreatePress}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      

      <FlatList
        ref={flatListRef}
        data={shorts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={handleViewableItemsChanged}
        removeClippedSubviews={false}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
        scrollEnabled={true}
        testID="tiktok-shorts-list"
      />

      {/* Botón de crear */}
      <Animated.View style={styles.createButtonContainer}>
        <TouchableOpacity style={styles.createButton} onPress={handleCreatePress}>
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
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
  createButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 2,
    borderColor: theme.colors.textPrimary,
  },
});