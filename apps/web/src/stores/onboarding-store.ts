import { create } from "zustand";

interface ChatMessage {
  role: "USER" | "ASSISTANT";
  content: string;
}

interface OnboardingState {
  messages: ChatMessage[];
  isLoading: boolean;
  stage: string;
  personaReady: boolean;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setStage: (stage: string) => void;
  setPersonaReady: (ready: boolean) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  messages: [],
  isLoading: false,
  stage: "energy_energizers",
  personaReady: false,
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (isLoading) => set({ isLoading }),
  setStage: (stage) => set({ stage }),
  setPersonaReady: (personaReady) => set({ personaReady }),
  reset: () =>
    set({
      messages: [],
      isLoading: false,
      stage: "energy_energizers",
      personaReady: false,
    }),
}));
