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
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Image } from "expo-image";
import { ArrowLeft, MessageCircle, UserPlus, UserCheck, Users, Home } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

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

  // Debug log
  console.log('[PublicProfile] Rendering with username:', username);

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

  const handleMessagePress = useCallback(() => {
    if (!currentUserId || !socialInfo) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const chatId = useChatStore.getState().createChatIfNotExists(currentUserId, socialInfo.id);
    router.push(`/chat/${chatId}`);
  }, [currentUserId, socialInfo, router]);

  if (!user || !socialInfo) {
    return (
      <View style={styles.notFoundContainer}>
        <StatusBar style="light" />
        <Stack.Screen
          options={{
            headerShown: true,
            headerTransparent: true,
            headerTitle: "",
            headerBackVisible: false,
            headerStyle: {
              backgroundColor: "transparent",
            },
            headerShadowVisible: false,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace("/(tabs)");
                  }
                }}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  router.replace("/(tabs)");
                }}
                style={styles.homeButton}
                activeOpacity={0.7}
              >
                <Home size={22} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            ),
          }}
        />
        <Text style={styles.notFoundTitle}>Perfil no encontrado</Text>
        <Text style={styles.notFoundSubtitle}>No pudimos cargar este perfil.</Text>
      </View>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerBackVisible: false,
          headerStyle: {
            backgroundColor: "transparent",
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(tabs)");
                }
              }}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.replace("/(tabs)");
              }}
              style={styles.homeButton}
              activeOpacity={0.7}
            >
              <Home size={22} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar style="light" />

        {/* Spacer for header */}
        <View style={{ height: Platform.OS === 'ios' ? 0 : 0 }} />

        {/* Banner with gradient - TESTING RELOAD */}
        <LinearGradient
          colors={["#FF3B30", "#AA0000", "#FF3B30"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.bannerPattern} />
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center', paddingTop: 50 }}>
            TESTING - NEW VERSION
          </Text>
        </LinearGradient>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: socialInfo.avatarColor || "#FF3B30" }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        {/* Header Info */}
        <View style={styles.headerSection}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
          {!user.bio && <Text style={styles.bio}>Amante de buenos parches en Antioquia</Text>}
        </View>

        {/* Stats Row */}
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

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, buttonProps.style]}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              buttonProps.onPress();
            }}
            activeOpacity={0.8}
          >
            {mutual ? (
              <UserCheck size={18} color="#FFFFFF" strokeWidth={2.5} />
            ) : following ? (
              <UserCheck size={18} color="#AAAAAA" strokeWidth={2.5} />
            ) : (
              <UserPlus size={18} color="#FFFFFF" strokeWidth={2.5} />
            )}
            <Text style={[styles.actionButtonText, (mutual || !following && !followedBy) && styles.actionButtonTextPrimary]}>
              {buttonProps.label}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.messageButton}
            onPress={handleMessagePress}
            activeOpacity={0.8}
          >
            <MessageCircle size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Gallery */}
        <View style={styles.gallerySection}>
          <Text style={styles.galleryTitle}>Parches recientes</Text>
          {createdPlans.length === 0 ? (
            <View style={styles.emptyGallery}>
              <Text style={styles.galleryEmpty}>Aún no ha compartido parches.</Text>
            </View>
          ) : (
            <View style={styles.galleryGrid}>
              {createdPlans.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.galleryItem}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    router.push(`/plan/${item.id}`);
                  }}
                >
                  <Image
                    source={{ uri: item.images[0] }}
                    style={styles.galleryImage}
                    contentFit="cover"
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)"]}
                    style={styles.galleryGradient}
                  />
                  <Text style={styles.galleryItemTitle} numberOfLines={2}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  contentContainer: {
    paddingBottom: 120,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    zIndex: 1000,
  },
  homeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    zIndex: 1000,
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: "#0B0B0B",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  notFoundTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  notFoundSubtitle: {
    color: "#AAAAAA",
    fontSize: 15,
  },
  banner: {
    height: 120,
    width: "100%",
    position: "relative",
  },
  bannerPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: -40,
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#0B0B0B",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
  },
  headerSection: {
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 4,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  username: {
    color: "#AAAAAA",
    fontSize: 14,
  },
  bio: {
    color: "#DDDDDD",
    marginTop: 6,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 16,
  },
  statCard: {
    backgroundColor: "#1A1A1A",
    padding: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#222222",
  },
  statNumber: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 18,
  },
  statLabel: {
    color: "#AAAAAA",
    marginTop: 4,
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: "#FF3B30",
  },
  mutedButton: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333333",
  },
  mutualButton: {
    backgroundColor: "#FF3B30",
  },
  actionButtonText: {
    color: "#AAAAAA",
    fontWeight: "700",
    fontSize: 14,
  },
  actionButtonTextPrimary: {
    color: "#FFFFFF",
  },
  messageButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
  },
  gallerySection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  galleryTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  emptyGallery: {
    paddingVertical: 24,
    alignItems: "center",
  },
  galleryEmpty: {
    color: "#AAAAAA",
    textAlign: "center",
    fontSize: 14,
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  galleryItem: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
    position: "relative",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  galleryGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  galleryItemTitle: {
    position: "absolute",
    bottom: 6,
    left: 6,
    right: 6,
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 13,
  },
});
