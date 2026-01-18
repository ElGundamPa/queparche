import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
  Platform,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link, useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import theme from "@/lib/theme";
import { supabase } from "@/lib/supabase";
import { useFriendsStore } from "@/store/friendsStore";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/hooks/use-auth-store";

interface SupabaseUser {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  bio?: string;
  avatarColor?: string;
}

// Tipo compatible con SocialUser
type SocialUser = SupabaseUser;

const normalize = (value: string) => value.trim().toLowerCase();

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

const getRandomColor = () => {
  const colors = [
    '#FF3B30', // Rojo
    '#FF9500', // Naranja
    '#FFCC00', // Amarillo
    '#34C759', // Verde
    '#00C7BE', // Turquesa
    '#30B0C7', // Cyan
    '#32ADE6', // Azul claro
    '#007AFF', // Azul
    '#5856D6', // Púrpura
    '#AF52DE', // Morado
    '#FF2D55', // Rosa
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const USERS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export default function FriendSearchScreen() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SocialUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const insets = useSafeAreaInsets();
  const { followUser, unfollowUser, removeFriend, isFollowing, isFollowedBy, isMutual, currentUserId } =
    useFriendsStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const router = useRouter();

  // Cargar usuarios iniciales
  useEffect(() => {
    loadUsers(0, true);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim()) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(query);
      }, SEARCH_DEBOUNCE_MS);
    } else {
      loadUsers(0, true);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const searchUsers = async (searchQuery: string) => {
    try {
      setIsLoading(true);
      console.log('🔍 Buscando usuarios:', searchQuery);

      // Normalizar query
      const normalizedQuery = searchQuery.toLowerCase().trim();
      const queryWithoutAt = normalizedQuery.startsWith('@')
        ? normalizedQuery.slice(1)
        : normalizedQuery;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, name, avatar, bio')
        .neq('id', currentUser?.id || '')
        .or(`username.ilike.%${queryWithoutAt}%,name.ilike.%${searchQuery}%`)
        .limit(50); // Limitar a 50 resultados en búsqueda

      if (error) {
        console.error('❌ Error buscando usuarios:', error);
        return;
      }

      const mappedUsers: SocialUser[] = (data || []).map(user => ({
        ...user,
        avatarColor: getRandomColor(),
      }));

      setUsers(mappedUsers);
      setHasMore(false); // No pagination in search
    } catch (error) {
      console.error('❌ Error en searchUsers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async (pageNumber: number = 0, reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setPage(0);
      } else {
        setIsLoadingMore(true);
      }

      console.log(`🔍 Cargando página ${pageNumber} de usuarios...`);

      const from = pageNumber * USERS_PER_PAGE;
      const to = from + USERS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from('profiles')
        .select('id, username, name, avatar, bio', { count: 'exact' })
        .neq('id', currentUser?.id || '')
        .order('name', { ascending: true })
        .range(from, to);

      if (error) {
        console.error('❌ Error cargando usuarios:', error);
        return;
      }

      console.log(`✅ Cargados ${data?.length || 0} usuarios`);

      const mappedUsers: SocialUser[] = (data || []).map(user => ({
        ...user,
        avatarColor: getRandomColor(),
      }));

      if (reset) {
        setUsers(mappedUsers);
      } else {
        setUsers(prev => [...prev, ...mappedUsers]);
      }

      setHasMore((count || 0) > (pageNumber + 1) * USERS_PER_PAGE);
      setPage(pageNumber);
    } catch (error) {
      console.error('❌ Error en loadUsers:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const lowerQuery = normalize(query);
  const results = useMemo(() => {
    if (!lowerQuery) return users;
    return users.filter((user) => {
      const username = user.username.toLowerCase();
      const name = user.name.toLowerCase();

      // Remover @ si existe en username y en query para comparar
      const normalizedUsername = username.startsWith('@') ? username.slice(1) : username;
      const normalizedQuery = lowerQuery.startsWith('@') ? lowerQuery.slice(1) : lowerQuery;

      return (
        normalizedUsername.includes(normalizedQuery) ||
        name.includes(lowerQuery) ||
        username.includes(lowerQuery)
      );
    });
  }, [lowerQuery, users]);

  const handleSend = (user: SocialUser) => {
    followUser(user);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !query.trim()) {
      loadUsers(page + 1, false);
    }
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

  const renderUserCard = ({ item: user }: { item: SocialUser }) => {
    const buttonProps = getButtonProps(user);

    return (
      <View style={styles.card}>
        <Link href={`/user/${user.username}`} asChild>
          <TouchableOpacity activeOpacity={0.85} style={styles.cardInfoTouchable}>
            <View style={styles.cardInfo}>
              <View style={[styles.avatar, { backgroundColor: user.avatarColor || theme.colors.primary }]}>
                <Text style={styles.avatarText}>{initials(user.name)}</Text>
              </View>
              <View>
                <Text style={styles.cardTitle}>{user.name}</Text>
                <Text style={styles.cardSubtitle}>{user.username}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity style={buttonProps.style} onPress={buttonProps.onPress}>
          <Text style={buttonProps.textStyle}>{buttonProps.label}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
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
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {query ? 'No encontramos usuarios con ese nombre' : 'No hay usuarios disponibles'}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "Buscar amigos",
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "700",
            color: "#FFFFFF",
          },
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
                router.push("/(tabs)/friends");
              }}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={results}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 80 }]}
        style={styles.scrollView}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={5}
      />
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
    paddingBottom: theme.spacing.section * 2,
    gap: theme.spacing.section,
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

