import { create } from "zustand";

import { mockPlans } from "@/mocks/plans";
import { useNotificationsStore } from "@/store/notificationsStore";
import { usePlansStore } from "@/store/plansStore";

export type Comment = {
  id: string;
  userId: string;
  text: string;
  createdAt: number;
  likes: string[];
};

type CommentsState = {
  comments: Record<string, Comment[]>;
  addComment: (planId: string, userId: string, text: string) => void;
  toggleLike: (planId: string, commentId: string, userId: string) => void;
};

const buildComment = (userId: string, text: string): Comment => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  userId,
  text,
  createdAt: Date.now(),
  likes: [],
});

const findPlanOwnerId = (planId: string): string | null => {
  const { plans } = usePlansStore.getState();
  const plan = plans.find((item) => item.id === planId) || mockPlans.find((item) => item.id === planId);
  if (!plan) return null;
  return plan.createdBy ?? plan.userId ?? null;
};

export const useCommentsStore = create<CommentsState>((set, get) => ({
  comments: {},

  addComment: (planId, userId, text) => {
    if (!planId || !userId || !text.trim()) return;

    const trimmed = text.trim();
    const comment = buildComment(userId, trimmed);

    set((state) => {
      const existing = state.comments[planId] ?? [];
      return {
        comments: {
          ...state.comments,
          [planId]: [comment, ...existing],
        },
      };
    });

    const ownerId = findPlanOwnerId(planId);
    if (ownerId && ownerId !== userId) {
      useNotificationsStore.getState().addNotification({
        type: "comment",
        actorId: userId,
        targetPlanId: planId,
      });
    }
  },

  toggleLike: (planId, commentId, userId) => {
    if (!planId || !commentId || !userId) return;

    const state = get();
    const planComments = state.comments[planId];
    if (!planComments?.length) return;

    let shouldNotify = false;
    let commentOwnerId: string | null = null;

    const nextComments = planComments.map((comment) => {
      if (comment.id !== commentId) {
        return comment;
      }

      const hasLiked = comment.likes.includes(userId);

      if (!hasLiked && comment.userId !== userId) {
        shouldNotify = true;
        commentOwnerId = comment.userId;
      }

      const likes = hasLiked
        ? comment.likes.filter((id) => id !== userId)
        : [userId, ...comment.likes];

      return {
        ...comment,
        likes,
      };
    });

    set((state) => ({
      comments: {
        ...state.comments,
        [planId]: nextComments,
      },
    }));

    if (shouldNotify && commentOwnerId && commentOwnerId !== userId) {
      useNotificationsStore.getState().addNotification({
        type: "like",
        actorId: userId,
        targetPlanId: planId,
      });
    }
  },
}));
