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
          title: "Amigos",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Volver" style={{ padding: 8 }}>
              <ChevronLeft size={20} color="#fff" />
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
      <Stack.Screen
        name="chats"
        options={{
          title: "Chats 🤙",
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
