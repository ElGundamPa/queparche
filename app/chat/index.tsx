import React, { useMemo, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";

import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/hooks/use-auth-store";
import { mockUsers, SOCIAL_MOCK_USERS } from "@/mocks/users";

const DEFAULT_AVATAR = "https://avatar.vercel.sh/queparche?size=64&background=111111&color=ffffff" as const;

const formatRelativeTime = (timestamp: number) => {
  const now = Date.now();
  const diff = Math.max(0, now - timestamp);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "hace instantes";

  const minutes = Math.floor(diff / minute);
  if (minutes < 60) return `hace ${minutes}min`;

  const hours = Math.floor(diff / hour);
  if (hours < 24) return `hace ${hours}h`;

  const days = Math.floor(diff / day);
  if (days < 7) return `hace ${days}d`;

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `hace ${weeks}sem`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months}m`;

  const years = Math.floor(days / 365);
  return `hace ${years}a`;
};

export default function ChatListScreen() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);
  const userId = currentUser?.id ?? "";
  const allChats = useChatStore((state) => state.chats);
  const getUnreadCountByChat = useChatStore((state) => state.getUnreadCountByChat);

  const chats = useMemo(() => {
    if (!userId) return [];
    return allChats
      .filter((chat) => chat.participants.includes(userId))
      .sort((a, b) => {
        const aLastMsg = a.messages[a.messages.length - 1];
        const bLastMsg = b.messages[b.messages.length - 1];
        const aTime = aLastMsg?.createdAt ?? 0;
        const bTime = bLastMsg?.createdAt ?? 0;
        return bTime - aTime;
      });
  }, [allChats, userId]);

  const usersDirectory = useMemo(() => {
    const map = new Map<string, { id: string; name: string; username: string; avatar: string }>();
    [...mockUsers, ...SOCIAL_MOCK_USERS].forEach((user) => {
      const name = user.name ?? user.username ?? "Explorador";
      const avatar = "avatar" in user ? user.avatar : DEFAULT_AVATAR;
      map.set(user.id, {
        id: user.id,
        name,
        username: user.username ?? name,
        avatar: avatar ?? DEFAULT_AVATAR,
      });
    });
    if (currentUser) {
      map.set(currentUser.id, {
        id: currentUser.id,
        name: currentUser.name ?? currentUser.username ?? "Tú",
        username: currentUser.username ?? currentUser.name ?? "tu-perfil",
        avatar: currentUser.avatar ?? DEFAULT_AVATAR,
      });
    }
    return map;
  }, [currentUser]);

  const renderItem = useCallback(
    ({ item }: { item: typeof chats[0] }) => {
      const otherUserId = item.participants.find((participant) => participant !== userId) ?? userId;
      const user = usersDirectory.get(otherUserId);
      const lastMessage = item.messages[item.messages.length - 1];
      const unreadCount = getUnreadCountByChat(item.id, userId);

      const lastMessageText = lastMessage
        ? lastMessage.planId
          ? "🔥 Parche compartido"
          : lastMessage.text ?? "Mensaje"
        : "Nuevo chat";

      const lastMessageTime = lastMessage ? formatRelativeTime(lastMessage.createdAt) : "";
      const hasUnread = unreadCount > 0;

      return (
        <TouchableOpacity
          style={[styles.chatRow, hasUnread && styles.chatRowUnread]}
          onPress={() => router.push(`/chat/${item.id}`)}
          activeOpacity={0.85}
        >
          <Image
            source={{ uri: user?.avatar ?? DEFAULT_AVATAR }}
            style={styles.avatar}
            contentFit="cover"
          />
          <View style={styles.chatInfo}>
            <View style={styles.chatInfoHeader}>
              <Text style={styles.chatName}>{user?.name ?? "Explorador"}</Text>
              {lastMessageTime ? <Text style={styles.chatTime}>{lastMessageTime}</Text> : null}
            </View>
            <Text style={[styles.chatLastMessage, hasUnread && styles.chatLastMessageUnread]} numberOfLines={1}>
              {lastMessageText}
            </Text>
          </View>
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [router, userId, usersDirectory, getUnreadCountByChat]
  );

  if (!currentUser) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Debes iniciar sesión para ver tus chats.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          chats.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Habla suavete con tus bros 🤙</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  listContent: {
    paddingVertical: 16,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  chatRowUnread: {
    backgroundColor: "rgba(229, 57, 53, 0.08)",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#151515",
  },
  chatInfo: {
    flex: 1,
    gap: 4,
  },
  chatInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  chatTime: {
    color: "#888888",
    fontSize: 12,
  },
  chatLastMessage: {
    color: "#BBBBBB",
    fontSize: 13,
  },
  chatLastMessageUnread: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
