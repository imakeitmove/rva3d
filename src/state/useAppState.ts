import { create } from "zustand";

export type Mode = "intro" | "sandbox" | "portal" | "work" | "services";

export const useAppState = create<{
  mode: Mode;
  setMode: (m: Mode) => void;
}>((set) => ({
  mode: "intro",
  setMode: (mode) => set({ mode }),
}));
