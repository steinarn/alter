import { create } from "zustand";

type SuggestionMode = "PERSONAL" | "PROFESSIONAL";

interface DashboardState {
  mode: SuggestionMode;
  setMode: (mode: SuggestionMode) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  mode: "PROFESSIONAL",
  setMode: (mode) => set({ mode }),
}));
