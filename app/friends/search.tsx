import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link, useRouter } from "expo-router";
import { Platform } from "react-native";

import theme from "@/lib/theme";
import { SOCIAL_MOCK_USERS, type SocialUser } from "@/mocks/users";
import { useFriendsStore } from "@/store/friendsStore";
import { useChatStore } from "@/store/chatStore";

const normalize = (value: string) => value.trim().toLowerCase();

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

export default function FriendSearchScreen() {
  const [query, setQuery] = useState("");
  const { followUser, unfollowUser, removeFriend, isFollowing, isFollowedBy, isMutual, currentUserId } =
    useFriendsStore();
  const router = useRouter();

  const lowerQuery = normalize(query);
  const results = useMemo(() => {
    if (!lowerQuery) return SOCIAL_MOCK_USERS;
    return SOCIAL_MOCK_USERS.filter((user) => {
      const base = `${user.name} ${user.username}`.toLowerCase();
      return base.includes(lowerQuery);
    });
  }, [lowerQuery]);

  const handleSend = (user: SocialUser) => {
    followUser(user);
  };

  const handleMutualActions = (user: SocialUser) => {
    const options = [
      "Cancelar",
      "Ver historial de parches",
      "Invita a tu bro 🤙",
      "Enviar mensaje",
      "Dejar de ser amigos",
    ];
    const destructiveIndex = 4;
    const cancelIndex = 0;

    const handleOption = (index: number) => {
      switch (index) {
        case 1:
          router.push("/coming-soon");
          break;
        case 2:
        case 3: {
          if (!currentUserId) return;
          const chatId = useChatStore.getState().createChatIfNotExists(currentUserId, user.id);
          router.push(`/chat/${chatId}`);
          break;
        }
        case 4:
          removeFriend(user);
          break;
        default:
          break;
      }
    };

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: destructiveIndex,
          cancelButtonIndex: cancelIndex,
          userInterfaceStyle: "dark",
        },
        handleOption
      );
    } else {
      Alert.alert(
        "Acciones",
        undefined,
        [
          { text: options[1], onPress: () => handleOption(1) },
          { text: options[2], onPress: () => handleOption(2) },
          { text: options[3], onPress: () => handleOption(3) },
          {
            text: options[4],
            style: "destructive",
            onPress: () => handleOption(4),
          },
          { text: options[0], style: "cancel" },
        ],
        { cancelable: true }
      );
    }
  };

  const getButtonProps = (user: SocialUser) => {
    const following = isFollowing(currentUserId, user.id);
    const followedBy = isFollowedBy(currentUserId, user.id);
    const mutual = isMutual(currentUserId, user.id);

    if (!following && !followedBy) {
      return {
        label: "Seguir",
        style: [styles.actionButton, styles.primaryButton],
        textStyle: styles.primaryButtonText,
        onPress: () => handleSend(user),
      };
    }

    if (following && !followedBy) {
      return {
        label: "Siguiendo",
        style: [styles.statusBadge, styles.statusBadgePending],
        textStyle: styles.statusText,
        onPress: () => unfollowUser(user),
      };
    }

    if (!following && followedBy) {
      return {
        label: "Seguir de vuelta",
        style: [styles.actionButton, styles.primaryButton],
        textStyle: styles.primaryButtonText,
        onPress: () => handleSend(user),
      };
    }

    return {
      label: "Amigos ✓",
      style: [styles.statusBadge, styles.statusBadgeSuccess],
      textStyle: styles.statusText,
      onPress: () => handleMutualActions(user),
    };
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
              const buttonProps = getButtonProps(user);

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

                  <TouchableOpacity style={buttonProps.style} onPress={buttonProps.onPress}>
                    <Text style={buttonProps.textStyle}>{buttonProps.label}</Text>
                  </TouchableOpacity>
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

