import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import theme from "@/lib/theme";
import { useDraftsStore } from "@/store/draftsStore";
import type { WizardStepProps } from "./types";

export default function Step4({ onNext }: WizardStepProps) {
  const { draft, setDraftField } = useDraftsStore();
  const [isPicking, setIsPicking] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería para seleccionar imágenes.");
      return false;
    }
    return true;
  };

  const handlePickImages = useCallback(async () => {
    if (isPicking) return;
    const granted = await requestPermissions();
    if (!granted) return;

    setIsPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 6,
      });

      if (!result.canceled) {
        const picked = result.assets?.map((asset) => asset.uri).filter(Boolean) ?? [];
        if (picked.length === 0) return;

        const unique = Array.from(new Set([...draft.images, ...picked]));
        setDraftField("images", unique);
      }
    } finally {
      setIsPicking(false);
    }
  }, [draft.images, isPicking, setDraftField]);

  const handleRemoveImage = (uri: string) => {
    const filtered = draft.images.filter((image) => image !== uri);
    setDraftField("images", filtered);
  };

  const canContinue = draft.images.length > 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Añade imágenes</Text>
        <Text style={styles.helper}>Sube al menos una imagen del parche.</Text>
      </View>

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handlePickImages}
        activeOpacity={0.9}
      >
        <Text style={styles.uploadText}>{isPicking ? "Abriendo galería..." : "Seleccionar imágenes"}</Text>
      </TouchableOpacity>

      <FlatList
        data={draft.images}
        keyExtractor={(item) => item}
        numColumns={3}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: item }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveImage(item)}
            >
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Todavía no has añadido imágenes.</Text>
        }
      />

      <TouchableOpacity
        style={[styles.nextButton, !canContinue && styles.nextButtonDisabled]}
        disabled={!canContinue}
        onPress={onNext}
        activeOpacity={0.9}
      >
        <Text style={styles.nextButtonText}>Siguiente</Text>
      </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.horizontal,
    gap: theme.spacing.section,
  },
  section: {
    gap: 8,
  },
  label: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  helper: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  uploadButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.pill,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  uploadText: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  grid: {
    gap: 12,
    paddingBottom: theme.spacing.section,
  },
  gridRow: {
    gap: 12,
  },
  imageWrapper: {
    flex: 1 / 3,
    aspectRatio: 1,
    borderRadius: theme.radii.md,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: "#fff",
    fontSize: 14,
  },
  emptyText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingVertical: 40,
  },
  nextButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.radii.pill,
    alignItems: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
