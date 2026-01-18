import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Filter, Plus, X } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { fadeIn, slideUp, scaleTap } from "@/lib/animations";

import theme from "@/lib/theme";
import { categories } from "@/mocks/categories";
import { usePlansStore } from "@/hooks/use-plans-store";

const { width } = Dimensions.get("window");

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const initialRegion: Region = {
  latitude: 6.2476,
  longitude: -75.5658,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const { plans, selectedCategory, setSelectedCategory } = usePlansStore();
  const [region, setRegion] = useState<Region>(initialRegion);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [MapView, setMapView] = useState<any>(null);
  const [Marker, setMarker] = useState<any>(null);
  const [Location, setLocation] = useState<any>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const filterButtonRef = useRef<React.ElementRef<typeof TouchableOpacity> | null>(null);
  const [filterButtonPosition, setFilterButtonPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Animation values
  const dropdownScale = useSharedValue(0);
  const dropdownOpacity = useSharedValue(0);
  const dropdownAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dropdownScale.value }],
    opacity: dropdownOpacity.value,
  }));

  // Mount animation for controls
  const controlsFade = fadeIn(260);
  const controlsSlide = slideUp(18, 320);

  useEffect(() => {
    controlsFade.start();
    controlsSlide.start();
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") {
      // Dynamically import react-native-maps only on native platforms
      import("react-native-maps").then((MapModule) => {
        setMapView(() => MapModule.default);
        setMarker(() => MapModule.Marker);
        setIsMapLoading(false);
      });

      // Dynamically import expo-location only on native platforms
      import("expo-location").then((LocationModule) => {
        setLocation(LocationModule);

        (async () => {
          const { status } = await LocationModule.requestForegroundPermissionsAsync();
          if (status === "granted") {
            const location = await LocationModule.getCurrentPositionAsync({});
            setUserLocation(location);

            setRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
          }
        })();
      });
    } else {
      setIsMapLoading(false);
    }
  }, []);

  const handleMarkerPress = (planId: string) => {
    // Navegar directamente al plan
    router.push(`/plan/${planId}`);
  };

  const handleCreatePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Toast.show({
      type: 'info',
      text1: 'Creando parche...',
      text2: 'Te llevamos al formulario',
      position: 'bottom',
      visibilityTime: 1500,
    });
    router.push("/create");
  };

  const toggleFilters = () => {
    Haptics.selectionAsync();
    if (showFilters) {
      dropdownScale.value = withSpring(0, { damping: 15 });
      dropdownOpacity.value = withTiming(0, { duration: 200 });
      setTimeout(() => setShowFilters(false), 200);
    } else {
      filterButtonRef.current?.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setFilterButtonPosition({ x: pageX, y: pageY });
      });
      setShowFilters(true);
      dropdownScale.value = withSpring(1, { damping: 15 });
      dropdownOpacity.value = withTiming(1, { duration: 200 });
    }
  };

  const handleCategoryPress = (categoryName: string) => {
    const newCategory = selectedCategory === categoryName ? null : categoryName;
    setSelectedCategory(newCategory);
    
    // Show toast feedback
    if (newCategory) {
      Toast.show({
        type: 'success',
        text1: 'Filtro aplicado ✅',
        text2: `Mostrando planes de ${categoryName}`,
        position: 'bottom',
        visibilityTime: 2000,
      });
    } else {
      Toast.show({
        type: 'info',
        text1: 'Filtro removido',
        text2: 'Mostrando todos los planes',
        position: 'bottom',
        visibilityTime: 2000,
      });
    }
    
    // Close dropdown
    toggleFilters();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Restaurants":
        return "#FF6B6B";
      case "Rooftops":
        return "#4ECDC4";
      case "Free plans":
        return "#45B7D1";
      case "Culture":
        return "#96CEB4";
      case "Nature":
        return "#FFEAA7";
      case "Nightlife":
        return "#DDA0DD";
      case "Sports":
        return "#FF7675";
      case "Shopping":
        return "#FD79A8";
      default:
        return theme.colors.primary;
    }
  };

  const filteredPlans = selectedCategory
    ? plans.filter((plan) => (plan.primaryCategory || plan.category) === selectedCategory)
    : plans;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {isMapLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando mapa...</Text>
        </View>
      ) : Platform.OS !== "web" && MapView && Marker ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider="google"
          initialRegion={initialRegion}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
          testID="map-view"
        >
          {filteredPlans.map((plan) => (
            <Marker
              key={plan.id}
              coordinate={{
                latitude: plan.location.lat ?? plan.location.latitude ?? initialRegion.latitude,
                longitude: plan.location.lng ?? plan.location.longitude ?? initialRegion.longitude,
              }}
              title={plan.name}
              description={plan.primaryCategory || plan.category}
              pinColor={getCategoryColor(plan.primaryCategory || plan.category)}
              onPress={() => handleMarkerPress(plan.id)}
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.webFallback}>
          <Text style={styles.webFallbackText}>
            Map view is not available on web.
          </Text>
          <Text style={styles.webFallbackSubtext}>
            Please use the mobile app to view the map.
          </Text>
        </View>
      )}

      <Animated.View style={[styles.buttonContainer, controlsFade.style, controlsSlide.style]}>
        <Animated.View style={scaleTap().style}>
        <TouchableOpacity
          ref={filterButtonRef}
          style={styles.filterButton}
          onPress={toggleFilters}
          testID="filter-button"
        >
          <Filter size={24} color={theme.colors.background} />
        </TouchableOpacity>
        </Animated.View>

        <Animated.View style={scaleTap().style}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePress}
          testID="create-plan-button"
        >
          <Plus size={20} color={theme.colors.background} />
          <Text style={styles.createButtonText}>Publica tu parche</Text>
        </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Animated Filter Dropdown Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="none"
        onRequestClose={toggleFilters}
      >
        <Pressable style={styles.modalOverlay} onPress={toggleFilters}>
          <Animated.View
            style={[
              styles.filtersDropdown,
              {
                top: Math.max(60, filterButtonPosition.y - 300),
                left: Math.max(20, filterButtonPosition.x - 150),
              },
              dropdownAnimatedStyle,
            ]}
            testID="filter-dropdown"
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.dropdownHeader}>
              <Text style={styles.filtersTitle}>Filtrar por categoría</Text>
              <TouchableOpacity onPress={toggleFilters} style={styles.closeButton}>
              <X size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.name && {
                      backgroundColor: getCategoryColor(category.name),
                    },
                  ]}
                  onPress={() => handleCategoryPress(category.name)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.name && styles.selectedCategoryText,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
      
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  webFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  webFallbackText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  webFallbackSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  webPlansContainer: {
    width: "100%",
    maxWidth: 400,
  },
  webPlansTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  webPlanItem: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  webPlanName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  webPlanCategory: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterButton: {
    backgroundColor: theme.colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.button,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 28,
    ...theme.shadows.button,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.background,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  filtersDropdown: {
    position: 'absolute',
    width: 300,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  closeButton: {
    padding: 4,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    backgroundColor: theme.colors.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  selectedCategoryText: {
    color: theme.colors.background,
  },
});