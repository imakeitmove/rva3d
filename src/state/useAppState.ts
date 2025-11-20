import { create } from "zustand";

type Mode = "intro" | "sandbox" | "portal";

export const useAppState = create<{
  mode: Mode;
  setMode: (m: Mode) => void;
}>((set) => ({
  mode: "intro",
  setMode: (mode) => set({ mode }),
}));
