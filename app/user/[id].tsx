import React, { useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import theme from "@/lib/theme";
import { SOCIAL_MOCK_USERS } from "@/mocks/users";
import { useFriendsStore } from "@/store/friendsStore";
import { useChatStore } from "@/store/chatStore";
import { StatusBar } from "expo-status-bar";

const MOCK_VISITS = [
  { id: "patch-1", title: "Rooftop Brilloteo", date: "Hace 2 días" },
  { id: "patch-2", title: "Tour graffiti Comuna 13", date: "Hace 1 semana" },
  { id: "patch-3", title: "Noche de vinilos en Laureles", date: "Hace 2 semanas" },
];

const statsFromId = (id: string) => {
  const seed = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    created: (seed % 7) + 3,
    visited: (seed % 12) + 8,
    level: `Nivel ${((seed % 5) + 3).toString()}`,
  };
};

export default function UserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    followUser,
    unfollowUser,
    removeFriend,
    isFollowing,
    isFollowedBy,
    isMutual,
    currentUserId,
    follows,
  } = useFriendsStore();

  const user = useMemo(() => SOCIAL_MOCK_USERS.find((item) => item.id === id), [id]);

  if (!user) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundTitle}>Usuario no encontrado</Text>
        <Text style={styles.notFoundSubtitle}>No pudimos cargar este perfil.</Text>
        <TouchableOpacity style={styles.notFoundButton} onPress={() => router.back()}>
          <Text style={styles.notFoundButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stats = statsFromId(user.id);
  const following = isFollowing(currentUserId, user.id);
  const followedBy = isFollowedBy(currentUserId, user.id);
  const mutual = isMutual(currentUserId, user.id);

  const followersCount = follows.filter((relation) => relation.followingId === user.id).length;
  const followingCount = follows.filter((relation) => relation.followerId === user.id).length;

  const handleMutualActions = () => {
    const options = [
      "Cancelar",
      "Ver historial de parches",
      "Invita a tu bro 🤙",
      "Enviar mensaje",
      "Dejar de ser amigos",
    ];
    Alert.alert("Acciones", undefined, [
      { text: options[1], onPress: () => router.push("/coming-soon") },
      {
        text: options[2],
        onPress: () => {
          if (!currentUserId) return;
          const chatId = useChatStore.getState().createChatIfNotExists(currentUserId, user.id);
          router.push(`/chat/${chatId}`);
        },
      },
      {
        text: options[3],
        onPress: () => {
          if (!currentUserId) return;
          const chatId = useChatStore.getState().createChatIfNotExists(currentUserId, user.id);
          router.push(`/chat/${chatId}`);
        },
      },
      { text: options[4], style: "destructive", onPress: () => removeFriend(user) },
      { text: options[0], style: "cancel" },
    ]);
  };

  let buttonLabel = "Seguir";
  let buttonStyle = [styles.actionButton, styles.primaryButton];
  let buttonAction: (() => void) | undefined = () => followUser(user);

  if (mutual) {
    buttonLabel = "Amigos ✓";
    buttonStyle = [styles.actionButton, styles.primaryButton];
    buttonAction = handleMutualActions;
  } else if (following && !followedBy) {
    buttonLabel = "Siguiendo";
    buttonStyle = [styles.actionButton, styles.disabledButton];
    buttonAction = () => unfollowUser(user);
  } else if (!following && followedBy) {
    buttonLabel = "Seguir de vuelta";
    buttonStyle = [styles.actionButton, styles.primaryButton];
    buttonAction = () => followUser(user);
  }

  const buttonDisabled = !buttonAction;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarWrapper}>
          <View style={[styles.avatar, { backgroundColor: user.avatarColor }]}
          >
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>@{user.username}</Text>
        </View>

        <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.created}</Text>
          <Text style={styles.statLabel}>Parches creados</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{followersCount}</Text>
          <Text style={styles.statLabel}>Seguidores</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{followingCount}</Text>
          <Text style={styles.statLabel}>Siguiendo</Text>
        </View>
        </View>

        <TouchableOpacity
          style={buttonStyle}
          disabled={buttonDisabled}
          onPress={buttonAction}
        >
          <Text style={styles.actionButtonText}>{buttonLabel}</Text>
        </TouchableOpacity>

        <View style={styles.visitsSection}>
          <Text style={styles.sectionTitle}>Últimos parches visitados</Text>
          {MOCK_VISITS.map((visit) => (
            <View key={visit.id} style={styles.visitRow}>
              <View style={styles.visitDot} />
              <View>
                <Text style={styles.visitTitle}>{visit.title}</Text>
                <Text style={styles.visitSubtitle}>{visit.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.horizontal,
    paddingTop: theme.spacing.section,
    paddingBottom: theme.spacing.section * 2,
    gap: theme.spacing.section,
  },
  avatarWrapper: {
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: theme.colors.textPrimary,
    fontSize: 48,
    fontWeight: "700",
  },
  name: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
  },
  username: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statNumber: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: theme.radii.pill,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#FF3B30",
  },
  disabledButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  actionButtonText: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  visitsSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  visitRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    alignItems: "center",
  },
  visitDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF3B30",
  },
  visitTitle: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  visitSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.horizontal,
    gap: theme.spacing.md,
  },
  notFoundTitle: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
  },
  notFoundSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  notFoundButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.pill,
  },
  notFoundButtonText: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
});
