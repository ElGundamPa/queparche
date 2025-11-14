import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";

import theme from "@/lib/theme";
import { useDraftsStore } from "@/store/draftsStore";
import type { WizardStepProps } from "./types";

const MAX_CAPACITY = 200;

const createOptionDates = () => {
  const now = new Date();
  const today = new Date(now);
  today.setHours(20, 0, 0, 0);

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(20, 0, 0, 0);

  const weekend = new Date(now);
  const day = weekend.getDay();
  const diff = (6 - day + 7) % 7; // próximo sábado
  weekend.setDate(weekend.getDate() + diff);
  weekend.setHours(18, 0, 0, 0);

  return [
    { label: "Hoy 8:00 PM", value: today },
    { label: "Mañana 8:00 PM", value: tomorrow },
    { label: "Este fin de semana", value: weekend },
  ];
};

export default function Step3({ onNext }: WizardStepProps) {
  const { draft, setDraftField } = useDraftsStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [trackWidth, setTrackWidth] = useState(1);

  const updateCapacityFromPosition = (locationX: number) => {
    const clamped = Math.max(0, Math.min(locationX, trackWidth));
    const nextCapacity = Math.round((clamped / trackWidth) * MAX_CAPACITY);
    setDraftField("capacity", nextCapacity);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt: GestureResponderEvent) => {
          updateCapacityFromPosition(evt.nativeEvent.locationX);
        },
        onPanResponderMove: (evt: GestureResponderEvent) => {
          updateCapacityFromPosition(evt.nativeEvent.locationX);
        },
      }),
    [trackWidth]
  );

  const progressPercentage = Math.min(100, Math.max(0, (draft.capacity / MAX_CAPACITY) * 100));
  const dateOptions = useMemo(createOptionDates, []);
  const formattedCapacity = `${draft.capacity} personas`;
  const formattedPrice = draft.averagePrice > 0 ? `$${draft.averagePrice.toLocaleString("es-CO")}` : "$0";
  const formattedDate = draft.eventDate
    ? new Date(draft.eventDate).toLocaleString("es-CO", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Sin fecha";

  const handlePriceChange = (value: string) => {
    const numeric = Number(value.replace(/[^0-9]/g, ""));
    setDraftField("averagePrice", Number.isNaN(numeric) ? 0 : numeric);
  };

  const handleDescriptionChange = (value: string) => {
    setDraftField("description", value);
  };

  const handleDateConfirm = (_event: any, date?: Date) => {
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }
    if (date) {
      setDraftField("eventDate", date.toISOString());
    }
  };

  const clearDate = () => setDraftField("eventDate", null);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Capacidad estimada</Text>
        <Text style={styles.helper}>¿Cuántas personas pueden asistir?</Text>

        <View
          style={styles.sliderTrack}
          onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
          {...panResponder.panHandlers}
        >
          <View
            style={[styles.sliderFill, { width: `${progressPercentage}%` }]}
          />
          <View
            style={[styles.sliderThumb, { left: `${progressPercentage}%` }]}
          />
        </View>
        <Text style={styles.value}>{formattedCapacity}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Precio promedio por persona</Text>
        <TextInput
          style={styles.input}
          value={draft.averagePrice ? draft.averagePrice.toString() : ""}
          onChangeText={handlePriceChange}
          keyboardType="numeric"
          placeholder="Ingresa un valor aproximado"
          placeholderTextColor="#666"
        />
        <Text style={styles.helper}>Precio estimado: {formattedPrice}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Descripción (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
          value={draft.description}
          onChangeText={handleDescriptionChange}
          placeholder="Comparte detalles del ambiente, dress code o recomendaciones."
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Fecha del evento (opcional)</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>Seleccionar fecha</Text>
          </TouchableOpacity>
          {draft.eventDate ? (
            <TouchableOpacity onPress={clearDate} style={styles.clearDateButton}>
              <Text style={styles.clearDateText}>Limpiar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <Text style={styles.helper}>Seleccionada: {formattedDate}</Text>
      </View>

      <Modal visible={showDatePicker} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Elige una fecha rápida</Text>
            {dateOptions.map((option) => (
              <TouchableOpacity
                key={option.label}
                style={styles.modalOption}
                onPress={() => {
                  setDraftField("eventDate", option.value.toISOString());
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.modalOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                const custom = new Date();
                custom.setHours(custom.getHours() + 2);
                setDraftField("eventDate", custom.toISOString());
                setShowDatePicker(false);
              }}
            >
              <Text style={styles.modalOptionText}>Agendar para dentro de 2 horas</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity
        style={styles.nextButton}
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
  sliderTrack: {
    height: 14,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    position: "relative",
  },
  sliderFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  sliderThumb: {
    position: "absolute",
    top: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: theme.colors.primary,
    marginLeft: -12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  value: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
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
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.radii.pill,
  },
  dateButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  clearDateButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  clearDateText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  nextButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.radii.pill,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
  modalOption: {
    paddingVertical: 12,
  },
  modalOptionText: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
});
