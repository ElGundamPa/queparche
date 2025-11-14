import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  ActionSheetIOS,
  Alert,
  FlatList,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";

import { PUBLIC_PROFILE_USERS, SOCIAL_MOCK_USERS } from "@/mocks/users";
import { useFriendsStore } from "@/store/friendsStore";
import { usePlansStore } from "@/store/plansStore";
import type { Plan } from "@/types/plan";
import { useChatStore } from "@/store/chatStore";

export default function PublicProfile() {
  const { username } = useLocalSearchParams<{ username?: string }>();
  const router = useRouter();
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
  const plans = usePlansStore((state) => state.plans);

  const user = useMemo(() => {
    if (!username) return null;
    return PUBLIC_PROFILE_USERS.find(
      (profile) => profile.username.toLowerCase() === String(username).toLowerCase()
    );
  }, [username]);

  const socialInfo = useMemo(() => {
    if (!user) return null;
    const match = SOCIAL_MOCK_USERS.find((candidate) => candidate.username === user.username);
    if (match) return match;
    return {
      id: user.username,
      username: user.username,
      name: user.name,
      avatarColor: "#FF3B30",
    };
  }, [user]);

  const createdPlans = useMemo(() => {
    if (!user) return [];
    return user.createdPlans
      .map((planId) => plans.find((plan) => plan.id === planId))
      .filter((plan): plan is Plan => Boolean(plan));
  }, [user, plans]);

  const following = socialInfo ? isFollowing(currentUserId, socialInfo.id) : false;
  const followedBy = socialInfo ? isFollowedBy(currentUserId, socialInfo.id) : false;
  const mutual = socialInfo ? isMutual(currentUserId, socialInfo.id) : false;

  const followersCount = socialInfo
    ? follows.filter((relation) => relation.followingId === socialInfo.id).length
    : 0;
  const followingCount = socialInfo
    ? follows.filter((relation) => relation.followerId === socialInfo.id).length
    : 0;

  const handleMutualActions = () => {
    if (!socialInfo) return;
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
          const chatId = useChatStore.getState().createChatIfNotExists(currentUserId, socialInfo.id);
          router.push(`/chat/${chatId}`);
          break;
        }
        case 4:
          removeFriend(socialInfo);
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

  const buttonProps = useMemo(() => {
    if (!socialInfo) {
      return { label: "Seguir", style: styles.primaryButton, onPress: () => {} };
    }

    if (!following && !followedBy) {
      return {
        label: "Seguir",
        style: styles.primaryButton,
        onPress: () => followUser(socialInfo),
      };
    }

    if (following && !followedBy) {
      return {
        label: "Siguiendo",
        style: styles.mutedButton,
        onPress: () => unfollowUser(socialInfo),
      };
    }

    if (!following && followedBy) {
      return {
        label: "Seguir de vuelta",
        style: styles.primaryButton,
        onPress: () => followUser(socialInfo),
      };
    }

    return {
      label: "Amigos ✓",
      style: styles.mutualButton,
      onPress: handleMutualActions,
    };
  }, [followUser, unfollowUser, socialInfo, following, followedBy, mutual]);

  if (!user || !socialInfo) {
    return (
      <View style={styles.notFoundContainer}>
        <StatusBar style="light" />
        <Text style={styles.notFoundTitle}>Perfil no encontrado</Text>
        <Text style={styles.notFoundSubtitle}>No pudimos cargar este perfil.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="light" />
      <View style={styles.banner} />

      <View style={styles.headerSection}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        <Text style={styles.bio}>Amante de buenos parches en Antioquia</Text>
        <TouchableOpacity style={[styles.actionButton, buttonProps.style]} onPress={buttonProps.onPress}>
          <Text style={styles.actionButtonText}>{buttonProps.label}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{createdPlans.length}</Text>
          <Text style={styles.statLabel}>Parches</Text>
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

      <Text style={styles.galleryTitle}>Parches recientes</Text>
      {createdPlans.length === 0 ? (
        <Text style={styles.galleryEmpty}>Aún no ha compartido parches.</Text>
      ) : (
        <FlatList
          data={createdPlans}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.galleryRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.galleryItem}
              activeOpacity={0.85}
              onPress={() => router.push(`/plan/${item.id}`)}
            >
              <View style={styles.galleryImageWrapper}>
                <Image source={{ uri: item.images[0] }} style={styles.galleryImage} contentFit="cover" />
              </View>
            </TouchableOpacity>
          )}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  contentContainer: {
    padding: 16,
    gap: 20,
    paddingBottom: 32,
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: "#0B0B0B",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  notFoundTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  notFoundSubtitle: {
    color: "#bbb",
  },
  banner: {
    height: 140,
    backgroundColor: "#111",
    borderRadius: 16,
  },
  headerSection: {
    gap: 8,
  },
  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  username: {
    color: "#bbb",
  },
  bio: {
    color: "#ddd",
    marginTop: 4,
  },
  actionButton: {
    marginTop: 12,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#FF3B30",
  },
  mutedButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  mutualButton: {
    backgroundColor: "#FF3B30",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    backgroundColor: "#121212",
    padding: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  statLabel: {
    color: "#bbb",
    marginTop: 4,
  },
  galleryTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  galleryEmpty: {
    color: "#bbb",
    textAlign: "center",
    marginTop: 16,
  },
  galleryRow: {
    gap: 8,
    marginBottom: 8,
  },
  galleryItem: {
    flex: 1 / 3,
  },
  galleryImageWrapper: {
    backgroundColor: "#121212",
    borderRadius: 12,
    overflow: "hidden",
    aspectRatio: 1,
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
});
