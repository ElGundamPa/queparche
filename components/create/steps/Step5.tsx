import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

import theme from "@/lib/theme";
import { useDraftsStore } from "@/store/draftsStore";
import type { WizardStepProps } from "./types";
import { trpc } from "@/lib/trpc";
import { uploadPlanImages } from "@/lib/storage-helpers";

export default function Step5({ onBack, onNext: _onNext }: WizardStepProps) {
  const router = useRouter();
  const { draft, saveDraft, resetDraft } = useDraftsStore();
  const createPlanMutation = trpc.plans.create.useMutation();
  const utils = trpc.useUtils();
  const [isPublishing, setIsPublishing] = useState(false);

  const formattedPrice = draft.averagePrice > 0 ? `$${draft.averagePrice.toLocaleString("es-CO")}` : "Pendiente";
  const formattedDate = draft.eventDate
    ? new Date(draft.eventDate).toLocaleString("es-CO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Sin fecha definida";

  const handleSaveDraft = () => {
    saveDraft();
    Alert.alert("Borrador guardado", "Puedes continuar más tarde desde este dispositivo.");
  };

  const handlePublish = async () => {
    if (!draft.name.trim()) {
      Alert.alert("Completa tu parche", "Necesitas mínimo un nombre para publicar.");
      return;
    }

    setIsPublishing(true);

    try {
      // Subir imágenes a Supabase Storage si son URIs locales
      let imageUrls: string[] = [];
      if (draft.images && draft.images.length > 0) {
        const localImages = draft.images.filter(img => img.startsWith('file://'));
        const remoteImages = draft.images.filter(img => !img.startsWith('file://'));

        if (localImages.length > 0) {
          const tempPlanId = `plan-${Date.now()}`;
          const uploadedUrls = await uploadPlanImages(tempPlanId, localImages);
          imageUrls = [...remoteImages, ...uploadedUrls];
        } else {
          imageUrls = remoteImages;
        }
      }

      // Crear el plan en Supabase usando tRPC
      await createPlanMutation.mutateAsync({
        name: draft.name,
        description: draft.description,
        category: draft.categories[0] || 'bar',
        primary_category: draft.categories[0] || 'bar',
        zone: draft.location.label,
        city: "Medellín",
        address: draft.location.label,
        latitude: draft.location.lat,
        longitude: draft.location.lng,
        capacity: draft.capacity,
        average_price: draft.averagePrice,
        price_type: draft.averagePrice > 100000 ? 'alto' : draft.averagePrice > 50000 ? 'medio-alto' : 'bajo',
        event_date: draft.eventDate || undefined,
        images: imageUrls,
        tags: draft.categories,
      });

      // Invalidar queries para actualizar la UI
      await utils.plans.getAll.invalidate();

      // Resetear borrador
      resetDraft();

      Alert.alert("Parche publicado", "¡Tu parche ya está visible para la comunidad!", [
        {
          text: "Ver inicio",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);
    } catch (error: any) {
      console.error('Error publishing plan:', error);
      Alert.alert("Error", error.message || "No se pudo publicar el parche. Inténtalo de nuevo.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <Text style={styles.title}>Revisemos tu parche</Text>
      <Text style={styles.subtitle}>Asegúrate de que todo esté listo antes de publicar.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Detalles principales</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Nombre</Text>
          <Text style={styles.rowValue}>{draft.name || "Sin título"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Categorías</Text>
          <View style={styles.tagsRow}>
            {draft.categories.length === 0 ? (
              <Text style={styles.rowValue}>Sin categorías</Text>
            ) : (
              draft.categories.map((category) => (
                <View key={category} style={styles.tag}>
                  <Text style={styles.tagText}>{category}</Text>
                </View>
              ))
            )}
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Ubicación</Text>
          <Text style={styles.rowValue}>{draft.location.label || "Por definir"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Capacidad</Text>
          <Text style={styles.rowValue}>{draft.capacity || "0"} personas</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Precio promedio</Text>
          <Text style={styles.rowValue}>{formattedPrice}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Fecha</Text>
          <Text style={styles.rowValue}>{formattedDate}</Text>
        </View>
        <View style={[styles.row, styles.descriptionRow]}>
          <Text style={styles.rowLabel}>Descripción</Text>
          <Text style={styles.description}>{draft.description || "Sin descripción"}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Imágenes</Text>
        <View style={styles.imagesGrid}>
          {draft.images.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.previewImage} />
          ))}
          {draft.images.length === 0 && (
            <Text style={styles.rowValue}>No se subieron imágenes.</Text>
          )}
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSaveDraft}
          disabled={isPublishing}
        >
          <Text style={styles.secondaryButtonText}>Guardar como borrador</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, isPublishing && styles.disabledButton]}
          onPress={handlePublish}
          disabled={isPublishing}
        >
          {isPublishing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Publicar</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backLink} onPress={onBack}>
        <Text style={styles.backLinkText}>← Volver a editar</Text>
      </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.horizontal,
    paddingBottom: theme.spacing.section * 2,
    gap: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 14,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  rowLabel: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
    width: 120,
  },
  rowValue: {
    color: theme.colors.textPrimary,
    flex: 1,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
  },
  tag: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: theme.radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  descriptionRow: {
    flexDirection: "column",
  },
  description: {
    color: theme.colors.textPrimary,
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  previewImage: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: theme.radii.md,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    backgroundColor: theme.colors.surface,
  },
  secondaryButtonText: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: theme.radii.pill,
    alignItems: "center",
    backgroundColor: theme.colors.primary,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  backLink: {
    alignItems: "center",
  },
  backLinkText: {
    color: theme.colors.textSecondary,
    textDecorationLine: "underline",
  },
});
