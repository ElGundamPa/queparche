import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  TextInput,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { ArrowRight, Camera, User, Sparkles, Check } from 'lucide-react-native';
import Colors from '../../constants/colors';
import { useOnboardingStore } from '../../hooks/use-onboarding-store';
import { useAuthStore } from '../../hooks/use-auth-store';
import { pickImageFromGallery } from '../../utils/permissions';
import OnboardingSuccess from '../../components/OnboardingSuccess';

const { width } = Dimensions.get('window');

// 10 intereses basados en las categorías de la app
const INTERESTS = [
  { id: 'restaurants', name: 'Restaurantes', icon: '🍽️', color: '#FF6B6B' },
  { id: 'rooftops', name: 'Rooftops', icon: '🏢', color: '#4ECDC4' },
  { id: 'free-plans', name: 'Planes Gratis', icon: '🎫', color: '#45B7D1' },
  { id: 'culture', name: 'Cultura', icon: '🎭', color: '#96CEB4' },
  { id: 'nature', name: 'Naturaleza', icon: '🌿', color: '#FFEAA7' },
  { id: 'nightlife', name: 'Vida Nocturna', icon: '🌙', color: '#DDA0DD' },
  { id: 'sports', name: 'Deportes', icon: '⚽', color: '#FF7675' },
  { id: 'shopping', name: 'Compras', icon: '🛍️', color: '#FD79A8' },
  { id: 'music', name: 'Música', icon: '🎵', color: '#98D8C8' },
  { id: 'travel', name: 'Viajes', icon: '✈️', color: '#F7DC6F' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { data, updateData, completeOnboarding: completeOnboardingStore } = useOnboardingStore();
  const { completeOnboarding: completeAuthOnboarding } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Animaciones
  const successScale = useSharedValue(0);
  const successOpacity = useSharedValue(0);
  const confettiPositions = Array.from({ length: 20 }).map(() => useSharedValue(0));

  const handleInterestToggle = (interestId: string) => {
    const newInterests = data.interests.includes(interestId)
      ? data.interests.filter(id => id !== interestId)
      : [...data.interests, interestId];
    updateData({ interests: newInterests });
  };

  const handlePickImage = async () => {
    const imageUri = await pickImageFromGallery();
    if (imageUri) {
      updateData({ avatar: imageUri });
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!data.bio.trim()) {
        Alert.alert('Error', 'Por favor escribe una breve descripción sobre ti');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (data.interests.length === 0) {
        Alert.alert('Error', 'Por favor selecciona al menos un interés');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);

    try {
      console.log('=== ONBOARDING COMPLETE ===');
      console.log('📝 Bio:', data.bio);
      console.log('🎯 Interests:', data.interests);
      console.log('🖼️ Avatar:', data.avatar);
      console.log('👤 Usuario actual:', useAuthStore.getState().currentUser?.id);

      // Guardar datos en el store de autenticación
      await completeAuthOnboarding({
        bio: data.bio,
        interests: data.interests,
        avatar: data.avatar,
      });

      console.log('✅ Datos guardados en Supabase');

      // Marcar onboarding como completado
      completeOnboardingStore();

      console.log('✅ Onboarding marcado como completado');
      console.log('==============================');

      // Mostrar pantalla de éxito
      setShowSuccess(true);

      // Animar confetti
      successOpacity.value = withTiming(1, { duration: 300 });
      successScale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );

    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      setIsCompleting(false);
      Alert.alert('Error', 'Hubo un problema al completar tu perfil. Intenta de nuevo.');
    }
  };

  const navigateToHome = () => {
    router.replace('/(tabs)');
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Cuéntanos sobre ti</Text>
      <Text style={styles.stepSubtitle}>
        Escribe una breve descripción para que otros usuarios te conozcan
      </Text>
      
      <View style={styles.bioContainer}>
        <Text style={styles.inputLabel}>Descripción</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            value={data.bio}
            onChangeText={(text) => updateData({ bio: text })}
            placeholder="Ej: Amante de la comida, aventurero, siempre buscando nuevos lugares para explorar..."
            placeholderTextColor={Colors.light.darkGray}
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          <Text style={styles.characterCount}>{data.bio.length}/200</Text>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>¿Qué te interesa?</Text>
      <Text style={styles.stepSubtitle}>
        Selecciona tus intereses para personalizar tu experiencia
      </Text>

      <View style={styles.interestsGrid}>
        {INTERESTS.map((interest, index) => {
          const isSelected = data.interests.includes(interest.id);

          return (
            <Animated.View
              key={interest.id}
              entering={ZoomIn.delay(index * 50).duration(400)}
            >
              <TouchableOpacity
                style={[
                  styles.interestCard,
                  isSelected && styles.selectedInterestCard,
                  { borderColor: isSelected ? interest.color : 'transparent' }
                ]}
                onPress={() => handleInterestToggle(interest.id)}
                activeOpacity={0.7}
              >
                <View style={styles.interestContent}>
                  <Text style={styles.interestIcon}>{interest.icon}</Text>
                  <Text style={[
                    styles.interestName,
                    isSelected && styles.selectedInterestName
                  ]}>
                    {interest.name}
                  </Text>
                  {isSelected && (
                    <Animated.View entering={ZoomIn.duration(200)}>
                      <Check size={18} color={interest.color} strokeWidth={3} />
                    </Animated.View>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      <Animated.View entering={FadeIn.delay(600).duration(400)}>
        <Text style={styles.selectionCount}>
          {data.interests.length} {data.interests.length === 1 ? 'interés seleccionado' : 'intereses seleccionados'}
        </Text>
      </Animated.View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Tu foto de perfil</Text>
      <Text style={styles.stepSubtitle}>
        Elige una foto o usa una predeterminada
      </Text>
      
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          {data.avatar ? (
            <Image source={{ uri: data.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <User size={60} color={Colors.light.white} />
            </View>
          )}
        </View>
        
        <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
          <Camera size={20} color={Colors.light.white} />
          <Text style={styles.photoButtonText}>Elegir foto</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.defaultButton}
          onPress={() => updateData({ avatar: '' })}
        >
          <Text style={styles.defaultButtonText}>Usar predeterminada</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (showSuccess) {
    return (
      <OnboardingSuccess
        onComplete={navigateToHome}
        userName={useAuthStore.getState().currentUser?.name}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Progress Bar */}
        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.progressContainer}
        >
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: `${(currentStep / 3) * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>Paso {currentStep} de 3</Text>
        </Animated.View>

        {/* Content */}
        {currentStep === 1 && (
          <Animated.View
            key="step1"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(300)}
          >
            {renderStep1()}
          </Animated.View>
        )}
        {currentStep === 2 && (
          <Animated.View
            key="step2"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(300)}
          >
            {renderStep2()}
          </Animated.View>
        )}
        {currentStep === 3 && (
          <Animated.View
            key="step3"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(300)}
          >
            {renderStep3()}
          </Animated.View>
        )}

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          {currentStep > 1 && (
            <Animated.View entering={FadeIn.duration(300)}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setCurrentStep(currentStep - 1)}
              >
                <Text style={styles.backButtonText}>Atrás</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            disabled={isCompleting}
          >
            <LinearGradient
              colors={[Colors.light.primary, Colors.light.secondary] as [string, string]}
              style={styles.nextButtonGradient}
            >
              {isCompleting ? (
                <ActivityIndicator color={Colors.light.white} />
              ) : (
                <>
                  <Text style={styles.nextButtonText}>
                    {currentStep === 3 ? 'Completar' : 'Siguiente'}
                  </Text>
                  <ArrowRight size={20} color={Colors.light.white} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.light.lightGray,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: Colors.light.darkGray,
    textAlign: 'center',
  },
  stepContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  stepSubtitle: {
    fontSize: 16,
    color: Colors.light.darkGray,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  bioContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
    marginBottom: 12,
  },
  textAreaContainer: {
    position: 'relative',
  },
  textArea: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.light.white,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: Colors.light.darkGray,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  interestCard: {
    width: (width - 60) / 2,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedInterestCard: {
    backgroundColor: Colors.light.primary + '20',
    borderColor: Colors.light.primary,
  },
  interestContent: {
    alignItems: 'center',
    position: 'relative',
  },
  interestIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  interestName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.white,
    textAlign: 'center',
  },
  selectedInterestName: {
    color: Colors.light.primary,
  },
  selectionCount: {
    fontSize: 14,
    color: Colors.light.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.light.primary,
  },
  defaultAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.light.primary,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  photoButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  defaultButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  defaultButtonText: {
    color: Colors.light.darkGray,
    fontSize: 16,
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: Colors.light.darkGray,
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    marginLeft: 20,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  nextButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
