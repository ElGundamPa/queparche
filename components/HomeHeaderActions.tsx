import React, { useMemo } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Link } from "expo-router";
import { Users, Bell } from "lucide-react-native";

import { useNotificationsStore } from "@/store/notificationsStore";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/hooks/use-auth-store";

export default function HomeHeaderActions() {
  const notifications = useNotificationsStore((state) => state.notifications);
  const lastReadAt = useNotificationsStore((state) => state.lastReadAt);
  const currentUser = useAuthStore((state) => state.currentUser);
  const getTotalUnreadChats = useChatStore((state) => state.getTotalUnreadChats);
  
  const unreadCount = useMemo(() => {
    return currentUser?.id ? getTotalUnreadChats(currentUser.id) : 0;
  }, [currentUser?.id, getTotalUnreadChats]);

  const hasUnread = useMemo(
    () => notifications.some((notification) => !lastReadAt || notification.createdAt > lastReadAt),
    [notifications, lastReadAt]
  );

  return (
    <View style={{ flexDirection: "row", gap: 12, paddingRight: 12 }}>
      <Link href="/notifications" asChild>
        <TouchableOpacity
          accessibilityLabel="Notificaciones"
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#151515",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Bell size={18} color="#fff" />
          {hasUnread && (
            <View
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#FF6B6B",
              }}
            />
          )}
        </TouchableOpacity>
      </Link>

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
            position: "relative",
          }}
        >
          <Users size={18} color="#fff" />
          {unreadCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: "#E53935",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "bold" }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Link>
    </View>
  );
}
