import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import theme from "@/lib/theme";

export default function CreatePostScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: "Crear Parche",
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.textPrimary,
        }} 
      />
      <View style={styles.container}>
        <StatusBar style="light" />
        
        <View style={styles.content}>
          <Text style={styles.title}>Crear tu Parche</Text>
          <Text style={styles.subtitle}>
            Publica un plan con ubicación y detalles
          </Text>

          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 30,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

