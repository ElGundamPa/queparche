import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  Dimensions,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { Camera, Video as VideoIcon, Upload, X, Check } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
} from "react-native-reanimated";

import Colors from "@/constants/colors";
import { categories } from "@/mocks/categories";
import { usePlansStore } from "@/hooks/use-plans-store";
import { useUserStore } from "@/hooks/use-user-store";
import { useVideoProcessor } from "@/hooks/use-video-processor";
import { useBackgroundUpload } from "@/hooks/use-background-upload";
import VideoPreview from "@/components/VideoPreview";
import ProgressBar from "@/components/ProgressBar";
import SuccessCard from "@/components/SuccessCard";
import ErrorCard from "@/components/ErrorCard";
import ConfettiAnimation from "@/components/ConfettiAnimation";

const { width } = Dimensions.get('window');

export default function CreateShortScreen() {
  const router = useRouter();
  const { addShort } = usePlansStore();
  const { user } = useUserStore();
  
  // Estados del formulario
  const [placeName, setPlaceName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  
  // Estados del video
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [processedVideoBlob, setProcessedVideoBlob] = useState<Blob | null>(null);
  const [originalVideoFile, setOriginalVideoFile] = useState<File | null>(null);
  
  // Estados de la UI
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'preview' | 'uploading' | 'success' | 'error'>('form');
  
  // Hooks personalizados
  const { isProcessing, progress, processVideo, resetProgress } = useVideoProcessor();
  const { isUploading, uploadProgress, uploadVideo, cancelUpload, resetUpload } = useBackgroundUpload();
  
  // Animaciones
  const formOpacity = useSharedValue(1);
  const previewScale = useSharedValue(0.9);

  const pickVideo = async () => {
    if (Platform.OS === "web") {
      // Para web, usar input file
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          await handleVideoSelection(file);
        }
      };
      input.click();
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert(
        "Permiso Requerido",
        "Necesitamos acceso a tu galería para seleccionar videos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false, // No editar aquí, lo haremos después
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setVideoUri(asset.uri);
      setThumbnailUri(asset.uri); // Usar el video como thumbnail temporal
      setShowVideoPreview(true);
      setCurrentStep('preview');
    }
  };

  const handleVideoSelection = async (file: File) => {
    setOriginalVideoFile(file);
    const videoUrl = URL.createObjectURL(file);
    setVideoUri(videoUrl);
    setThumbnailUri(videoUrl);
    setShowVideoPreview(true);
    setCurrentStep('preview');
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

  const handleProcessAndUpload = async () => {
    if ((!originalVideoFile && !videoUri) || !placeName || !description || !category || !user) {
      Alert.alert(
        "Información Faltante",
        "Por favor completa todos los campos y selecciona un video."
      );
      return;
    }

    try {
      setCurrentStep('uploading');
      resetProgress();
      resetUpload();

      // Procesar video - usar File para web, URI para móvil
      const input = Platform.OS === 'web' ? originalVideoFile : videoUri;
      if (!input) {
        throw new Error('No se pudo obtener el video para procesar');
      }

      const processedBlob = await processVideo(input, {
        targetWidth: 1080,
        targetHeight: 1920,
        quality: 'high',
        addBlurBackground: true,
      });

      setProcessedVideoBlob(processedBlob);

      // Subir en background
      await uploadVideo(
        processedBlob,
        {
          title: placeName,
          description,
          category,
          placeName,
        },
        {
          onProgress: (progress) => {
            // Actualizar UI con progreso
          },
          onSuccess: (result) => {
            // Agregar a la store local
            const shortData = {
              id: result.id || Date.now().toString(),
              videoUrl: result.videoUrl || URL.createObjectURL(processedBlob),
              thumbnailUrl: thumbnailUri,
              placeName,
              category,
              description,
              userId: user.id,
              createdBy: user.name,
              likes: 0,
              favorites: 0,
              comments: 0,
              createdAt: new Date().toISOString(),
            };

            addShort(shortData);
            setCurrentStep('success');
            setShowConfetti(true);
            setShowSuccessModal(true);
          },
          onError: (error) => {
            console.error('Upload error:', error);
            setCurrentStep('error');
            setShowErrorModal(true);
          },
        }
      );
    } catch (error) {
      console.error('Processing error:', error);
      setCurrentStep('error');
      setShowErrorModal(true);
    }
  };

  const handleRetry = () => {
    setShowErrorModal(false);
    setCurrentStep('preview');
    resetProgress();
    resetUpload();
  };

  const handleSuccess = () => {
    setShowSuccessModal(false);
    setShowConfetti(false);
    router.push("/shorts");
  };

  const handleBackToForm = () => {
    setShowVideoPreview(false);
    setCurrentStep('form');
    setVideoUri(null);
    setThumbnailUri(null);
    setProcessedVideoBlob(null);
    setOriginalVideoFile(null);
  };

  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value,
    };
  });

  const previewAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: previewScale.value }],
    };
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: "Crear Short",
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 12 }}>
              <Text style={{ color: Colors.light.primary, fontWeight: "700" }}>← Volver</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <StatusBar style="dark" />
        
        {currentStep === 'form' && (
          <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.header}>
                <Text style={styles.title}>¡Crea tu Short! ✨</Text>
                <Text style={styles.subtitle}>
                  Comparte un video corto de tu lugar favorito
                </Text>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Nombre del Lugar</Text>
                <TextInput
                  style={styles.input}
                  value={placeName}
                  onChangeText={setPlaceName}
                  placeholder="¿Dónde estuviste?"
                  placeholderTextColor={Colors.light.darkGray}
                  testID="place-name-input"
                />

                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Cuéntanos sobre este lugar..."
                  placeholderTextColor={Colors.light.darkGray}
                  multiline
                  numberOfLines={4}
                  testID="description-input"
                />

                <Text style={styles.label}>Categoría</Text>
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

                <Text style={styles.label}>Etiquetas (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={tags}
                  onChangeText={setTags}
                  placeholder="#aventura #naturaleza #diversión"
                  placeholderTextColor={Colors.light.darkGray}
                />

                <Text style={styles.label}>Video</Text>
                <TouchableOpacity
                  style={styles.addVideoButton}
                  onPress={pickVideo}
                  testID="add-video-button"
                >
                  <VideoIcon size={32} color={Colors.light.primary} />
                  <Text style={styles.addVideoText}>Seleccionar Video</Text>
                  <Text style={styles.addVideoSubtext}>
                    Se procesará automáticamente a formato vertical
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        )}

        {currentStep === 'preview' && videoUri && (
          <Animated.View style={[styles.previewContainer, previewAnimatedStyle]}>
            <View style={styles.previewHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackToForm}
              >
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
              <Text style={styles.previewTitle}>Vista Previa</Text>
              <View style={styles.placeholder} />
            </View>

            <VideoPreview
              videoUri={videoUri}
              thumbnailUri={thumbnailUri}
              onRetake={handleBackToForm}
              onConfirm={handleProcessAndUpload}
              showControls={true}
            />

            <View style={styles.previewInfo}>
              <Text style={styles.previewInfoText}>
                El video se procesará automáticamente a formato vertical (9:16)
              </Text>
            </View>
          </Animated.View>
        )}

        {currentStep === 'uploading' && (
          <View style={styles.uploadingContainer}>
            <View style={styles.uploadingHeader}>
              <Text style={styles.uploadingTitle}>Procesando tu Short</Text>
              <Text style={styles.uploadingSubtitle}>
                Mientras tanto, puedes seguir editando los detalles
              </Text>
            </View>

            <ProgressBar
              progress={isProcessing ? progress.progress : uploadProgress.progress}
              stage={isProcessing ? progress.stage : uploadProgress.stage}
              message={isProcessing ? progress.message : uploadProgress.message}
              showPulse={true}
            />

            <View style={styles.formWhileUploading}>
              <Text style={styles.label}>Nombre del Lugar</Text>
              <TextInput
                style={styles.input}
                value={placeName}
                onChangeText={setPlaceName}
                placeholder="¿Dónde estuviste?"
                placeholderTextColor={Colors.light.darkGray}
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Cuéntanos sobre este lugar..."
                placeholderTextColor={Colors.light.darkGray}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Categoría</Text>
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
            </View>
          </View>
        )}

        {/* Modales */}
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
          onRequestClose={handleSuccess}
        >
          <View style={styles.modalOverlay}>
            <SuccessCard
              title="¡Tu Short está listo para brillar!"
              message="Tu video se ha procesado y subido exitosamente. ¡Ya está disponible para que todos lo vean!"
              onAction={handleSuccess}
              actionText="Ver Shorts"
              showConfetti={true}
            />
          </View>
        </Modal>

        <Modal
          visible={showErrorModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowErrorModal(false)}
        >
          <View style={styles.modalOverlay}>
            <ErrorCard
              title="Ups, parece que el parche se desconectó 😅"
              message="Hubo un problema al procesar tu video. No te preocupes, puedes intentar de nuevo."
              onRetry={handleRetry}
              retryText="Intentar de nuevo"
              onDismiss={() => setShowErrorModal(false)}
              dismissText="Cerrar"
            />
          </View>
        </Modal>

        <ConfettiAnimation
          isActive={showConfetti}
          onComplete={() => setShowConfetti(false)}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  formContainer: {
    flex: 1,
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
    fontSize: 32,
    fontWeight: "800",
    color: Colors.light.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.darkGray,
    marginTop: 8,
    textAlign: 'center',
  },
  formSection: {
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
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 2,
    borderColor: 'transparent',
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCategoryButton: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  selectedCategoryText: {
    color: Colors.light.white,
  },
  addVideoButton: {
    height: 200,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.lightGray + '20',
    marginTop: 8,
  },
  addVideoText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.primary,
    marginTop: 12,
  },
  addVideoSubtext: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginTop: 4,
    textAlign: 'center',
  },
  // Preview styles
  previewContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  placeholder: {
    width: 40,
  },
  previewInfo: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  previewInfoText: {
    fontSize: 14,
    color: Colors.light.darkGray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Uploading styles
  uploadingContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  uploadingHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  uploadingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
  },
  uploadingSubtitle: {
    fontSize: 16,
    color: Colors.light.darkGray,
    marginTop: 8,
    textAlign: 'center',
  },
  formWhileUploading: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});