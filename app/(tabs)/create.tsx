import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Animated } from "react-native";
import { Camera, MapPin, Upload, ArrowLeft } from "lucide-react-native";

import theme from "@/lib/theme";
import { categories } from "@/mocks/categories";
import { usePlansStore } from "@/hooks/use-plans-store";
import { useUserStore } from "@/hooks/use-user-store";

export default function CreatePlanScreen() {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPublishPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 6,
      tension: 150,
    }).start();
  };

  const onPublishPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 150,
    }).start();
  };
  const router = useRouter();
  const { addPlan } = usePlansStore();
  const { user } = useUserStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [maxPeople, setMaxPeople] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState("");

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant permission to access your photo library."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const getLocation = async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Not Available",
        "Location picking is not available on web. Please use the mobile app."
      );
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant permission to access your location."
      );
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);

    // Reverse geocode to get address
    try {
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (addressResponse && addressResponse.length > 0) {
        const addressDetails = addressResponse[0];
        const formattedAddress = `${addressDetails.street || ""}, ${
          addressDetails.city || ""
        }, ${addressDetails.region || ""}, ${addressDetails.country || ""}`;
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error("Error getting address:", error);
    }
  };

  const handleCreatePlan = () => {
    if (!name || !description || !category || !maxPeople || images.length === 0 || !location || !user) {
      Alert.alert(
        "Missing Information",
        "Please fill in all fields and add at least one image."
      );
      return;
    }

    const planData = {
      name,
      description,
      category,
      maxPeople: parseInt(maxPeople, 10),
      images,
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address,
      },
      userId: user.id,
      createdBy: user.name,
    };

    addPlan(planData);
    Alert.alert("Success", "Your plan has been published!");
    router.push("/");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header with back button */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Parche</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Publish your plan</Text>
          <Text style={styles.subtitle}>
            Share your favorite places and plans with others
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Name of the place or plan</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter a name for your plan"
            placeholderTextColor={theme.colors.textSecondary}
            testID="plan-name-input"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your plan in detail"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={4}
            testID="plan-description-input"
          />

          <Text style={styles.label}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  category === cat.name && styles.selectedCategoryButton,
                ]}
                onPress={() => setCategory(cat.name)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === cat.name && styles.selectedCategoryText,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Maximum number of people</Text>
          <TextInput
            style={styles.input}
            value={maxPeople}
            onChangeText={setMaxPeople}
            placeholder="Enter maximum number of people"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="number-pad"
            testID="plan-max-people-input"
          />

          <Text style={styles.label}>Location</Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getLocation}
            testID="get-location-button"
          >
            <MapPin size={20} color={theme.colors.primary} />
            <Text style={styles.locationButtonText}>
              {location ? "Location selected" : "Use current location"}
            </Text>
          </TouchableOpacity>

          {address ? (
            <View style={styles.addressContainer}>
              <Text style={styles.addressText}>{address}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Photos</Text>
          <View style={styles.imagesContainer}>
            {images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.imagePreview}
                contentFit="cover"
              />
            ))}
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={pickImage}
              testID="add-image-button"
            >
              <Camera size={24} color={theme.colors.primary} />
              <Text style={styles.addImageText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Animated.View style={[styles.publishButton, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={onPublishPressIn}
          onPressOut={onPublishPressOut}
          onPress={handleCreatePlan}
          testID="publish-plan-button"
        >
          <LinearGradient
            colors={["#FF3B30", "#FF5252"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.publishGradient}
          >
            <Upload size={20} color={theme.colors.textPrimary} />
            <Text style={styles.publishButtonText}>Publish Plan</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.horizontal,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.button,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: theme.spacing.horizontal,
    paddingTop: theme.spacing.section,
    paddingBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  formContainer: {
    paddingHorizontal: theme.spacing.horizontal,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.section,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  categoriesContainer: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  categoryButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedCategoryButton: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  selectedCategoryText: {
    color: theme.colors.background,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  locationButtonText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginLeft: 8,
  },
  addressContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  addressText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addImageText: {
    fontSize: 12,
    color: theme.colors.primary,
    marginTop: 4,
  },
  publishButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.button,
  },
  publishGradient: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginLeft: 8,
  },
// removed extra closing brace
});