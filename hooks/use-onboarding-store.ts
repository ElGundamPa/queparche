import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingData {
  bio: string;
  interests: string[];
  avatar: string;
  isCompleted: boolean;
}

interface OnboardingStore {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const initialData: OnboardingData = {
  bio: '',
  interests: [],
  avatar: '',
  isCompleted: false,
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      data: initialData,
      updateData: (newData) =>
        set((state) => ({
          data: { ...state.data, ...newData },
        })),
      completeOnboarding: () =>
        set((state) => ({
          data: { ...state.data, isCompleted: true },
        })),
      resetOnboarding: () =>
        set(() => ({
          data: initialData,
        })),
    }),
    {
      name: 'onboarding-storage',
    }
  )
);
