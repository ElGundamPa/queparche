import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Plus, Video, MapPin, X } from "lucide-react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";

import theme from "@/lib/theme";

const { width, height } = Dimensions.get('window');

export default function CreateScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  
  // Animación del botón principal
  const buttonScale = useSharedValue(1);
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleCreatePress = () => {
    // Animación de rebote
    buttonScale.value = withSpring(0.9, {}, () => {
      buttonScale.value = withSpring(1);
    });
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Abrir modal
    setModalVisible(true);
  };

  const handleUploadShort = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(false);
    router.push("/create-short");
  };

  const handleCreatePlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(false);
    // Mantener el formulario de crear plan aquí o navegar a otra pantalla
    // Por ahora mostramos el modal original
    setTimeout(() => {
      // Aquí puedes agregar tu lógica para crear plan
      setModalVisible(false);
    }, 100);
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Botón principal flotante */}
      <Animated.View style={buttonStyle}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePress}
          activeOpacity={0.9}
        >
          <Plus size={40} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Modal de opciones */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={10} style={StyleSheet.absoluteFill} />
          
          {/* Contenido del modal */}
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>¿Qué quieres crear?</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Opción 1: Subir Parche */}
            <TouchableOpacity
              style={[styles.optionButton, styles.primaryOption]}
              onPress={handleUploadShort}
              activeOpacity={0.8}
            >
              <View style={styles.optionIconContainer}>
                <Video size={28} color="white" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Subir Parche</Text>
                <Text style={styles.optionDescription}>
                  Comparte un video corto
                </Text>
              </View>
            </TouchableOpacity>

            {/* Opción 2: Crear Parche */}
            <TouchableOpacity
              style={[styles.optionButton, styles.secondaryOption]}
              onPress={handleCreatePlan}
              activeOpacity={0.8}
            >
              <View style={styles.optionIconContainerSecondary}>
                <MapPin size={28} color={theme.colors.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitleSecondary}>Crear Parche</Text>
                <Text style={styles.optionDescriptionSecondary}>
                  Publica un plan con ubicación
                </Text>
              </View>
            </TouchableOpacity>

            {/* Botón cancelar */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    ...theme.shadows.card,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  primaryOption: {
    backgroundColor: theme.colors.primary,
  },
  secondaryOption: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionIconContainerSecondary: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  optionTitleSecondary: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  optionDescriptionSecondary: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
});
