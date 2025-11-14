import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import Animated, { FadeInUp } from "react-native-reanimated";
import { ArrowLeft } from "lucide-react-native";

import { useNotificationsStore, type NotificationItem } from "@/store/notificationsStore";
import { usePlanStore } from "@/store/plansStore";
import { mockPlans } from "@/mocks/plans";
import { mockUsers, SOCIAL_MOCK_USERS } from "@/mocks/users";
import { useAuthStore } from "@/hooks/use-auth-store";

const DEFAULT_AVATAR = "https://avatar.vercel.sh/queparche-notif?size=64&background=111111&color=ffffff" as const;

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

export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useNotificationsStore((state) => state.notifications);
  const lastReadAt = useNotificationsStore((state) => state.lastReadAt);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);
  const removeNotification = useNotificationsStore((state) => state.removeNotification);
  const plansFromStore = usePlanStore((state) => state.plans);
  const authUsers = useAuthStore((state) => state.users);

  const usersDirectory = useMemo(() => {
    const directory = new Map<string, { name: string; username: string; avatar: string }>();
    [...authUsers, ...mockUsers, ...SOCIAL_MOCK_USERS].forEach((user) => {
      if (!directory.has(user.id)) {
        const name = (user as any).name ?? (user as any).fullName ?? (user as any).username ?? "Explorador";
        const username = (user as any).username ?? (user as any).name ?? `user-${user.id}`;
        const avatarColor = (user as any).avatarColor;
        const avatarFromColor = avatarColor
          ? `https://avatar.vercel.sh/${encodeURIComponent(username)}?size=64&background=${avatarColor.replace("#", "")}&color=ffffff`
          : undefined;
        const avatar = (user as any).avatar ?? avatarFromColor ?? DEFAULT_AVATAR;

        directory.set(user.id, {
          name,
          username,
          avatar,
        });
      }
    });
    return directory;
  }, [authUsers]);

  const plansDirectory = useMemo(() => {
    const map = new Map<string, { name: string }>();
    [...plansFromStore, ...mockPlans].forEach((plan) => {
      if (!map.has(plan.id)) {
        map.set(plan.id, { name: plan.name });
      }
    });
    return map;
  }, [plansFromStore]);

  const hasUnread = useMemo(
    () => notifications.some((notification) => !lastReadAt || notification.createdAt > lastReadAt),
    [notifications, lastReadAt]
  );

  const renderMessage = useCallback(
    (type: string, actorName: string, planName?: string) => {
      switch (type) {
        case "comment":
          return `${actorName} comentó en tu parche${planName ? ` ${planName}` : ""}`;
        case "like":
          return `${actorName} reaccionó a tu comentario${planName ? ` en ${planName}` : ""}`;
        case "follow":
          return `${actorName} comenzó a seguirte`;
        case "joined":
          return `${actorName} se unió a tu parche${planName ? ` ${planName}` : ""}`;
        default:
          return `${actorName} interactuó contigo`;
      }
    },
    []
  );

  const handlePress = useCallback(
    (notification: NotificationItem) => {
      if (notification.targetPlanId) {
        router.push(`/plan/${notification.targetPlanId}`);
      }
    },
    [router]
  );

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.inlineHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.inlineBackButton}>
          <ArrowLeft size={22} color="#FFD54F" />
        </TouchableOpacity>
        <Text style={styles.inlineHeaderTitle}>Notificaciones</Text>
        <TouchableOpacity
          onPress={markAllAsRead}
          disabled={!hasUnread}
          style={styles.inlineMarkButton}
        >
          <Text
            style={[
              styles.markAllButtonText,
              !hasUnread && styles.markAllButtonTextDisabled,
            ]}
          >
            Marcar leídas
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyContainer : styles.listContent
        }
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Sin notificaciones todavía</Text>
            <Text style={styles.emptySubtitle}>Cuando alguien interactúe contigo aparecerá aquí.</Text>
          </View>
        )}
        renderItem={({ item, index }) => {
          const actor = usersDirectory.get(item.actorId);
          const actorName = actor?.name || actor?.username || "Explorador";
          const avatar = actor?.avatar || DEFAULT_AVATAR;
          const planName = item.targetPlanId
            ? plansDirectory.get(item.targetPlanId)?.name
            : undefined;

          return (
            <Animated.View entering={FadeInUp.delay(index * 50).duration(250)}>
              <TouchableOpacity
                style={styles.notificationRow}
                onPress={() => handlePress(item)}
                activeOpacity={item.targetPlanId ? 0.8 : 1}
              >
                <Image source={{ uri: avatar }} style={styles.notificationAvatar} cachePolicy="memory-disk" />
                <View style={styles.notificationBody}>
                  <Text style={styles.notificationMessage} numberOfLines={2}>
                    {renderMessage(item.type, actorName, planName)}
                  </Text>
                  <Text style={styles.notificationTime}>{formatRelativeTime(item.createdAt)}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeNotification(item.id)}
                  style={styles.dismissButton}
                  accessibilityLabel="Descartar notificación"
                >
                  <Text style={styles.dismissButtonText}>×</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  listContent: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: "#BBBBBB",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  separator: {
    height: 1,
    marginLeft: 72,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  notificationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  notificationAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  notificationBody: {
    flex: 1,
  },
  notificationMessage: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
    fontWeight: "600",
  },
  notificationTime: {
    color: "#BBBBBB",
    fontSize: 12,
  },
  dismissButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#151515",
    marginLeft: 12,
  },
  dismissButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 16,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllButtonText: {
    color: "#FFD54F",
    fontSize: 13,
    fontWeight: "600",
  },
  markAllButtonTextDisabled: {
    color: "#555555",
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  inlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  inlineBackButton: {
    padding: 8,
  },
  inlineHeaderTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginHorizontal: 12,
  },
  inlineMarkButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
