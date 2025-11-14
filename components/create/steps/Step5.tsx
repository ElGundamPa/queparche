import React from "react";
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
} from "react-native";
import { useRouter } from "expo-router";

import theme from "@/lib/theme";
import { useDraftsStore } from "@/store/draftsStore";
import type { WizardStepProps } from "./types";

export default function Step5({ onBack, onNext: _onNext }: WizardStepProps) {
  const router = useRouter();
  const { draft, saveDraft, publishDraft } = useDraftsStore();

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

  const handlePublish = () => {
    const plan = publishDraft(router);
    if (!plan) {
      Alert.alert("Completa tu parche", "Necesitas mínimo un nombre para publicar.");
      return;
    }

    Alert.alert("Parche publicado", "¡Tu parche ya está visible para la comunidad!", [
      {
        text: "Ver parche",
        onPress: () => router.replace(`/plan/${plan.id}`),
      },
    ]);
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
        <TouchableOpacity style={styles.secondaryButton} onPress={handleSaveDraft}>
          <Text style={styles.secondaryButtonText}>Guardar como borrador</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handlePublish}>
          <Text style={styles.primaryButtonText}>Publicar</Text>
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
  backLink: {
    alignItems: "center",
  },
  backLinkText: {
    color: theme.colors.textSecondary,
    textDecorationLine: "underline",
  },
});
