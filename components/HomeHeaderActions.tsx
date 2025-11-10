import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { Users } from "lucide-react-native";

export default function HomeHeaderActions() {
  return (
    <View style={{ flexDirection: "row", gap: 12, paddingRight: 12 }}>
      <Link href="/friends" asChild>
        <TouchableOpacity
          accessibilityLabel="Amigos"
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#151515",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Users size={18} color="#fff" />
        </TouchableOpacity>
      </Link>
    </View>
  );
}
