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
  FlatList,
  Platform,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { 
  Settings, 
  LogOut, 
  Heart, 
  Bookmark, 
  MapPin, 
  Edit3, 
  X,
  Crown,
  Plus
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import theme from "@/lib/theme";
import PlanCard from "@/components/PlanCard";
import { usePlansStore } from "@/hooks/use-plans-store";
import { useAuthStore } from "@/hooks/use-auth-store";
import { categories } from "@/mocks/categories";
import { useRouter } from "expo-router";
import { pickImageFromGallery } from "@/utils/permissions";

export default function ProfileScreen() {
  const router = useRouter();
  const { plans } = usePlansStore();
  const { currentUser, updateProfile: updateAuthProfile } = useAuthStore();
  
  // Debug: Log current user data
  console.log('=== PROFILE DEBUG ===');
  console.log('Current user:', currentUser);
  console.log('Is authenticated:', !!currentUser);
  console.log('====================');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'plans' | 'favorites' | 'history'>('plans');

  // Update form fields when user data loads
  React.useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || "");
      setEditBio(currentUser.bio || "");
      setEditLocation(currentUser.location || "");
      setEditAvatar(currentUser.avatar || "");
      setSelectedPreferences(currentUser.preferences || []);
    }
  }, [currentUser]);

  // Get user's created plans
  const userPlans = plans.filter(plan => plan.userId === currentUser?.id);
  const favoritePlans = plans.filter(plan => plan.favorites > 0).slice(0, 5); // Mock favorites
  const attendedPlans = plans.filter(plan => plan.currentPeople > 0).slice(0, 5); // Mock history

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
          onPress: () => {
            const { logout } = useAuthStore.getState();
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditBio(currentUser.bio || "");
      setEditLocation(currentUser.location || "");
      setEditAvatar(currentUser.avatar || "");
      setSelectedPreferences(currentUser.preferences || []);
      setShowEditModal(true);
    }
  };

  const handleSaveProfile = () => {
    updateAuthProfile({
      name: editName,
      bio: editBio,
      location: editLocation,
      avatar: editAvatar,
      preferences: selectedPreferences,
    });
    setShowEditModal(false);
  };

  const pickImage = async () => {
    const imageUri = await pickImageFromGallery();
    if (imageUri) {
      setEditAvatar(imageUri);
    }
  };

  const togglePreference = (categoryName: string) => {
    if (selectedPreferences.includes(categoryName)) {
      setSelectedPreferences(selectedPreferences.filter(p => p !== categoryName));
    } else {
      setSelectedPreferences([...selectedPreferences, categoryName]);
    }
  };

  const getLevelInfo = (points: number) => {
    const level = Math.floor(points / 100) + 1;
    const progress = (points % 100) / 100;
    return { level, progress };
  };

  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando perfil...</Text>
        <Text style={styles.errorSubtext}>Usuario no autenticado</Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.loginButtonText}>Ir al Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'explorer': return '🗺️';
      case 'social': return '👥';
      case 'foodie': return '🍽️';
      case 'nightlife': return '🌙';
      default: return '🏆';
    }
  };

  const { level, progress } = getLevelInfo(currentUser.points);

  // Animación de contenido entre tabs
  const tabAnim = useSharedValue(1);
  const contentAnimStyle = useAnimatedStyle(() => ({ opacity: tabAnim.value, transform: [{ translateY: withTiming(tabAnim.value === 1 ? 0 : 8, { duration: 200 }) }] }));

  const setTab = (tab: 'plans' | 'favorites' | 'history') => {
    tabAnim.value = 0;
    setTimeout(() => {
      setActiveTab(tab);
      tabAnim.value = withTiming(1, { duration: 240 });
    }, 80);
  };

  const renderPlanItem = ({ item }: { item: any }) => (
    <PlanCard plan={item} horizontal={false} />
  );

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
          colors={['rgba(0, 212, 170, 0.1)', 'transparent']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.title}>Mi Perfil</Text>
            <TouchableOpacity onPress={handleEditProfile} testID="edit-profile-button">
              <Edit3 size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Profile Info */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: currentUser.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
            {currentUser.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
              </View>
            )}
            {currentUser.isPremium && (
              <View style={styles.premiumBadge}>
                <Crown size={16} color={theme.colors.primary} />
              </View>
            )}
          </View>

          <Text style={styles.name}>{currentUser.name}</Text>
          <Text style={styles.username}>{currentUser.username}</Text>
          
          <View style={styles.locationContainer}>
            <MapPin size={16} color={theme.colors.textSecondary} />
            <Text style={styles.locationText}>{currentUser.location}</Text>
          </View>
          
          <Text style={styles.bio}>{currentUser.bio}</Text>

          {/* Level Progress */}
          <View style={styles.levelContainer}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelText}>Nivel {level}</Text>
              <Text style={styles.pointsText}>{currentUser.points} puntos</Text>
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
              <Text style={styles.statNumber}>{currentUser.followersCount}</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{currentUser.followingCount}</Text>
              <Text style={styles.statLabel}>Siguiendo</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{currentUser.plansAttended}</Text>
              <Text style={styles.statLabel}>Asistidos</Text>
            </View>
          </View>

          {/* Badges */}
          {currentUser.badges.length > 0 && (
            <View style={styles.badgesContainer}>
              <Text style={styles.badgesTitle}>Insignias</Text>
              <View style={styles.badgesGrid}>
                {currentUser.badges.map((badge, index) => (
                  <View key={index} style={styles.badge}>
                    <Text style={styles.badgeIcon}>{getBadgeIcon(badge)}</Text>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Interests */}
          <View style={styles.preferencesContainer}>
            <Text style={styles.preferencesTitle}>Intereses</Text>
            <View style={styles.preferencesGrid}>
              {currentUser.preferences.map((preference) => (
                <View key={preference} style={styles.preferenceTag}>
                  <Text style={styles.preferenceText}>{preference}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} testID="favorites-button">
            <Heart size={20} color={theme.colors.textPrimary} />
            <Text style={styles.actionText}>Favoritos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} testID="saved-button">
            <Bookmark size={20} color={theme.colors.textPrimary} />
            <Text style={styles.actionText}>Guardados</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} testID="settings-button">
            <Settings size={20} color={theme.colors.textPrimary} />
            <Text style={styles.actionText}>Ajustes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
            testID="logout-button"
          >
            <LogOut size={20} color={theme.colors.primary} />
            <Text style={[styles.actionText, styles.logoutText]}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* Content Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'plans' && styles.activeTab]}
            onPress={() => setTab('plans')}
          >
            <Text style={[styles.tabText, activeTab === 'plans' && styles.activeTabText]}>
              Mis Planes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
            onPress={() => setTab('favorites')}
          >
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
              Favoritos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              Historial
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <Animated.View style={[styles.contentSection, contentAnimStyle]}>
          {activeTab === 'plans' && (
            <View style={styles.plansContainer}>
              {userPlans.length > 0 ? (
                userPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} horizontal={false} />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No has creado planes aún
                  </Text>
                  <Text style={styles.emptySubtext}>
                    ¡Comparte tus lugares favoritos con otros!
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'favorites' && (
            <View style={styles.plansContainer}>
              {favoritePlans.length > 0 ? (
                favoritePlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} horizontal={false} />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No tienes planes favoritos
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Marca como favoritos los planes que más te gusten
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'history' && (
            <View style={styles.plansContainer}>
              {attendedPlans.length > 0 ? (
                attendedPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} horizontal={false} />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No has asistido a planes aún
                  </Text>
                  <Text style={styles.emptySubtext}>
                    ¡Únete a planes y empieza a vivir experiencias increíbles!
                  </Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <X size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={pickImage}>
                <Image
                  source={{ uri: editAvatar }}
                  style={styles.editAvatar}
                  contentFit="cover"
                />
                <View style={styles.editAvatarOverlay}>
                  <Edit3 size={20} color={theme.colors.textPrimary} />
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Ingresa tu nombre"
              placeholderTextColor={theme.colors.textSecondary}
            />

            <Text style={styles.inputLabel}>Biografía</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Cuéntanos sobre ti"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Ubicación</Text>
            <TextInput
              style={styles.modalInput}
              value={editLocation}
              onChangeText={setEditLocation}
              placeholder="Ingresa tu ubicación"
              placeholderTextColor={theme.colors.textSecondary}
            />

            <Text style={styles.inputLabel}>Intereses</Text>
            <View style={styles.preferencesSelector}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.preferenceButton,
                    selectedPreferences.includes(category.name) && styles.selectedPreferenceButton,
                  ]}
                  onPress={() => togglePreference(category.name)}
                >
                  <Text
                    style={[
                      styles.preferenceButtonText,
                      selectedPreferences.includes(category.name) && styles.selectedPreferenceButtonText,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
            disabled={false}
          >
            <LinearGradient
              colors={[theme.colors.primary, '#00B894']}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>
                Guardar Cambios
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  errorSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  loginButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: theme.spacing.horizontal,
    paddingTop: 60,
    paddingBottom: theme.spacing.vertical * 2,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
  },
  profileContainer: {
    alignItems: "center",
    paddingHorizontal: theme.spacing.horizontal,
    paddingVertical: theme.spacing.section,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedIcon: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  premiumBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
  },
  username: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  bio: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  levelContainer: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  pointsText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  badgesContainer: {
    width: "100%",
    marginBottom: 20,
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeIcon: {
    fontSize: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textTransform: 'capitalize',
  },
  preferencesContainer: {
    width: "100%",
    marginTop: 16,
  },
  preferencesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  preferencesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  preferenceTag: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  preferenceText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.background,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: theme.spacing.horizontal,
    paddingVertical: theme.spacing.section,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.horizontal,
    borderRadius: 16,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    marginTop: 4,
    fontWeight: '600',
  },
  logoutButton: {
    borderLeftWidth: 1,
    borderColor: theme.colors.border,
    paddingLeft: 16,
  },
  logoutText: {
    color: theme.colors.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.horizontal,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.background,
  },
  contentSection: {
    paddingHorizontal: theme.spacing.horizontal,
  },
  plansContainer: {
    gap: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.horizontal,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.horizontal,
    paddingTop: theme.spacing.section,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  editAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  preferencesSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  preferenceButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedPreferenceButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  preferenceButtonText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  selectedPreferenceButtonText: {
    color: theme.colors.background,
    fontWeight: '600',
  },
  saveButton: {
    marginHorizontal: theme.spacing.horizontal,
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
}); 