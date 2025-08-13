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

import Colors from "@/constants/colors";
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
  const filterButtonRef = useRef<TouchableOpacity | null>(null);
  const [filterButtonPosition, setFilterButtonPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Animation values
  const dropdownScale = useSharedValue(0);
  const dropdownOpacity = useSharedValue(0);
  const dropdownAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dropdownScale.value }],
    opacity: dropdownOpacity.value,
  }));

  useEffect(() => {
    if (Platform.OS !== "web") {
      // Dynamically import react-native-maps only on native platforms
      import("react-native-maps").then((MapModule) => {
        setMapView(() => MapModule.default);
        setMarker(() => MapModule.Marker);
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
    }
  }, []);

  const handleMarkerPress = (planId: string) => {
    router.push(`/plan/${planId}`);
  };

  const handleCreatePress = () => {
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
        return Colors.light.primary;
    }
  };

  const filteredPlans = selectedCategory
    ? plans.filter((plan) => plan.category === selectedCategory)
    : plans;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {Platform.OS !== "web" && MapView && Marker ? (
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
                latitude: plan.location.latitude,
                longitude: plan.location.longitude,
              }}
              title={plan.name}
              description={plan.category}
              pinColor={getCategoryColor(plan.category)}
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
          
          <View style={styles.webPlansContainer}>
            <Text style={styles.webPlansTitle}>Available Plans:</Text>
            {filteredPlans.slice(0, 5).map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={styles.webPlanItem}
                onPress={() => handleMarkerPress(plan.id)}
              >
                <Text style={styles.webPlanName}>{plan.name}</Text>
                <Text style={styles.webPlanCategory}>{plan.category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          ref={filterButtonRef}
          style={styles.filterButton}
          onPress={toggleFilters}
          testID="filter-button"
        >
          <Filter size={24} color={Colors.light.background} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePress}
          testID="create-plan-button"
        >
          <Plus size={20} color={Colors.light.background} />
          <Text style={styles.createButtonText}>Publica tu parche</Text>
        </TouchableOpacity>
      </View>

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
                <X size={20} color={Colors.light.darkGray} />
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
    backgroundColor: Colors.light.background,
  },
  map: {
    width: "100%",
    height: "100%",
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
    color: Colors.light.text,
    marginBottom: 8,
  },
  webFallbackSubtext: {
    fontSize: 14,
    color: Colors.light.darkGray,
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
    color: Colors.light.text,
    marginBottom: 16,
  },
  webPlanItem: {
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  webPlanName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  webPlanCategory: {
    fontSize: 14,
    color: Colors.light.darkGray,
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
  createButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 28,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.background,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  filtersDropdown: {
    position: 'absolute',
    width: 300,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
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
    color: Colors.light.text,
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    backgroundColor: Colors.light.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  selectedCategoryText: {
    color: Colors.light.background,
  },
});