import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

import theme from "@/lib/theme";
import { categories } from "@/mocks/categories";
import { useDraftsStore } from "@/store/draftsStore";
import type { WizardStepProps } from "./types";

export default function Step1({ onNext }: WizardStepProps) {
  const { draft, setDraftField } = useDraftsStore();

  const toggleCategory = (categoryName: string) => {
    const current = draft.categories;
    const exists = current.includes(categoryName);
    const nextCategories = exists
      ? current.filter((item) => item !== categoryName)
      : [...current, categoryName];
    setDraftField("categories", nextCategories);
  };

  const canContinue = draft.name.trim().length > 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.section}>
        <Text style={styles.label}>Nombre del parche</Text>
        <TextInput
          style={styles.input}
          placeholder="¿Cómo se llama tu parche?"
          placeholderTextColor="#666"
          value={draft.name}
          onChangeText={(value) => setDraftField("name", value)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Categorías</Text>
        <Text style={styles.helper}>
          Selecciona una o varias categorías que describan tu parche.
        </Text>
        <View style={styles.chipsContainer}>
          {categories.map((category) => {
            const isSelected = draft.categories.includes(category.name);
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggleCategory(category.name)}
                activeOpacity={0.85}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.nextButton, !canContinue && styles.nextButtonDisabled]}
        onPress={onNext}
        disabled={!canContinue}
        activeOpacity={0.9}
      >
        <Text style={styles.nextButtonText}>Siguiente</Text>
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
    gap: theme.spacing.section,
  },
  section: {
    gap: 12,
  },
  label: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  helper: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  nextButton: {
    marginTop: theme.spacing.section,
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
