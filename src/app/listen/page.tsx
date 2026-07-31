import type { Metadata } from "next";

import { ListenExperience } from "./ListenExperience";

export const metadata: Metadata = {
  title: "This Cube Has Ears | RVA3D",
  description: "An audio-reactive Three.js experiment that listens through your microphone.",
};

export default function ListenPage() {
  return <ListenExperience />;
}
