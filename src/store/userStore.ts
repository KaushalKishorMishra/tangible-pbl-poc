import { create } from 'zustand';

export type UserRole = 'educator' | 'learner' | 'admin' | null;

interface UserState {
  role: UserRole;
  onboardingCompleted: boolean;
  currentOnboardingStep: number;
  isOnboardingActive: boolean;
}

interface UserStore {
  user: UserState;
  
  // Actions
  setUserRole: (role: UserRole) => void;
  startOnboarding: () => void;
  completeOnboarding: () => void;
  setOnboardingStep: (step: number) => void;
  skipOnboarding: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: {
    role: null,
    onboardingCompleted: false,
    currentOnboardingStep: 0,
    isOnboardingActive: false,
  },

  setUserRole: (role) => {
    set((state) => ({
      user: {
        ...state.user,
        role,
        isOnboardingActive: role === 'educator' && !state.user.onboardingCompleted,
      },
    }));
  },

  startOnboarding: () => {
    set((state) => ({
      user: {
        ...state.user,
        isOnboardingActive: true,
        currentOnboardingStep: 0,
      },
    }));
  },

  completeOnboarding: () => {
    set((state) => ({
      user: {
        ...state.user,
        onboardingCompleted: true,
        isOnboardingActive: false,
        currentOnboardingStep: 0,
      },
    }));
  },

  setOnboardingStep: (step) => {
    set((state) => ({
      user: {
        ...state.user,
        currentOnboardingStep: step,
      },
    }));
  },

  skipOnboarding: () => {
    set((state) => ({
      user: {
        ...state.user,
        onboardingCompleted: true,
        isOnboardingActive: false,
        currentOnboardingStep: 0,
      },
    }));
  },
}));
