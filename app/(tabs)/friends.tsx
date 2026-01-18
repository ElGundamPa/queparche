import React, { useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Platform,
  ActionSheetIOS,
  Alert,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { MessageCircle, Search, X } from "lucide-react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFriendsStore } from "@/store/friendsStore";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useChatStore } from "@/store/chatStore";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

// Mock solicitudes para ejemplo
const MOCK_REQUESTS = [
  { id: "valer", name: "Valentina R.", username: "valer", avatarColor: "#FF6B6B" },
  { id: "sarita", name: "Sara Q.", username: "sarita", avatarColor: "#FFD166" },
  { id: "laura", name: "Laura C.", username: "laurac", avatarColor: "#A29BFE" },
];

type SectionData = {
  title: string;
  data: any[];
  type: "requests" | "friends";
};

export default function FriendsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    friends,
    requestsReceived,
    acceptRequest,
    rejectRequest,
    followUser,
    unfollowUser,
    removeFriend,
    isFollowing,
    isFollowedBy,
    isMutual,
    currentUserId,
  } = useFriendsStore();
  const currentUser = useAuthStore((state) => state.currentUser);
  const userId = currentUser?.id ?? "";
  const getTotalUnreadChats = useChatStore((state) => state.getTotalUnreadChats);
  const getUnreadCountByChat = useChatStore((state) => state.getUnreadCountByChat);
  const createChatIfNotExists = useChatStore((state) => state.createChatIfNotExists);
  const allChats = useChatStore((state) => state.chats);

  const unreadChatsCount = useMemo(() => {
    if (!userId) return 0;
    try {
      return getTotalUnreadChats(userId);
    } catch (error) {
      console.warn("Error getting unread chats count:", error);
      return 0;
    }
  }, [getTotalUnreadChats, userId]);

  const handleChatPress = useCallback(
    (friendId: string) => {
      if (!userId) return;
      try {
        const chatId = `chat-${[userId, friendId].sort().join("-")}`;
        createChatIfNotExists(chatId, [userId, friendId]);
        router.push(`/chat/${chatId}`);
      } catch (error) {
        console.warn("Error creating chat:", error);
      }
    },
    [userId, createChatIfNotExists, router]
  );

  const getChatIdForFriend = useCallback(
    (friendId: string) => {
      if (!userId || !allChats) return null;
      try {
        const chatsArray = Object.values(allChats);
        const chat = chatsArray.find(
          (c) => c.userIds.includes(userId) && c.userIds.includes(friendId)
        );
        return chat?.id ?? null;
      } catch (error) {
        console.warn("Error getting chat ID:", error);
        return null;
      }
    },
    [allChats, userId]
  );

  const renderRelationshipButton = useCallback(
    (user: { id: string; username: string; name: string; avatarColor: string }, onPress: () => void) => {
      const following = isFollowing(currentUserId, user.id);
      const followedBy = isFollowedBy(currentUserId, user.id);
      const mutual = isMutual(currentUserId, user.id);

      let label = "";
      let style = [styles.statusButton];

      if (mutual) {
        label = "Amigos ✓";
        style = [styles.statusButton, styles.statusButtonMutual];
      } else if (following && !followedBy) {
        label = "Siguiendo";
        style = [styles.statusButton, styles.statusButtonMuted];
      } else {
        label = "Seguir";
        style = [styles.statusButton, styles.statusButtonPrimary];
      }

      return (
        <TouchableOpacity style={style} onPress={onPress} activeOpacity={0.7}>
          <Text style={mutual ? styles.statusButtonText : following ? styles.statusButtonTextMuted : styles.statusButtonText}>
            {label}
          </Text>
        </TouchableOpacity>
      );
    },
    [currentUserId, isFollowing, isFollowedBy, isMutual]
  );

  const handleMutualActions = useCallback(
    (user: { id: string; username: string; name: string }) => {
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
            try {
              const chatId = `chat-${[currentUserId, user.id].sort().join("-")}`;
              useChatStore.getState().createChatIfNotExists(chatId, [currentUserId, user.id]);
              router.push(`/chat/${chatId}`);
            } catch (error) {
              console.warn("Error creating chat:", error);
            }
            break;
          }
          case 4:
            removeFriend({
              id: user.id,
              username: user.username,
              name: user.name,
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
    },
    [router, currentUserId, removeFriend]
  );

  const handleRelationshipPress = useCallback(
    (user: { id: string; username: string; name: string; avatarColor: string }) => {
      const following = isFollowing(currentUserId, user.id);
      const followedBy = isFollowedBy(currentUserId, user.id);
      const mutual = isMutual(currentUserId, user.id);

      if (mutual) {
        handleMutualActions(user);
        return;
      }

      if (following && !followedBy) {
        unfollowUser(user);
        return;
      }

      followUser(user);
    },
    [currentUserId, isFollowing, isFollowedBy, isMutual, handleMutualActions, unfollowUser, followUser]
  );

  // Preparar datos para SectionList - SIEMPRE retornar un array válido
  const sections = useMemo((): SectionData[] => {
    try {
      const displayRequests = Array.isArray(requestsReceived) && requestsReceived.length > 0 
        ? requestsReceived 
        : MOCK_REQUESTS;
      
      const displayFriends = Array.isArray(friends) ? friends : [];

      return [
        {
          title: "Solicitudes recibidas",
          data: displayRequests,
          type: "requests",
        },
        {
          title: "Tus amigos",
          data: displayFriends,
          type: "friends",
        },
      ];
    } catch (error) {
      console.warn("Error preparing sections:", error);
      return [
        {
          title: "Solicitudes recibidas",
          data: MOCK_REQUESTS,
          type: "requests",
        },
        {
          title: "Tus amigos",
          data: [],
          type: "friends",
        },
      ];
    }
  }, [requestsReceived, friends]);

  const renderRequestItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      if (!item || !item.id) return null;
      
      return (
        <View>
          <View style={styles.requestItem}>
            <Link href={`/user/${item.username || item.id}`} asChild>
              <TouchableOpacity activeOpacity={0.7} style={styles.requestUserInfo}>
                <View style={[styles.requestAvatar, { backgroundColor: item.avatarColor || "#FF3B30" }]}>
                  <Text style={styles.requestAvatarText}>{initials(item.name || item.username || "U")}</Text>
                </View>
                <View style={styles.requestUserDetails}>
                  <Text style={styles.requestUserName}>{item.name || item.username || "Usuario"}</Text>
                  <Text style={styles.requestUserUsername}>@{item.username || item.id}</Text>
                </View>
              </TouchableOpacity>
            </Link>
            <View style={styles.requestActions}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => {
                  try {
                    acceptRequest(item);
                  } catch (error) {
                    console.warn("Error accepting request:", error);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.acceptButtonText}>Aceptar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => {
                  try {
                    rejectRequest(item);
                  } catch (error) {
                    console.warn("Error rejecting request:", error);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.rejectButtonText}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          </View>
          {index < sections[0]?.data?.length - 1 && <View style={styles.separator} />}
        </View>
      );
    },
    [acceptRequest, rejectRequest, sections]
  );

  const renderFriendItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      if (!item || !item.id) return null;

      const chatId = getChatIdForFriend(item.id);
      const unreadCount = chatId ? getUnreadCountByChat(chatId, userId) : 0;

      return (
        <View style={styles.friendCard}>
          <Link href={`/user/${item.username || item.id}`} asChild>
            <TouchableOpacity activeOpacity={0.7} style={styles.friendUserInfo}>
              <View style={[styles.friendAvatar, { backgroundColor: item.avatarColor || "#FF3B30" }]}>
                <Text style={styles.friendAvatarText}>{initials(item.name || item.username || "U")}</Text>
              </View>
              <View style={styles.friendUserDetails}>
                <Text style={styles.friendUserName}>{item.name || item.username || "Usuario"}</Text>
                <Text style={styles.friendUserUsername}>@{item.username || item.id}</Text>
              </View>
            </TouchableOpacity>
          </Link>
          <View style={styles.friendActions}>
            {renderRelationshipButton(item, () =>
              handleRelationshipPress({
                id: item.id,
                username: item.username || item.id,
                name: item.name || item.username || "Usuario",
                avatarColor: item.avatarColor || "#FF3B30",
              })
            )}
            <TouchableOpacity
              style={styles.chatIconButton}
              onPress={() => handleChatPress(item.id)}
              activeOpacity={0.7}
            >
              <MessageCircle size={19} color="#9B9B9B" />
              {unreadCount > 0 && <View style={styles.chatDotBadge} />}
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [getChatIdForFriend, getUnreadCountByChat, userId, handleChatPress, renderRelationshipButton, handleRelationshipPress]
  );

  const renderItem = useCallback(
    ({ item, section, index }: { item: any; section: SectionData; index: number }) => {
      if (!item) return null;
      
      if (section.type === "requests") {
        return renderRequestItem({ item, index });
      }
      return renderFriendItem({ item, index });
    },
    [renderRequestItem, renderFriendItem]
  );

  const renderSectionHeader = useCallback(({ section }: { section: SectionData }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  ), []);

  const renderSectionFooter = useCallback(() => <View style={{ height: 20 }} />, []);

  const renderSectionEmpty = useCallback(
    ({ section }: { section: SectionData }) => {
      if (section.type === "requests") {
        return (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tienes nuevas solicitudes.</Text>
          </View>
        );
      }
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Aún no tienes amigos agregados.</Text>
          <Link href="/friends/search" asChild>
            <TouchableOpacity style={styles.ctaButton} activeOpacity={0.7}>
              <Text style={styles.ctaButtonText}>Buscar amigos</Text>
            </TouchableOpacity>
          </Link>
        </View>
      );
    },
    []
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Chats",
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "700",
            color: "#FFFFFF",
          },
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center", paddingRight: 8 }}>
              <TouchableOpacity
                onPress={() => router.push("/friends/search")}
                accessibilityLabel="Buscar amigos"
                style={styles.headerSearchButton}
                activeOpacity={0.7}
              >
                <Search size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/friends/chats")}
                style={styles.headerChatButton}
                activeOpacity={0.7}
              >
                <MessageCircle size={20} color="#FFFFFF" />
                {unreadChatsCount > 0 && (
                  <View style={styles.headerChatBadge}>
                    <Text style={styles.headerChatBadgeText}>
                      {unreadChatsCount > 9 ? "9+" : unreadChatsCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Barra de búsqueda de usuarios */}
        <View style={[styles.searchContainer, { paddingTop: insets.top + 12 }]}>
          <View style={styles.searchInputContainer}>
            <Search size={18} color="#9B9B9B" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar usuario por @username"
              placeholderTextColor="#666666"
              value={searchQuery}
              onChangeText={(text) => {
                // Auto-agregar @ al username
                let newText = text;
                if (newText.length > 0 && !newText.startsWith('@')) {
                  newText = '@' + newText;
                }
                // Si el usuario borra todo, permitir que quede vacío
                if (newText === '@') {
                  newText = '';
                }
                setSearchQuery(newText);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={() => {
                if (searchQuery.trim()) {
                  router.push(`/friends/search?q=${searchQuery.trim()}`);
                }
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
                activeOpacity={0.7}
              >
                <X size={16} color="#9B9B9B" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `${item?.id || index}-${index}`}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          renderSectionFooter={renderSectionFooter}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No hay contenido para mostrar.</Text>
            </View>
          )}
          contentContainerStyle={
            sections.every((s) => !s.data || s.data.length === 0)
              ? [styles.listContent, { flexGrow: 1, justifyContent: "center" }]
              : styles.listContent
          }
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 32,
  },
  sectionHeader: {
    marginBottom: 12,
    paddingTop: 0,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  headerSearchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 16,
  },
  emptyStateText: {
    color: "#9B9B9B",
    fontSize: 15,
    textAlign: "center",
  },
  ctaButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#FF3B30",
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  requestItem: {
    paddingVertical: 14,
    gap: 14,
    backgroundColor: "#1A1A1A",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: "#222222",
  },
  requestUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    flex: 1,
  },
  requestAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  requestAvatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 19,
  },
  requestUserDetails: {
    flex: 1,
    gap: 4,
  },
  requestUserName: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: -0.3,
  },
  requestUserUsername: {
    color: "#AAAAAA",
    fontSize: 14,
  },
  requestActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 3,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 11,
    backgroundColor: "#FF3B30",
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 11,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333333",
    alignItems: "center",
  },
  rejectButtonText: {
    color: "#AAAAAA",
    fontSize: 15,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#1A1A1A",
    marginLeft: 66,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#1A1A1A",
    borderRadius: 15,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: "#222222",
  },
  friendUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    flex: 1,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  friendAvatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 18,
  },
  friendUserDetails: {
    flex: 1,
    gap: 4,
  },
  friendUserName: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: -0.3,
  },
  friendUserUsername: {
    color: "#AAAAAA",
    fontSize: 13,
  },
  friendActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusButtonPrimary: {
    backgroundColor: "#FF3B30",
    borderColor: "transparent",
  },
  statusButtonMutual: {
    backgroundColor: "#FF3B30",
    borderColor: "transparent",
  },
  statusButtonMuted: {
    backgroundColor: "#1A1A1A",
    borderColor: "#333333",
  },
  statusButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  statusButtonTextMuted: {
    color: "#AAAAAA",
    fontSize: 13,
    fontWeight: "600",
  },
  chatIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "rgba(255, 59, 48, 0.15)",
  },
  chatDotBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF3B30",
    borderWidth: 2,
    borderColor: "#1A1A1A",
  },
  headerChatButton: {
    position: "relative",
    padding: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerChatBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#0B0B0B",
  },
  headerChatBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  searchContainer: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    backgroundColor: "#0B0B0B",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222222",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchIcon: {
    marginRight: 2,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
    padding: 0,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
});
