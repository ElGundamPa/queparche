import React from "react";
import { ScrollView, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams } from "expo-router";

const MOCK_USERS: Record<string, {
  name: string;
  username: string;
  bio: string;
  city: string;
  stats: {
    patches: number;
    friends: number;
  };
}> = {
  sarita: {
    name: "Sara Q.",
    username: "sarita",
    bio: "Amante de cafés y rooftops",
    city: "Medellín",
    stats: { patches: 42, friends: 128 },
  },
  jtoro: {
    name: "Julián T.",
    username: "jtoro",
    bio: "Miradores y senderismo",
    city: "Envigado",
    stats: { patches: 31, friends: 87 },
  },
  valer: {
    name: "Valentina R.",
    username: "valer",
    bio: "Rooftops, cocteles y sunsets",
    city: "Laureles",
    stats: { patches: 54, friends: 203 },
  },
};

export default function PublicProfile() {
  const { username } = useLocalSearchParams<{ username?: string }>();
  const user = username ? MOCK_USERS[String(username).toLowerCase()] : null;

  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0B0B0B",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <StatusBar style="light" />
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Perfil no encontrado</Text>
        <Text style={{ color: "#bbb", marginTop: 6 }}>No pudimos cargar este perfil.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0B0B0B" }}
      contentContainerStyle={{ padding: 16, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="light" />
      {/* Banner mock */}
      <View style={{ height: 140, backgroundColor: "#111", borderRadius: 16 }} />

      <View style={{ gap: 8 }}>
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>{user.name}</Text>
        <Text style={{ color: "#bbb" }}>
          @{user.username} · {user.city}
        </Text>
        <Text style={{ color: "#ddd", marginTop: 4 }}>{user.bio}</Text>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ backgroundColor: "#121212", padding: 12, borderRadius: 12, flex: 1 }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 18 }}>{user.stats.patches}</Text>
          <Text style={{ color: "#bbb", marginTop: 4 }}>Parches</Text>
        </View>
        <View style={{ backgroundColor: "#121212", padding: 12, borderRadius: 12, flex: 1 }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 18 }}>{user.stats.friends}</Text>
          <Text style={{ color: "#bbb", marginTop: 4 }}>Amigos</Text>
        </View>
      </View>

      <View style={{ gap: 12, marginTop: 8 }}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Parches recientes</Text>
        <View style={{ backgroundColor: "#121212", height: 80, borderRadius: 12 }} />
        <View style={{ backgroundColor: "#121212", height: 80, borderRadius: 12 }} />
        <View style={{ backgroundColor: "#121212", height: 80, borderRadius: 12 }} />
      </View>
    </ScrollView>
  );
}
