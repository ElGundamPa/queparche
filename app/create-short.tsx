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
import { Camera, Video as VideoIcon, Upload, X, Check, ChevronLeft, Sparkles } from "lucide-react-native";
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from "expo-haptics";
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
import theme from "@/lib/theme";
import { categories } from "@/mocks/categories";
import { usePlansStore } from "@/hooks/use-plans-store";
import { useUserStore } from "@/hooks/use-user-store";
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

  // Estados de la UI
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'preview' | 'uploading' | 'success' | 'error'>('form');

  // Hooks personalizados
  const { isUploading, uploadProgress, uploadVideo, cancelUpload, resetUpload } = useBackgroundUpload();
  
  // Animaciones
  const formOpacity = useSharedValue(1);
  const previewScale = useSharedValue(0.9);

  const pickVideo = async () => {
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
      allowsEditing: false,
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

  const pickThumbnail = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert(
        "Permiso Requerido",
        "Por favor otorga permiso para acceder a tu galería de fotos."
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
    if (!videoUri || !placeName || !description || !category || !user) {
      Alert.alert(
        "Información Faltante",
        "Por favor completa todos los campos y selecciona un video."
      );
      return;
    }

    try {
      setCurrentStep('uploading');
      resetUpload();

      // Subir video y thumbnail directamente a Supabase Storage
      await uploadVideo(
        videoUri,
        thumbnailUri || videoUri,
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
              videoUrl: result.videoUrl,
              thumbnailUrl: result.thumbnailUrl,
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
      console.error('Upload error:', error);
      setCurrentStep('error');
      setShowErrorModal(true);
    }
  };

  const handleRetry = () => {
    setShowErrorModal(false);
    setCurrentStep('preview');
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
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Custom Gradient Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.customHeader}
        >
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.back();
            }}
            style={styles.headerBackButton}
            activeOpacity={0.7}
          >
            <ChevronLeft size={28} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <VideoIcon size={24} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Crea tu Short</Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </LinearGradient>
        
        {currentStep === 'form' && (
          <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
                <View style={styles.titleContainer}>
                  <Sparkles size={32} color={theme.colors.primary} />
                  <Text style={styles.title}>Comparte tu Parche</Text>
                </View>
                <Text style={styles.subtitle}>
                  Graba un video corto de tu lugar favorito y compártelo con la comunidad
                </Text>
              </Animated.View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Nombre del Lugar</Text>
                <TextInput
                  style={styles.input}
                  value={placeName}
                  onChangeText={setPlaceName}
                  placeholder="Ej: Parque Arví, Pueblito Paisa..."
                  placeholderTextColor="#666"
                  testID="place-name-input"
                />

                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Cuéntanos qué hace especial este lugar, qué actividades se pueden hacer, ambiente, recomendaciones..."
                  placeholderTextColor="#666"
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
                  placeholderTextColor="#666"
                />

                <Text style={styles.label}>Video</Text>
                <TouchableOpacity
                  style={styles.addVideoButton}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }
                    pickVideo();
                  }}
                  testID="add-video-button"
                  activeOpacity={0.7}
                >
                  <VideoIcon size={40} color={theme.colors.primary} strokeWidth={2} />
                  <Text style={styles.addVideoText}>Seleccionar Video</Text>
                  <Text style={styles.addVideoSubtext}>
                    Toca aquí para elegir un video de tu galería{'\n'}
                    Se procesará automáticamente a formato vertical (9:16)
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
              progress={uploadProgress.progress}
              stage={uploadProgress.stage}
              message={uploadProgress.message}
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
    backgroundColor: '#0B0B0B',
  },
  customHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerPlaceholder: {
    width: 40,
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
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#AAAAAA',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formSection: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#333',
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
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#333',
  },
  selectedCategoryButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  addVideoButton: {
    height: 220,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'rgba(255, 68, 68, 0.08)',
    marginTop: 8,
  },
  addVideoText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: 12,
    letterSpacing: -0.3,
  },
  addVideoSubtext: {
    fontSize: 13,
    color: '#AAAAAA',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  // Preview styles
  previewContainer: {
    flex: 1,
    backgroundColor: '#0B0B0B',
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
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  previewInfo: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  previewInfoText: {
    fontSize: 13,
    color: '#AAAAAA',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  // Uploading styles
  uploadingContainer: {
    flex: 1,
    backgroundColor: '#0B0B0B',
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
    color: '#FFFFFF',
    textAlign: 'center',
  },
  uploadingSubtitle: {
    fontSize: 15,
    color: '#AAAAAA',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
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