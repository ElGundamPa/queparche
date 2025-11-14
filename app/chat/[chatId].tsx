import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { ChevronLeft, Plus, SendHorizontal } from "lucide-react-native";

import { useChatStore, type Message } from "@/store/chatStore";
import { useAuthStore } from "@/hooks/use-auth-store";
import { mockUsers, SOCIAL_MOCK_USERS } from "@/mocks/users";
import SendPlanModal from "@/components/SendPlanModal";

const DEFAULT_AVATAR = "https://avatar.vercel.sh/queparche?size=64&background=111111&color=ffffff" as const;

export default function ChatScreen() {
  const router = useRouter();
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const currentUser = useAuthStore((state) => state.currentUser);
  const userId = currentUser?.id ?? "";

  const chats = useChatStore((state) => state.chats);
  const createChatIfNotExists = useChatStore((state) => state.createChatIfNotExists);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const sendPlan = useChatStore((state) => state.sendPlan);
  const markChatAsRead = useChatStore((state) => state.markChatAsRead);

  const [text, setText] = useState("");
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Obtener o crear chat
  const chat = useMemo(() => {
    if (!chatId) return null;
    const existing = chats[chatId];
    if (existing) return existing;

    // Si no existe, crear uno con el usuario actual y otro usuario mock
    const otherUserId = "mateolab"; // Usuario mock por defecto
    if (userId && userId !== otherUserId) {
      return createChatIfNotExists(chatId, [userId, otherUserId]);
    }
    return null;
  }, [chatId, chats, userId, createChatIfNotExists]);

  // Obtener mensajes
  const messages = useMemo(() => {
    if (!chat || !chat.messages) return [];
    return [...chat.messages].sort((a, b) => a.createdAt - b.createdAt);
  }, [chat]);

  // Obtener el otro usuario
  const otherUser = useMemo(() => {
    if (!chat || !userId) return null;
    const otherUserId = chat.userIds.find((id) => id !== userId);
    if (!otherUserId) return null;

    // Buscar en mocks
    const allUsers = [...mockUsers, ...SOCIAL_MOCK_USERS];
    const user = allUsers.find((u) => u.id === otherUserId);
    if (user) {
      const name = user.name ?? user.username ?? "Usuario";
      const avatar = "avatar" in user && user.avatar ? user.avatar : DEFAULT_AVATAR;
      return {
        id: user.id,
        name,
        avatar,
      };
    }
    return {
      id: otherUserId,
      name: "Usuario",
      avatar: DEFAULT_AVATAR,
    };
  }, [chat, userId]);

  // Marcar como leído
  useEffect(() => {
    if (chat && userId && chatId) {
      markChatAsRead(chatId, userId);
    }
  }, [chat?.id, userId, chatId, markChatAsRead]);

  // Scroll al final
  const scrollToEnd = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  useEffect(() => {
    scrollToEnd();
  }, [scrollToEnd]);

  const handleSend = useCallback(() => {
    if (!chatId || !userId || !text.trim()) return;
    sendMessage(chatId, userId, text.trim());
    setText("");
    scrollToEnd();
  }, [chatId, userId, text, sendMessage, scrollToEnd]);

  const handlePlanSelect = useCallback(
    (planId: string) => {
      if (!chatId || !userId) return;
      sendPlan(chatId, userId, planId);
      setPlanModalVisible(false);
      scrollToEnd();
    },
    [chatId, userId, sendPlan, scrollToEnd]
  );

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      const isMine = item.senderId === userId;

      return (
        <View style={[styles.messageRow, isMine ? styles.messageRowRight : styles.messageRowLeft]}>
          <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
            {item.text && <Text style={styles.bubbleText}>{item.text}</Text>}
            {item.planId && (
              <TouchableOpacity
                style={styles.planBubble}
                onPress={() => router.push(`/plan/${item.planId}`)}
                activeOpacity={0.8}
              >
                <Text style={styles.planTitle}>Parche compartido 🔥</Text>
                <Text style={styles.planSubtitle}>Toca para verlo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    },
    [userId, router]
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack} activeOpacity={0.7}>
          <ChevronLeft size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {otherUser ? (
            <>
              <Image source={{ uri: otherUser.avatar }} style={styles.headerAvatar} contentFit="cover" />
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>{otherUser.name}</Text>
                <Text style={styles.headerSubtitle}>En línea</Text>
              </View>
            </>
          ) : (
            <Text style={styles.headerTitle}>Chat</Text>
          )}
        </View>
        <View style={{ width: 32 }} />
      </View>

      {/* Lista de mensajes */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[
          styles.messagesContent,
          messages.length === 0 && styles.messagesContentEmpty,
        ]}
        style={styles.messagesList}
        onContentSizeChange={scrollToEnd}
        onLayout={scrollToEnd}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Empieza la conversa, habla suave con tus bros 🤙</Text>
          </View>
        }
      />

      {/* Input bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <View style={styles.inputBar}>
          <TouchableOpacity
            style={styles.plusButton}
            onPress={() => setPlanModalVisible(true)}
            activeOpacity={0.7}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Habla suave 🤙..."
            placeholderTextColor="#777777"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
            disabled={!text.trim()}
            onPress={handleSend}
            activeOpacity={0.7}
          >
            <SendHorizontal size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <SendPlanModal
        visible={planModalVisible}
        onClose={() => setPlanModalVisible(false)}
        onSelectPlan={handlePlanSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  headerBack: {
    padding: 4,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#111111",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: "#9B9B9B",
    fontSize: 13,
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  messagesContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  messageRow: {
    flexDirection: "row",
  },
  messageRowRight: {
    justifyContent: "flex-end",
  },
  messageRowLeft: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  bubbleMine: {
    backgroundColor: "#D7263D",
  },
  bubbleTheirs: {
    backgroundColor: "#1F1F1F",
  },
  bubbleText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  planBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    marginTop: 8,
  },
  planTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  planSubtitle: {
    color: "#9B9B9B",
    fontSize: 13,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#000000",
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
  },
  plusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#111111",
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 20,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D7263D",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#1F1F1F",
    opacity: 0.4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#9B9B9B",
    fontSize: 16,
    textAlign: "center",
  },
});
