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
import { useRouter, Stack } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { Camera, Video as VideoIcon, Upload } from "lucide-react-native";

import Colors from "@/constants/colors";
import { categories } from "@/mocks/categories";
import { usePlansStore } from "@/hooks/use-plans-store";
import { useUserStore } from "@/hooks/use-user-store";

export default function CreateShortScreen() {
  const router = useRouter();
  const { addShort } = usePlansStore();
  const { user } = useUserStore();
  const [placeName, setPlaceName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);

  const pickVideo = async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Not Available",
        "Video picking is not available on web. Please use the mobile app."
      );
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant permission to access your photo library."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setVideoUri(result.assets[0].uri);
      setThumbnailUri("https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=1000");
    }
  };

  const pickThumbnail = async () => {
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
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setThumbnailUri(result.assets[0].uri);
    }
  };

  const handleCreateShort = () => {
    if (!placeName || !description || !category || !videoUri || !thumbnailUri || !user) {
      Alert.alert(
        "Missing Information",
        "Please fill in all fields and add a video and thumbnail."
      );
      return;
    }

    const sampleVideoUrl = "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4";

    const shortData = {
      videoUrl: Platform.OS === "web" ? sampleVideoUrl : videoUri,
      thumbnailUrl: thumbnailUri,
      placeName,
      category,
      description,
      userId: user.id,
      createdBy: user.name,
    };

    addShort(shortData);
    Alert.alert("Success", "Your short has been published!");
    router.push("/shorts");
  };

  return (
    <>
      <Stack.Screen options={{ title: "Create Short" }} />
      <View style={styles.container}>
        <StatusBar style="dark" />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Upload your plan</Text>
            <Text style={styles.subtitle}>
              Share a short video of your favorite place
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Place Name</Text>
            <TextInput
              style={styles.input}
              value={placeName}
              onChangeText={setPlaceName}
              placeholder="Enter the name of the place"
              placeholderTextColor={Colors.light.darkGray}
              testID="place-name-input"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe this place"
              placeholderTextColor={Colors.light.darkGray}
              multiline
              numberOfLines={4}
              testID="description-input"
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

            <Text style={styles.label}>Video</Text>
            <View style={styles.mediaContainer}>
              {videoUri ? (
                <View style={styles.videoPreviewContainer}>
                  <Text style={styles.videoSelectedText}>Video selected</Text>
                  <TouchableOpacity
                    style={styles.changeButton}
                    onPress={pickVideo}
                  >
                    <Text style={styles.changeButtonText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addMediaButton}
                  onPress={pickVideo}
                  testID="add-video-button"
                >
                  <VideoIcon size={24} color={Colors.light.primary} />
                  <Text style={styles.addMediaText}>Add Video</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>Thumbnail</Text>
            <View style={styles.mediaContainer}>
              {thumbnailUri ? (
                <View style={styles.thumbnailContainer}>
                  <Image
                    source={{ uri: thumbnailUri }}
                    style={styles.thumbnailPreview}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    style={styles.changeButton}
                    onPress={pickThumbnail}
                  >
                    <Text style={styles.changeButtonText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addMediaButton}
                  onPress={pickThumbnail}
                  testID="add-thumbnail-button"
                >
                  <Camera size={24} color={Colors.light.primary} />
                  <Text style={styles.addMediaText}>Add Thumbnail</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.publishButton}
          onPress={handleCreateShort}
          testID="publish-short-button"
        >
          <Upload size={20} color={Colors.light.white} />
          <Text style={styles.publishButtonText}>Publish Short</Text>
        </TouchableOpacity>
      </View>
    </>
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
    paddingTop: 20,
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
  mediaContainer: {
    marginTop: 8,
  },
  addMediaButton: {
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addMediaText: {
    fontSize: 16,
    color: Colors.light.primary,
    marginTop: 8,
  },
  videoPreviewContainer: {
    height: 150,
    borderRadius: 12,
    backgroundColor: Colors.light.lightGray,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  videoSelectedText: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 16,
  },
  thumbnailContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  thumbnailPreview: {
    width: "100%",
    height: "100%",
  },
  changeButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.white,
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