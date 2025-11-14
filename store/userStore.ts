import { create } from "zustand";

import { mockPlans } from "@/mocks/plans";
import { mockUsers } from "@/mocks/users";
import { useAuthStore } from "@/hooks/use-auth-store";
import type { User } from "@/types/user";

type UserStoreState = {
  currentUser: User | null;
  addCreatedPlan: (planId: string) => void;
  setCurrentUser: (user: User | null) => void;
};

const getInitialUser = () => {
  const authState = useAuthStore.getState();
  if (authState.currentUser) {
    const { currentUser } = authState;
    return {
      ...currentUser,
      createdPlans: currentUser.createdPlans ?? [],
    };
  }

  const fallback = mockUsers[1] ?? mockUsers[0] ?? null;
  if (!fallback) return null;

  const relatedPlans = mockPlans
    .filter((plan) => plan.userId === fallback.id)
    .map((plan) => plan.id);

  return {
    ...fallback,
    createdPlans: fallback.createdPlans?.length ? fallback.createdPlans : relatedPlans,
  };
};

export const useUserProfileStore = create<UserStoreState>((set, get) => ({
  currentUser: getInitialUser(),

  setCurrentUser: (user) => {
    set({ currentUser: user });
  },

  addCreatedPlan: (planId) => {
    if (!planId) return;

    const state = get();
    const targetUser = state.currentUser ?? getInitialUser();
    if (!targetUser) return;

    if (targetUser.createdPlans?.includes(planId)) {
      return;
    }

    const updatedUser: User = {
      ...targetUser,
      createdPlans: [planId, ...(targetUser.createdPlans ?? [])],
      plansCreated: (targetUser.plansCreated ?? 0) + 1,
    };

    set({ currentUser: updatedUser });

    const authState = useAuthStore.getState();
    const { currentUser, users } = authState;
    if (currentUser && currentUser.id === updatedUser.id) {
      const mergedUser = {
        ...currentUser,
        createdPlans: updatedUser.createdPlans,
        plansCreated: updatedUser.plansCreated,
      };

      useAuthStore.setState({
        currentUser: mergedUser,
        users: users.map((user) =>
          user.id === mergedUser.id
            ? {
                ...user,
                createdPlans: mergedUser.createdPlans,
                plansCreated: mergedUser.plansCreated,
              }
            : user
        ),
      });
    }
  },
}));

