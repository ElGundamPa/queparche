import { create } from "zustand";

type NotificationType = "comment" | "like" | "follow" | "joined";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  actorId: string;
  targetPlanId?: string;
  createdAt: number;
};

type NotificationsState = {
  notifications: NotificationItem[];
  lastReadAt: number | null;
  addNotification: (notification: Omit<NotificationItem, "id" | "createdAt"> & { id?: string; createdAt?: number }) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
};

const createNotification = (
  notification: Omit<NotificationItem, "id" | "createdAt"> & { id?: string; createdAt?: number }
): NotificationItem => ({
  id: notification.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  createdAt: notification.createdAt ?? Date.now(),
  type: notification.type,
  actorId: notification.actorId,
  targetPlanId: notification.targetPlanId,
});

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  lastReadAt: Date.now(),

  addNotification: (notification) => {
    const entry = createNotification(notification);
    set((state) => ({
      notifications: [entry, ...state.notifications].slice(0, 50),
    }));
  },

  markAllAsRead: () => {
    set({ lastReadAt: Date.now() });
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    }));
  },
}));
