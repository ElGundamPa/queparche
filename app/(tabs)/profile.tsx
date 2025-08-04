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

import Colors from "@/constants/colors";
import PlanCard from "@/components/PlanCard";
import { usePlansStore } from "@/hooks/use-plans-store";
import { useUserStore } from "@/hooks/use-user-store";
import { categories } from "@/mocks/categories";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();
  const { plans } = usePlansStore();
  const { user, updateProfile, isUpdating } = useUserStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'plans' | 'favorites' | 'history'>('plans');

  // Update form fields when user data loads
  React.useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditBio(user.bio || "");
      setEditLocation(user.location || "");
      setEditAvatar(user.avatar || "");
      setSelectedPreferences(user.preferences || []);
    }
  }, [user]);

  // Get user's created plans
  const userPlans = plans.filter(plan => plan.userId === user?.id);
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
            Alert.alert("Sesión cerrada", "Has cerrado sesión exitosamente");
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    if (user) {
      setEditName(user.name);
      setEditBio(user.bio || "");
      setEditLocation(user.location || "");
      setEditAvatar(user.avatar || "");
      setSelectedPreferences(user.preferences || []);
      setShowEditModal(true);
    }
  };

  const handleSaveProfile = () => {
    updateProfile({
      name: editName,
      bio: editBio,
      location: editLocation,
      avatar: editAvatar,
      preferences: selectedPreferences,
    });
    setShowEditModal(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert(
        "Permiso requerido",
        "Por favor concede permiso para acceder a tu galería de fotos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setEditAvatar(result.assets[0].uri);
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

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'explorer': return '🗺️';
      case 'social': return '👥';
      case 'foodie': return '🍽️';
      case 'nightlife': return '🌙';
      default: return '🏆';
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  const { level, progress } = getLevelInfo(user.points);

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
              <Edit3 size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Profile Info */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
            {user.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
              </View>
            )}
            {user.isPremium && (
              <View style={styles.premiumBadge}>
                <Crown size={16} color={Colors.light.premium} />
              </View>
            )}
          </View>

          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          
          <View style={styles.locationContainer}>
            <MapPin size={16} color={Colors.light.darkGray} />
            <Text style={styles.locationText}>{user.location}</Text>
          </View>
          
          <Text style={styles.bio}>{user.bio}</Text>

          {/* Level Progress */}
          <View style={styles.levelContainer}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelText}>Nivel {level}</Text>
              <Text style={styles.pointsText}>{user.points} puntos</Text>
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
              <Text style={styles.statNumber}>{user.followersCount}</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.followingCount}</Text>
              <Text style={styles.statLabel}>Siguiendo</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.plansAttended}</Text>
              <Text style={styles.statLabel}>Asistidos</Text>
            </View>
          </View>

          {/* Badges */}
          {user.badges.length > 0 && (
            <View style={styles.badgesContainer}>
              <Text style={styles.badgesTitle}>Insignias</Text>
              <View style={styles.badgesGrid}>
                {user.badges.map((badge, index) => (
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
              {user.preferences.map((preference) => (
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
            <Heart size={20} color={Colors.light.text} />
            <Text style={styles.actionText}>Favoritos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} testID="saved-button">
            <Bookmark size={20} color={Colors.light.text} />
            <Text style={styles.actionText}>Guardados</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} testID="settings-button">
            <Settings size={20} color={Colors.light.text} />
            <Text style={styles.actionText}>Ajustes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
            testID="logout-button"
          >
            <LogOut size={20} color={Colors.light.error} />
            <Text style={[styles.actionText, styles.logoutText]}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* Content Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'plans' && styles.activeTab]}
            onPress={() => setActiveTab('plans')}
          >
            <Text style={[styles.tabText, activeTab === 'plans' && styles.activeTabText]}>
              Mis Planes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
            onPress={() => setActiveTab('favorites')}
          >
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
              Favoritos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              Historial
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
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
        </View>
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
              <X size={24} color={Colors.light.text} />
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
                  <Edit3 size={20} color={Colors.light.white} />
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Ingresa tu nombre"
              placeholderTextColor={Colors.light.darkGray}
            />

            <Text style={styles.inputLabel}>Biografía</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Cuéntanos sobre ti"
              placeholderTextColor={Colors.light.darkGray}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Ubicación</Text>
            <TextInput
              style={styles.modalInput}
              value={editLocation}
              onChangeText={setEditLocation}
              placeholder="Ingresa tu ubicación"
              placeholderTextColor={Colors.light.darkGray}
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
            disabled={isUpdating}
          >
            <LinearGradient
              colors={[Colors.light.primary, '#00B894']}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>
                {isUpdating ? "Guardando..." : "Guardar Cambios"}
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
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.light.text,
  },
  profileContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
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
    borderColor: Colors.light.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: Colors.light.verified,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedIcon: {
    color: Colors.light.white,
    fontSize: 12,
    fontWeight: '700',
  },
  premiumBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: Colors.light.premium,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
  },
  username: {
    fontSize: 16,
    color: Colors.light.darkGray,
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginLeft: 4,
  },
  bio: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  levelContainer: {
    width: '100%',
    backgroundColor: Colors.light.card,
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
    color: Colors.light.text,
  },
  pointsText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    backgroundColor: Colors.light.card,
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
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.darkGray,
    marginTop: 4,
  },
  badgesContainer: {
    width: "100%",
    marginBottom: 20,
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 12,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    backgroundColor: Colors.light.card,
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
    color: Colors.light.text,
    textTransform: 'capitalize',
  },
  preferencesContainer: {
    width: "100%",
    marginTop: 16,
  },
  preferencesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 12,
  },
  preferencesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  preferenceTag: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  preferenceText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.black,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.card,
    marginHorizontal: 20,
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
    color: Colors.light.text,
    marginTop: 4,
    fontWeight: '600',
  },
  logoutButton: {
    borderLeftWidth: 1,
    borderColor: Colors.light.border,
    paddingLeft: 16,
  },
  logoutText: {
    color: Colors.light.error,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    marginHorizontal: 20,
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
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.darkGray,
  },
  activeTabText: {
    color: Colors.light.black,
  },
  contentSection: {
    paddingHorizontal: 20,
  },
  plansContainer: {
    gap: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.darkGray,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
    backgroundColor: Colors.light.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
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
    backgroundColor: Colors.light.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  selectedPreferenceButton: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  preferenceButtonText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  selectedPreferenceButtonText: {
    color: Colors.light.black,
    fontWeight: '600',
  },
  saveButton: {
    marginHorizontal: 20,
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
    color: Colors.light.white,
  },
});