import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";

import theme from "@/lib/theme";
import { videoStateManager } from "@/lib/videoStateManager";

const { width } = Dimensions.get('window');

export default function CreateScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(true); // Visible desde el inicio
  
  // Cerrar modal y volver al tab anterior cuando se cierra
  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(false);
    // Usar setTimeout para permitir la animación del modal antes de navegar
    setTimeout(() => {
      router.back();
    }, 200);
  };

  const handleUploadShort = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setModalVisible(false);
    videoStateManager.pauseAllVideos();
    router.push("/create-short");
  };

  const handleCreatePlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setModalVisible(false);
    videoStateManager.pauseAllVideos();
    router.push("/create-post");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Modal de opciones - se muestra directamente */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.modalContainer}>
            <BlurView intensity={30} tint="dark" style={styles.blurView} />
            
            {/* Contenido del modal - prevenir que el tap fuera cierre cuando se toca aquí */}
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>¿Qué querés hacer?</Text>

                <Pressable
                  onPress={handleUploadShort}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>🎥 Subir Parche</Text>
                  <Text style={styles.primaryButtonSubtext}>Video corto con ubicación</Text>
                </Pressable>

                <Pressable
                  onPress={handleCreatePlan}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>📍 Crear Parche</Text>
                  <Text style={styles.secondaryButtonSubtext}>Plan con ubicación y detalles</Text>
                </Pressable>

                <Pressable onPress={handleClose} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: 280,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  primaryButtonSubtext: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    marginTop: 4,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButtonSubtext: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
  cancelText: {
    color: "#aaa",
    textAlign: "center",
    fontSize: 14,
  },
});
