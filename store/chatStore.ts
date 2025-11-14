import { create } from "zustand";

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  text?: string;
  planId?: string;
  createdAt: number;
  readBy: string[];
};

export type Chat = {
  id: string;
  userIds: string[];
  messages: Message[];
};

type ChatStoreState = {
  chats: Record<string, Chat>;
  createChatIfNotExists: (chatId: string, userIds: string[]) => Chat;
  sendMessage: (chatId: string, senderId: string, text: string) => void;
  sendPlan: (chatId: string, senderId: string, planId: string) => void;
  markChatAsRead: (chatId: string, userId: string) => void;
  getUnreadCountByChat: (chatId: string, userId: string) => number;
  getTotalUnreadChats: (userId: string) => number;
};

const buildMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// Mocks iniciales
const createMockChat = (id: string, userIds: string[], messages: Message[]): Chat => ({
  id,
  userIds,
  messages,
});

const now = Date.now();
const mockMessages: Message[] = [
  {
    id: buildMessageId(),
    chatId: "chat-admin-mateolab",
    senderId: "mateolab",
    text: "Bro, ¿vamos al mirador?",
    createdAt: now - 5 * 60 * 1000,
    readBy: ["mateolab"],
  },
  {
    id: buildMessageId(),
    chatId: "chat-admin-mateolab",
    senderId: "admin-user",
    text: "¡De una! ¿A qué hora?",
    createdAt: now - 4 * 60 * 1000,
    readBy: ["admin-user", "mateolab"],
  },
  {
    id: buildMessageId(),
    chatId: "chat-admin-mateolab",
    senderId: "mateolab",
    text: "A las 7pm, te paso el parche",
    createdAt: now - 3 * 60 * 1000,
    readBy: ["mateolab"],
  },
  {
    id: buildMessageId(),
    chatId: "chat-admin-mateolab",
    senderId: "mateolab",
    planId: "plan-1",
    createdAt: now - 2 * 60 * 1000,
    readBy: ["mateolab"],
  },
  {
    id: buildMessageId(),
    chatId: "chat-admin-mateolab",
    senderId: "admin-user",
    text: "Perfecto, ahí nos vemos 🔥",
    createdAt: now - 1 * 60 * 1000,
    readBy: ["admin-user"],
  },
];

const initialChats: Record<string, Chat> = {
  "chat-admin-mateolab": createMockChat("chat-admin-mateolab", ["admin-user", "mateolab"], mockMessages),
};

export const useChatStore = create<ChatStoreState>((set, get) => ({
  chats: initialChats,

  createChatIfNotExists: (chatId, userIds) => {
    const existing = get().chats[chatId];
    if (existing) {
      return existing;
    }

    const newChat: Chat = {
      id: chatId,
      userIds: [...userIds].sort(),
      messages: [],
    };

    set((state) => ({
      chats: {
        ...state.chats,
        [chatId]: newChat,
      },
    }));

    return newChat;
  },

  sendMessage: (chatId, senderId, text) => {
    if (!text.trim()) return;

    const message: Message = {
      id: buildMessageId(),
      chatId,
      senderId,
      text: text.trim(),
      createdAt: Date.now(),
      readBy: [senderId],
    };

    set((state) => {
      const chat = state.chats[chatId];
      if (!chat) return state;

      return {
        chats: {
          ...state.chats,
          [chatId]: {
            ...chat,
            messages: [...chat.messages, message],
          },
        },
      };
    });
  },

  sendPlan: (chatId, senderId, planId) => {
    const message: Message = {
      id: buildMessageId(),
      chatId,
      senderId,
      planId,
      createdAt: Date.now(),
      readBy: [senderId],
    };

    set((state) => {
      const chat = state.chats[chatId];
      if (!chat) return state;

      return {
        chats: {
          ...state.chats,
          [chatId]: {
            ...chat,
            messages: [...chat.messages, message],
          },
        },
      };
    });
  },

  markChatAsRead: (chatId, userId) => {
    set((state) => {
      const chat = state.chats[chatId];
      if (!chat) return state;

      return {
        chats: {
          ...state.chats,
          [chatId]: {
            ...chat,
            messages: chat.messages.map((msg) =>
              msg.readBy.includes(userId)
                ? msg
                : {
                    ...msg,
                    readBy: [...msg.readBy, userId],
                  }
            ),
          },
        },
      };
    });
  },

  getUnreadCountByChat: (chatId, userId) => {
    const chat = get().chats[chatId];
    if (!chat) return 0;

    return chat.messages.filter(
      (msg) => msg.senderId !== userId && !msg.readBy.includes(userId)
    ).length;
  },

  getTotalUnreadChats: (userId) => {
    const chats = get().chats;
    return Object.values(chats).filter((chat) => {
      if (!chat.userIds.includes(userId)) return false;
      return chat.messages.some(
        (msg) => msg.senderId !== userId && !msg.readBy.includes(userId)
      );
    }).length;
  },
}));
