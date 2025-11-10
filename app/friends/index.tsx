import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link } from "expo-router";

import theme from "@/lib/theme";
import { useFriendsStore } from "@/store/friendsStore";

const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const EmptyState = ({ message, showSearchButton }: { message: string; showSearchButton?: boolean }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyStateText}>{message}</Text>
    {showSearchButton ? (
      <Link href="/friends/search" asChild>
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>Buscar amigos</Text>
        </TouchableOpacity>
      </Link>
    ) : null}
  </View>
);

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

export default function FriendsScreen() {
  const { friends, requestsReceived, acceptRequest, rejectRequest } = useFriendsStore();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <SectionTitle title="Solicitudes recibidas" />
          {requestsReceived.length === 0 ? (
            <EmptyState message="No tienes nuevas solicitudes." />
          ) : (
            requestsReceived.map((user) => (
              <View key={user.id} style={styles.row}>
                <Link href={`/user/${user.username}`} asChild>
                  <TouchableOpacity activeOpacity={0.85} style={styles.userInfoTouchable}>
                    <View style={styles.userInfo}>
                      <View style={[styles.avatar, { backgroundColor: user.avatarColor }]}>      
                        <Text style={styles.avatarText}>{initials(user.name)}</Text>
                      </View>
                      <View>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userSubtitle}>@{user.username}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Link>
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.chipButton, styles.acceptButton]}
                    onPress={() => acceptRequest(user)}
                  >
                    <Text style={styles.chipButtonText}>Aceptar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chipButton, styles.declineButton]}
                    onPress={() => rejectRequest(user)}
                  >
                    <Text style={styles.chipButtonText}>Rechazar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <SectionTitle title="Tus amigos" />
          {friends.length === 0 ? (
            <EmptyState
              message="Aún no tienes amigos agregados."
              showSearchButton
            />
          ) : (
            friends.map((user) => (
              <View key={user.id} style={styles.row}>
                <Link href={`/user/${user.username}`} asChild>
                  <TouchableOpacity activeOpacity={0.85} style={styles.userInfoTouchable}>
                    <View style={styles.userInfo}>
                      <View style={[styles.avatar, { backgroundColor: user.avatarColor }]}>      
                        <Text style={styles.avatarText}>{initials(user.name)}</Text>
                      </View>
                      <View>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userSubtitle}>@{user.username}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Link>
                <View style={styles.friendBadge}>
                  <Text style={styles.friendBadgeText}>Amigos ✓</Text>
                </View>
              </View>
            ))
          )}
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.horizontal,
    paddingTop: theme.spacing.section,
    paddingBottom: theme.spacing.section * 2,
    gap: theme.spacing.section,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  emptyState: {
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    gap: theme.spacing.md,
  },
  emptyStateText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  ctaButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    backgroundColor: "#FF3B30",
  },
  ctaButtonText: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  userInfoTouchable: {
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
    fontSize: 18,
  },
  userName: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  userSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  chipButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
  },
  acceptButton: {
    borderColor: "#FF3B30",
  },
  declineButton: {
    borderColor: theme.colors.border,
  },
  chipButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },
  friendBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.pill,
    backgroundColor: "rgba(255, 59, 48, 0.12)",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  friendBadgeText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
});

