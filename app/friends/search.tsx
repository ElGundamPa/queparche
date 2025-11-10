import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link } from "expo-router";

import theme from "@/lib/theme";
import { SOCIAL_MOCK_USERS } from "@/mocks/users";
import { useFriendsStore } from "@/store/friendsStore";

const normalize = (value: string) => value.trim().toLowerCase();

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

export default function FriendSearchScreen() {
  const [query, setQuery] = useState("");
  const {
    friends,
    requestsSent,
    requestsReceived,
    sendRequest,
    acceptRequest,
  } = useFriendsStore();

  const lowerQuery = normalize(query);
  const results = useMemo(() => {
    if (!lowerQuery) return SOCIAL_MOCK_USERS;
    return SOCIAL_MOCK_USERS.filter((user) => {
      const base = `${user.name} ${user.username}`.toLowerCase();
      return base.includes(lowerQuery);
    });
  }, [lowerQuery]);

  const isFriend = (userId: string) => friends.some((user) => user.id === userId);
  const hasSent = (userId: string) => requestsSent.some((user) => user.id === userId);
  const hasReceived = (userId: string) => requestsReceived.some((user) => user.id === userId);

  const handleSend = (userId: string) => {
    const target = SOCIAL_MOCK_USERS.find((item) => item.id === userId);
    if (!target) return;
    sendRequest(target);
    Alert.alert("Solicitud enviada", `Le avisaremos a ${target.name}.`);
  };

  const handleAccept = (userId: string) => {
    const target = requestsReceived.find((item) => item.id === userId);
    if (!target) return;
    acceptRequest(target);
    Alert.alert("Ahora son panas", `${target.name} ya aparece en tu lista de amigos.`);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por nombre o @username"
            placeholderTextColor="#808080"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.resultsWrapper}>
          {results.length === 0 ? (
            <Text style={styles.emptyText}>No encontramos coincidencias.</Text>
          ) : (
            results.map((user) => {
              const friend = isFriend(user.id);
              const sent = hasSent(user.id);
              const incoming = hasReceived(user.id);

              return (
                <View key={user.id} style={styles.card}>
                  <Link href={`/user/${user.username}`} asChild>
                    <TouchableOpacity activeOpacity={0.85} style={styles.cardInfoTouchable}>
                      <View style={styles.cardInfo}>
                        <View style={[styles.avatar, { backgroundColor: user.avatarColor }]}>    
                          <Text style={styles.avatarText}>{initials(user.name)}</Text>
                        </View>
                        <View>
                          <Text style={styles.cardTitle}>{user.name}</Text>
                          <Text style={styles.cardSubtitle}>@{user.username}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Link>

                  {friend ? (
                    <View style={[styles.statusBadge, styles.statusBadgeSuccess]}>
                      <Text style={styles.statusText}>Amigos ✓</Text>
                    </View>
                  ) : incoming ? (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.primaryButton]}
                      onPress={() => handleAccept(user.id)}
                    >
                      <Text style={styles.primaryButtonText}>Aceptar solicitud</Text>
                    </TouchableOpacity>
                  ) : sent ? (
                    <View style={[styles.statusBadge, styles.statusBadgePending]}>
                      <Text style={styles.statusText}>Solicitud enviada</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.primaryButton]}
                      onPress={() => handleSend(user.id)}
                    >
                      <Text style={styles.primaryButtonText}>Agregar amigo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
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
  inputWrapper: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  input: {
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  resultsWrapper: {
    gap: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  cardInfoTouchable: {
    flex: 1,
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
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
  cardTitle: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  cardSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.pill,
  },
  primaryButton: {
    backgroundColor: "#FF3B30",
  },
  primaryButtonText: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadgeSuccess: {
    borderColor: "#FF3B30",
    backgroundColor: "rgba(255, 59, 48, 0.12)",
  },
  statusBadgePending: {
    borderColor: theme.colors.border,
  },
  statusText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
});

