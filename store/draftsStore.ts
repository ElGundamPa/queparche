import { create } from "zustand";
import type { Router } from "expo-router";

import { usePlansStore } from "@/store/plansStore";
import { useUserProfileStore } from "@/store/userStore";
import { useAuthStore } from "@/hooks/use-auth-store";
import type { Plan } from "@/types/plan";

export type DraftLocation = {
  lat: number;
  lng: number;
  label: string;
};

export type DraftPlan = {
  id: string;
  name: string;
  categories: string[];
  location: DraftLocation;
  capacity: number;
  averagePrice: number;
  eventDate?: string | null;
  description: string;
  images: string[];
  createdAt: Date;
  published: boolean;
};

const buildInitialDraft = (): DraftPlan => ({
  id: `draft-${Date.now()}`,
  name: "",
  categories: [],
  location: {
    lat: 0,
    lng: 0,
    label: "",
  },
  capacity: 0,
  averagePrice: 0,
  eventDate: null,
  description: "",
  images: [],
  createdAt: new Date(),
  published: false,
});

export type DraftsState = {
  draft: DraftPlan;
  setDraftField: <K extends keyof DraftPlan>(key: K, value: DraftPlan[K]) => void;
  resetDraft: () => void;
  publishDraft: (router: Router) => Plan | null;
  saveDraft: () => void;
};

const PRIMARY_CATEGORY_MATCHES: Record<string, Plan["primaryCategory"]> = {
  rooftop: "rooftop",
  rooftops: "rooftop",
  mirador: "mirador",
  miradores: "mirador",
  restaurante: "restaurante",
  restaurantes: "restaurante",
  cafe: "cafe",
  cafés: "cafe",
  cafes: "cafe",
  bar: "bar",
  bares: "bar",
  club: "club",
  clubes: "club",
  parque: "parque",
  parques: "parque",
  barrio: "barrio",
};

const resolvePrimaryCategory = (categories: string[]): Plan["primaryCategory"] => {
  for (const category of categories) {
    const key = category.trim().toLowerCase();
    if (PRIMARY_CATEGORY_MATCHES[key]) {
      return PRIMARY_CATEGORY_MATCHES[key];
    }
  }
  return "bar";
};

const buildPlanFromDraft = (draft: DraftPlan): Plan => {
  const id = Date.now().toString();
  const primaryCategory = resolvePrimaryCategory(draft.categories);
  const authState = useAuthStore.getState();
  const currentUserId = authState.currentUser?.id ?? "guest-user";

  return {
    id,
    name: draft.name,
    categories: draft.categories,
    location: {
      address: draft.location.label,
      lat: draft.location.lat,
      lng: draft.location.lng,
      zone: draft.location.label || undefined,
    },
    capacity: draft.capacity,
    currentAttendees: 0,
    averagePrice: draft.averagePrice,
    eventDate: draft.eventDate ?? undefined,
    description: draft.description,
    images: draft.images,
    rating: 0,
    createdBy: currentUserId,
    userId: currentUserId,
    createdAt: Date.now(),
    primaryCategory,
    category: draft.categories[0] ?? primaryCategory,
    tags: draft.categories,
  };
};

export const useDraftsStore = create<DraftsState>((set, get) => ({
  draft: buildInitialDraft(),

  setDraftField: (key, value) =>
    set((state) => ({
      draft: {
        ...state.draft,
        [key]: value,
      },
    })),

  resetDraft: () =>
    set({
      draft: buildInitialDraft(),
    }),

  publishDraft: (router) => {
    const state = get();
    const { draft } = state;
    if (!draft.name.trim()) {
      return null;
    }

    const plan = buildPlanFromDraft(draft);

    const { addPlan } = usePlansStore.getState();
    addPlan(plan);

    const { addCreatedPlan } = useUserProfileStore.getState();
    addCreatedPlan(plan.id);

    set({
      draft: buildInitialDraft(),
    });

    if (router) {
      router.push(`/plan/${plan.id}`);
    }

    return plan;
  },

  saveDraft: () =>
    set((state) => ({
      draft: {
        ...state.draft,
        createdAt: new Date(),
      },
    })),
}));
