import React from "react";
import { TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft, Search } from "lucide-react-native";

export default function FriendsLayout() {
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0B0B0B" },
        headerTintColor: "#fff",
        headerTitleStyle: { color: "#fff" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Amistades",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Volver" style={{ padding: 8 }}>
              <ChevronLeft size={20} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/friends/search")}
              accessibilityLabel="Buscar amigos"
              style={{ padding: 8 }}
            >
              <Search size={18} color="#FF3B30" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="search"
        options={{
          title: "Buscar amigos",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Volver" style={{ padding: 8 }}>
              <ChevronLeft size={20} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
