import React, { useState } from "react";
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
import { Camera, MapPin, Upload } from "lucide-react-native";

import Colors from "@/constants/colors";
import { categories } from "@/mocks/categories";
import { usePlansStore } from "@/hooks/use-plans-store";
import { useUserStore } from "@/hooks/use-user-store";

export default function CreatePlanScreen() {
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
            placeholderTextColor={Colors.light.darkGray}
            testID="plan-name-input"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your plan in detail"
            placeholderTextColor={Colors.light.darkGray}
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
            placeholderTextColor={Colors.light.darkGray}
            keyboardType="number-pad"
            testID="plan-max-people-input"
          />

          <Text style={styles.label}>Location</Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getLocation}
            testID="get-location-button"
          >
            <MapPin size={20} color={Colors.light.primary} />
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
              <Camera size={24} color={Colors.light.primary} />
              <Text style={styles.addImageText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.publishButton}
        onPress={handleCreatePlan}
        testID="publish-plan-button"
      >
        <Upload size={20} color={Colors.light.white} />
        <Text style={styles.publishButtonText}>Publish Plan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.darkGray,
    marginTop: 8,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
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
    backgroundColor: Colors.light.lightGray,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.light.primary,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  selectedCategoryText: {
    color: Colors.light.white,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationButtonText: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 8,
  },
  addressContainer: {
    backgroundColor: Colors.light.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  addressText: {
    fontSize: 14,
    color: Colors.light.text,
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
    borderColor: Colors.light.primary,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addImageText: {
    fontSize: 12,
    color: Colors.light.primary,
    marginTop: 4,
  },
  publishButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.white,
    marginLeft: 8,
  },
});