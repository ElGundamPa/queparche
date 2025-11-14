import React, { useMemo, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useNavigation } from "expo-router";

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

  if (diff < minute) return "ahora";

  const minutes = Math.floor(diff / minute);
  if (minutes < 60) return `hace ${minutes}m`;

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

export default function ChatsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const currentUser = useAuthStore((state) => state.currentUser);
  const userId = currentUser?.id ?? "";
  const chatsRecord = useChatStore((state) => state.chats);
  const getUnreadCountByChat = useChatStore((state) => state.getUnreadCountByChat);
  const getTotalUnreadChats = useChatStore((state) => state.getTotalUnreadChats);

  // Convertir Record a array y filtrar por usuario
  const chats = useMemo(() => {
    if (!userId) return [];
    const chatsArray = Object.values(chatsRecord);
    return chatsArray
      .filter((chat) => chat.userIds.includes(userId))
      .map((chat) => {
        const lastMessage = chat.messages[chat.messages.length - 1];
        return {
          id: chat.id,
          chat,
          lastMessage: lastMessage?.text || (lastMessage?.planId ? "🔥 Parche compartido" : "Nuevo chat"),
          timestamp: lastMessage?.createdAt ?? chat.messages[0]?.createdAt ?? Date.now(),
          unreadCount: getUnreadCountByChat(chat.id, userId),
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [chatsRecord, userId, getUnreadCountByChat]);

  const unreadCount = useMemo(() => {
    return getTotalUnreadChats(userId);
  }, [getTotalUnreadChats, userId, chatsRecord]);

  useEffect(() => {
    if (navigation) {
      navigation.setOptions({
        headerRight: () =>
          unreadCount > 0 ? (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
            </View>
          ) : null,
      });
    }
  }, [navigation, unreadCount]);

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

  const handleChatPress = useCallback(
    (chatId: string) => {
      router.push(`/chat/${chatId}`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: typeof chats[0] }) => {
      const otherUserId = item.chat.userIds.find((id) => id !== userId) ?? userId;
      const user = usersDirectory.get(otherUserId);
      const hasUnread = item.unreadCount > 0;

      return (
        <TouchableOpacity
          style={[styles.chatRow, hasUnread && styles.chatRowUnread]}
          onPress={() => handleChatPress(item.id)}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: user?.avatar ?? DEFAULT_AVATAR }}
            style={styles.avatar}
            contentFit="cover"
          />
          <View style={styles.chatInfo}>
            <View style={styles.chatInfoHeader}>
              <Text style={styles.chatName}>{user?.name ?? "Explorador"}</Text>
              <Text style={styles.chatTime}>{formatRelativeTime(item.timestamp)}</Text>
            </View>
            <View style={styles.chatMessageRow}>
              <Text style={[styles.chatLastMessage, hasUnread && styles.chatLastMessageUnread]} numberOfLines={1}>
                {item.lastMessage}
              </Text>
              {hasUnread && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{item.unreadCount > 9 ? "9+" : item.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [userId, usersDirectory, handleChatPress]
  );

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Debes iniciar sesión para ver tus chats.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={chats.length === 0 ? styles.emptyContainer : styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chats recientes 🤙🔥</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Habla suavete con tus bros 🤙</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  listContent: {
    paddingBottom: 24,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
    backgroundColor: "#111111",
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 20,
  },
  chatRowUnread: {
    backgroundColor: "#1A1A1A",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#151515",
  },
  chatInfo: {
    flex: 1,
    gap: 6,
  },
  chatInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  chatTime: {
    color: "#9B9B9B",
    fontSize: 13,
  },
  chatMessageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  chatLastMessage: {
    color: "#9B9B9B",
    fontSize: 15,
    flex: 1,
  },
  chatLastMessageUnread: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  headerBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginRight: 16,
  },
  headerBadgeText: {
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
    paddingTop: 60,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
});
