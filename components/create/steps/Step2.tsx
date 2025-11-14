import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";

import theme from "@/lib/theme";
import { useDraftsStore } from "@/store/draftsStore";
import type { WizardStepProps } from "./types";

const DEFAULT_REGION = {
  latitude: 6.2442,
  longitude: -75.5812,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function Step2({ onNext }: WizardStepProps) {
  const { draft, setDraftField } = useDraftsStore();
  const [mapReady, setMapReady] = useState(false);
  const [MapView, setMapView] = useState<any>(null);
  const [Marker, setMarker] = useState<any>(null);
  const [region, setRegion] = useState(DEFAULT_REGION);

  const hasLocation = draft.location.label.trim().length > 0;

  const markerPosition = useMemo(() => {
    if (!draft.location.lat || !draft.location.lng) {
      return {
        latitude: region.latitude,
        longitude: region.longitude,
      };
    }
    return {
      latitude: draft.location.lat,
      longitude: draft.location.lng,
    };
  }, [draft.location.lat, draft.location.lng, region.latitude, region.longitude]);

  useEffect(() => {
    if (Platform.OS !== "web") {
      import("react-native-maps").then((MapModule) => {
        setMapView(() => MapModule.default);
        setMarker(() => MapModule.Marker);
        setMapReady(true);
      });
    }
  }, []);

  const fade = useSharedValue(0);
  useEffect(() => {
    fade.value = withTiming(1, { duration: 220 });
  }, [fade]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [
      {
        translateY: withTiming(fade.value === 1 ? 0 : 12, { duration: 220 }),
      },
    ],
  }));

  const handleSelectPoint = (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    if (!coordinate) return;

    setDraftField("location", {
      lat: coordinate.latitude,
      lng: coordinate.longitude,
      label: draft.location.label,
    });
    setRegion((prev) => ({
      ...prev,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    }));
  };

  const handleLabelChange = (value: string) => {
    setDraftField("location", {
      ...draft.location,
      label: value,
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.section}>
        <Text style={styles.label}>Ubicación</Text>
        <Text style={styles.helper}>Selecciona el punto en el mapa y asigna un nombre.</Text>
      </View>

      <View style={styles.mapWrapper}>
        {Platform.OS === "web" ? (
          <View style={styles.webFallback}>
            <Text style={styles.webFallbackTitle}>Mapa no disponible en web</Text>
            <Text style={styles.webFallbackText}>
              Ingresa una dirección o describe la ubicación en el campo inferior.
            </Text>
          </View>
        ) : MapView && Marker ? (
          <MapView
            style={styles.map}
            initialRegion={region}
            region={region}
            onRegionChangeComplete={(value: any) => setRegion(value)}
            onPress={handleSelectPoint}
          >
            <Marker coordinate={markerPosition} />
          </MapView>
        ) : (
          <View style={styles.webFallback}>
            <Text style={styles.webFallbackTitle}>Cargando mapa...</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Dirección o referencia</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Rooftop en Laureles"
          placeholderTextColor="#666"
          value={draft.location.label}
          onChangeText={handleLabelChange}
        />
      </View>

      <TouchableOpacity
        style={[styles.nextButton, !hasLocation && styles.nextButtonDisabled]}
        disabled={!hasLocation || (!mapReady && Platform.OS !== "web")}
        onPress={onNext}
        activeOpacity={0.9}
      >
        <Text style={styles.nextButtonText}>Siguiente</Text>
      </TouchableOpacity>
      </Animated.View>
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
  mapWrapper: {
    height: 260,
    borderRadius: theme.radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#0f0f0f",
  },
  map: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  webFallbackTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  webFallbackText: {
    color: theme.colors.textSecondary,
    textAlign: "center",
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
