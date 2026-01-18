import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Platform,
  Linking,
  ActionSheetIOS,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Settings,
  LogOut,
  Heart,
  Bookmark,
  MapPin,
  Edit3,
  X,
  Crown,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

import theme from "@/lib/theme";
import PlanCard from "@/components/PlanCard";
import { usePlansStore } from "@/hooks/use-plans-store";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useUserStore } from "@/hooks/use-user-store";
import { categories } from "@/mocks/categories";
import { useRouter, useLocalSearchParams } from "expo-router";
import { pickImageFromGallery } from "@/utils/permissions";
import { useFriendsStore } from "@/store/friendsStore";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ userId?: string }>();
  const viewedUserId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  const { plans } = usePlansStore();
  const {
    currentUser,
    updateProfile: updateAuthProfile,
    users,
  } = useAuthStore();
  const { updateProfile: updateUserStoreProfile } = useUserStore();
  const {
    friends,
    requestsReceived,
    requestsSent,
    acceptRequest,
    rejectRequest,
    removeFriend,
    followUser,
    unfollowUser,
    isFollowing,
    isFollowedBy,
    isMutual,
    follows,
    currentUserId,
  } = useFriendsStore();
  const profileUser = React.useMemo(() => {
    if (!viewedUserId) {
      return currentUser;
    }
    if (currentUser && viewedUserId === currentUser.id) {
      return currentUser;
    }
    return users.find((user) => user.id === viewedUserId) ?? null;
  }, [viewedUserId, currentUser, users]);
  const isCurrentProfile = !!profileUser && profileUser.id === currentUser?.id;

  // Debug: Log current user data
  console.log("=== PROFILE DEBUG ===");
  console.log("Current user:", currentUser);
  console.log("Is authenticated:", !!currentUser);
  console.log("====================");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"plans" | "favorites" | "history">("plans");

  // Animación de contenido entre tabs
  const tabOpacity = useSharedValue(1);
  const tabTranslateY = useSharedValue(0);
  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: tabOpacity.value,
    transform: [{ translateY: tabTranslateY.value }],
  }));

  // Contadores animados
  const plansCount = useSharedValue(0);
  const followers = useSharedValue(0);
  const following = useSharedValue(0);
  const attended = useSharedValue(0);

  // Update form fields when user data loads
  React.useEffect(() => {
    if (isCurrentProfile && currentUser) {
      setEditName(currentUser.name || "");
      setEditBio(currentUser.bio || "");
      setEditLocation(currentUser.location || "");
      setEditAvatar(currentUser.avatar || "");
      setSelectedPreferences(currentUser.preferences || []);
    }
  }, [isCurrentProfile, currentUser]);

  // Get user's created plans
  const userPlans = plans.filter((plan) => plan.userId === profileUser?.id);
  const favoritePlans = plans.filter((plan) => plan.favorites > 0).slice(0, 5); // Mock favorites
  const attendedPlans = plans.filter((plan) => plan.currentPeople > 0).slice(0, 5); // Mock history

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            const { logout } = useAuthStore.getState();
            await logout();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    if (!isCurrentProfile || !currentUser) {
      return;
    }
    if (currentUser) {
      setEditName(currentUser.name);
      setEditBio(currentUser.bio || "");
      setEditLocation(currentUser.location || "");
      setEditAvatar(currentUser.avatar || "");
      setSelectedPreferences(currentUser.preferences || []);
      setShowEditModal(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!isCurrentProfile) return;
    const profileUpdates = {
      name: editName,
      bio: editBio,
      location: editLocation,
      avatar: editAvatar,
      preferences: selectedPreferences,
    };

    try {
      // Update auth store (this is the primary store)
      await updateAuthProfile(profileUpdates);

      // Update user store only if user exists
      if (useUserStore.getState().user) {
        updateUserStoreProfile(profileUpdates);
      }

      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil. Intenta de nuevo.');
    }
  };

  const pickImage = async () => {
    const imageUri = await pickImageFromGallery();
    if (imageUri) {
      setEditAvatar(imageUri);
    }
  };

  const togglePreference = (categoryName: string) => {
    if (selectedPreferences.includes(categoryName)) {
      setSelectedPreferences(selectedPreferences.filter((p) => p !== categoryName));
    } else {
      setSelectedPreferences([...selectedPreferences, categoryName]);
    }
  };

  // Early return if no profile user
  if (!profileUser) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No se pudo cargar el perfil</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const profileUsername = (profileUser.username || profileUser.id || "").replace(/^@/, "");
  const followersCount = follows.filter((relation) => relation.followingId === profileUsername).length;
  const followingCount = follows.filter((relation) => relation.followerId === profileUsername).length;

  const friendId = !isCurrentProfile ? profileUsername : null;
  const safeFriendId = friendId ?? "";
  const hasSentRequest =
    !!safeFriendId && requestsSent.some((request) => request.id === safeFriendId);
  const hasReceivedRequest =
    !!safeFriendId && requestsReceived.some((request) => request.id === safeFriendId);
  const isFriendWithUser =
    !!safeFriendId &&
    (friends.some((friend) => friend.id === safeFriendId) || isMutual(currentUserId, safeFriendId));
  const canManageFriendship = !!currentUser && !!safeFriendId && !isCurrentProfile;

  const friendCandidate = safeFriendId ? friends.find((friend) => friend.id === safeFriendId) : null;
  const receivedCandidate = safeFriendId
    ? requestsReceived.find((request) => request.id === safeFriendId)
    : null;
  const sentCandidate = safeFriendId ? requestsSent.find((request) => request.id === safeFriendId) : null;
  const socialFallback =
    safeFriendId && profileUser
      ? {
          id: profileUsername,
          name: profileUser.name ?? profileUser.username ?? "Usuario misterioso",
          username: profileUsername,
          avatarColor: "#FF3B30",
        }
      : null;
  const socialTarget = friendCandidate ?? receivedCandidate ?? sentCandidate ?? socialFallback;

  const handleProfileMutualActions = (target: { id: string; username: string; name: string }) => {
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
          console.log("invite", target.username);
          break;
        case 3:
          console.log("dm", target.username);
          break;
        case 4:
          removeFriend({
            id: target.id,
            username: target.username,
            name: target.name,
            avatarColor: "#FF3B30",
          });
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

  const getLevelInfo = (points: number) => {
    const level = Math.floor(points / 100) + 1;
    const progress = (points % 100) / 100;
    return { level, progress };
  };

  if (!profileUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          {viewedUserId ? "Perfil no disponible" : "Cargando perfil..."}
        </Text>
        <Text style={styles.errorSubtext}>
          {viewedUserId ? "No encontramos este usuario" : "Usuario no autenticado"}
        </Text>
        {!currentUser && (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={styles.loginButtonText}>Ir al Login</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "explorer":
        return "🗺️";
      case "social":
        return "👥";
      case "foodie":
        return "🍽️";
      case "nightlife":
        return "🌙";
      default:
        return "🏆";
    }
  };

  const { level, progress } = getLevelInfo(profileUser.points ?? 0);

  React.useEffect(() => {
    plansCount.value = withTiming(userPlans.length, { duration: 450 });
    followers.value = withTiming(followersCount, { duration: 450 });
    following.value = withTiming(followingCount, { duration: 450 });
    attended.value = withTiming(profileUser.plansAttended ?? 0, { duration: 450 });
  }, [profileUser, userPlans.length, followersCount, followingCount]);

  const setTab = (tab: "plans" | "favorites" | "history") => {
    tabOpacity.value = withTiming(0, { duration: 160 });
    tabTranslateY.value = withTiming(8, { duration: 160 });
    setTimeout(() => {
      setActiveTab(tab);
      tabOpacity.value = withTiming(1, { duration: 240 });
      tabTranslateY.value = withTiming(0, { duration: 240 });
    }, 100);
  };

  const renderPlanItem = ({ item }: { item: any }) => <PlanCard plan={item} horizontal={false} />;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={["rgba(0, 212, 170, 0.1)", "transparent"]}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.headerContent}>
            <Text style={styles.title}>{isCurrentProfile ? "Mi Perfil" : profileUser.name}</Text>
            {isCurrentProfile && (
              <TouchableOpacity onPress={handleEditProfile} testID="edit-profile-button">
                <Edit3 size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Profile Info */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: profileUser.avatar }} style={styles.avatar} contentFit="cover" />
            {profileUser.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
              </View>
            )}
            {profileUser.isPremium && (
              <View style={styles.premiumBadge}>
                <Crown size={16} color={theme.colors.primary} />
              </View>
            )}
          </View>

          <Text style={styles.name}>{profileUser.name}</Text>
          <Text style={styles.username}>{profileUser.username}</Text>

          <View style={styles.locationContainer}>
            <MapPin size={16} color={theme.colors.textSecondary} />
            <Text style={styles.locationText}>{profileUser.location}</Text>
          </View>

          <Text style={styles.bio}>{profileUser.bio}</Text>

          {/* Level Progress */}
          <View style={styles.levelContainer}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelText}>Nivel {level}</Text>
              <Text style={styles.pointsText}>{profileUser.points ?? 0} puntos</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userPlans.length}</Text>
              <Text style={styles.statLabel}>Planes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{followersCount}</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{followingCount}</Text>
              <Text style={styles.statLabel}>Siguiendo</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profileUser.plansAttended ?? 0}</Text>
              <Text style={styles.statLabel}>Asistidos</Text>
            </View>
          </View>

        {canManageFriendship && socialTarget && (
          <View style={styles.friendSection}>
            <TouchableOpacity
              style={[
                styles.friendButton,
                isMutual(currentUserId, socialTarget.id)
                  ? styles.friendButtonPrimary
                  : isFollowing(currentUserId, socialTarget.id)
                  ? styles.friendButtonGhost
                  : styles.friendButtonPrimary,
              ]}
              onPress={() => {
                if (isMutual(currentUserId, socialTarget.id)) {
                  handleProfileMutualActions(socialTarget);
                  return;
                }
                if (isFollowing(currentUserId, socialTarget.id) && !isFollowedBy(currentUserId, socialTarget.id)) {
                  unfollowUser(socialTarget);
                  return;
                }
                followUser(socialTarget);
              }}
            >
              <Text style={styles.friendButtonText}>
                {isMutual(currentUserId, socialTarget.id)
                  ? "Amigos ✓"
                  : isFollowing(currentUserId, socialTarget.id) && !isFollowedBy(currentUserId, socialTarget.id)
                  ? "Siguiendo"
                  : isFollowedBy(currentUserId, socialTarget.id) && !isFollowing(currentUserId, socialTarget.id)
                  ? "Seguir de vuelta"
                  : "Seguir"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButtonItem} testID="favorites-button">
              <Heart size={20} color={theme.colors.textPrimary} />
              <Text style={styles.actionText}>Favoritos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButtonItem} testID="saved-button">
              <Bookmark size={20} color={theme.colors.textPrimary} />
              <Text style={styles.actionText}>Guardados</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButtonItem} testID="settings-button">
              <Settings size={20} color={theme.colors.textPrimary} />
              <Text style={styles.actionText}>Ajustes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButtonItem, styles.logoutButton]}
              onPress={handleLogout}
              testID="logout-button"
            >
              <LogOut size={20} color={theme.colors.primary} />
              <Text style={[styles.actionText, styles.logoutText]}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "plans" && styles.activeTab]}
            onPress={() => setTab("plans")}
          >
            <Text style={[styles.tabText, activeTab === "plans" && styles.activeTabText]}>
              Mis Planes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "favorites" && styles.activeTab]}
            onPress={() => setTab("favorites")}
          >
            <Text style={[styles.tabText, activeTab === "favorites" && styles.activeTabText]}>
              Favoritos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "history" && styles.activeTab]}
            onPress={() => setTab("history")}
          >
            <Text style={[styles.tabText, activeTab === "history" && styles.activeTabText]}>
              Historial
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <Animated.View style={[styles.contentSection, contentAnimStyle]}>
          {activeTab === "plans" && (
            <View style={styles.plansContainer}>
              {userPlans.length > 0 ? (
                userPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} horizontal={false} />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No has creado planes aún</Text>
                  <Text style={styles.emptySubtext}>
                    ¡Comparte tus lugares favoritos con otros!
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === "favorites" && (
            <View style={styles.plansContainer}>
              {favoritePlans.length > 0 ? (
                favoritePlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} horizontal={false} />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Todavía no tienes favoritos</Text>
                  <Text style={styles.emptySubtext}>
                    Explora y guarda parches que te gusten.
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === "history" && (
            <View style={styles.plansContainer}>
              {attendedPlans.length > 0 ? (
                attendedPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} horizontal={false} />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay historial aún</Text>
                  <Text style={styles.emptySubtext}>
                    Cuando participes en un plan, aparecerá aquí.
                  </Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>

      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar perfil</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity onPress={pickImage}>
                <Image source={{ uri: editAvatar || profileUser.avatar }} style={styles.modalAvatar} contentFit="cover" />
                <Text style={styles.changePhotoText}>Cambiar foto</Text>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
              />

              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editBio}
                onChangeText={setEditBio}
                multiline
              />

              <Text style={styles.inputLabel}>Ubicación</Text>
              <TextInput
                style={styles.input}
                value={editLocation}
                onChangeText={setEditLocation}
              />

              <Text style={styles.inputLabel}>Intereses</Text>
              <View style={styles.preferencesGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.preferenceTag,
                      selectedPreferences.includes(category.name) && styles.preferenceTagActive,
                    ]}
                    onPress={() => togglePreference(category.name)}
                  >
                    <Text style={styles.preferenceText}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditModal(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E0E0E",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333333",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 80,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  avatarContainer: {
    alignSelf: "center",
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedIcon: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  premiumBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "rgba(196, 164, 106, 0.3)",
    padding: 4,
    borderRadius: 12,
  },
  name: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  username: {
    textAlign: "center",
    color: "#BBBBBB",
    fontSize: 14,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  locationText: {
    color: "#BBBBBB",
    fontSize: 13,
  },
  bio: {
    color: "#DDDDDD",
    textAlign: "center",
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
  },
  levelContainer: {
    marginTop: 20,
    backgroundColor: "#121212",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  pointsText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  progressBar: {
    marginTop: 12,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 12,
  },
  statNumber: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 20,
  },
  statLabel: {
    color: "#BBBBBB",
    fontSize: 12,
    marginTop: 4,
  },
  friendSection: {
    marginTop: 24,
    backgroundColor: "#121212",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  friendButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  friendButtonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  friendButtonSuccess: {
    backgroundColor: "rgba(95, 191, 136, 0.15)",
  },
  friendButtonGhost: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  friendButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  friendDualButtons: {
    flexDirection: "row",
    gap: 12,
  },
  friendButtonHalf: {
    flex: 1,
  },
  friendHint: {
    color: "#BBBBBB",
    fontSize: 12,
    textAlign: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 24,
  },
  actionButtonItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#121212",
    padding: 12,
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "rgba(255, 59, 48, 0.08)",
  },
  logoutText: {
    color: theme.colors.primary,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#121212",
    marginHorizontal: 4,
  },
  activeTab: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  tabText: {
    color: "#BBBBBB",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  contentSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  plansContainer: {
    gap: 16,
  },
  emptyContainer: {
    backgroundColor: "#121212",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emptySubtext: {
    color: "#BBBBBB",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#111111",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  modalAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: "center",
  },
  changePhotoText: {
    color: theme.colors.primary,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  inputLabel: {
    color: "#BBBBBB",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  preferencesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  preferenceTag: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  preferenceTagActive: {
    backgroundColor: theme.colors.primary,
  },
  preferenceText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0E0E0E",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  errorSubtext: {
    color: "#BBBBBB",
    textAlign: "center",
  },
  loginButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
