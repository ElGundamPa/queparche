import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { mockPlans } from "@/mocks/plans";
import type { Plan } from "@/types/plan";
import { useAuthStore } from "@/hooks/use-auth-store";

type PlansState = {
  plans: Plan[];
  joinedPlans: string[];
  attendees: Record<string, string[]>;
  addPlan: (plan: Plan) => void;
  setPlans: (plans: Plan[]) => void;
  getPlanById: (id: string) => Plan | undefined;
  joinPlan: (id: string) => void;
  leavePlan: (id: string) => void;
  toggleJoin: (id: string) => void;
};

const ensureUniquePlan = (plans: Plan[], plan: Plan) => {
  const exists = plans.some((item) => item.id === plan.id);
  if (exists) {
    return plans;
  }
  return [plan, ...plans];
};

export const usePlansStore = create<PlansState>()(
  persist(
    (set, get) => ({
      plans: mockPlans,
      joinedPlans: [],
      attendees: {},

  addPlan: (plan) =>
    set((state) => ({
      plans: ensureUniquePlan(state.plans, plan),
    })),

  setPlans: (plans) =>
    set(() => ({
      plans,
    })),

  getPlanById: (id) => get().plans.find((plan) => plan.id === id),

  joinPlan: (id) =>
    set((state) => {
      const userId = useAuthStore.getState().currentUser?.id;
      if (!userId) {
        return state;
      }
      if (state.joinedPlans.includes(id)) {
        return state;
      }
      const existingAttendees = state.attendees[id] ?? [];
      const updatedAttendees = {
        ...state.attendees,
        [id]: existingAttendees.includes(userId)
          ? existingAttendees
          : [userId, ...existingAttendees],
      };
      return {
        ...state,
        joinedPlans: [id, ...state.joinedPlans],
        attendees: updatedAttendees,
      };
    }),

  leavePlan: (id) =>
    set((state) => ({
      ...state,
      joinedPlans: state.joinedPlans.filter((planId) => planId !== id),
      attendees: (() => {
        const userId = useAuthStore.getState().currentUser?.id;
        if (!userId) {
          return state.attendees;
        }
        const existing = state.attendees[id] ?? [];
        const filtered = existing.filter((attendeeId) => attendeeId !== userId);
        const next = { ...state.attendees };
        if (filtered.length > 0) {
          next[id] = filtered;
        } else {
          delete next[id];
        }
        return next;
      })(),
    })),

  toggleJoin: (id) => {
    const userId = useAuthStore.getState().currentUser?.id;
    if (!userId) {
      return;
    }

    set((state) => {
      const alreadyJoined = state.joinedPlans.includes(id);
      const existing = state.attendees[id] ?? [];
      const withoutUser = existing.filter((attendeeId) => attendeeId !== userId);
      const nextAttendees = { ...state.attendees };

      if (alreadyJoined) {
        if (withoutUser.length > 0) {
          nextAttendees[id] = withoutUser;
        } else {
          delete nextAttendees[id];
        }

        return {
          ...state,
          joinedPlans: state.joinedPlans.filter((planId) => planId !== id),
          attendees: nextAttendees,
        };
      }

      nextAttendees[id] = [userId, ...withoutUser];

      return {
        ...state,
        joinedPlans: [id, ...state.joinedPlans],
        attendees: nextAttendees,
      };
    });
  },
    }),
    {
      name: 'plans-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const usePlanStore = usePlansStore;

