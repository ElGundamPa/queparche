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
import { Video, ResizeMode } from "expo-av";
import { Plus } from "lucide-react-native";

import Colors from "@/constants/colors";
import ShortCard from "@/components/ShortCard";
import { usePlansStore } from "@/hooks/use-plans-store";

const { height } = Dimensions.get("window");

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

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <View style={styles.shortContainer}>
        {Platform.OS !== "web" ? (
          <Video
            source={{ uri: item.videoUrl }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            shouldPlay={index === activeIndex}
            isLooping
            isMuted={false}
          />
        ) : (
          <ShortCard short={item} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {shorts.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={shorts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
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
  },
  video: {
    flex: 1,
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