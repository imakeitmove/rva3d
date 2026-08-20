import type { Metadata } from "next";

import { ImpossibleCubePrototype } from "@/components/three/impossible_cube/ImpossibleCubePrototype";

export const metadata: Metadata = {
  title: "RVA3D Impossible Cube Prototype",
  description: "Interactive six-face Cinema 4D to Drei portal prototype.",
};

export default function ImpossibleCubePrototypePage() {
  return <ImpossibleCubePrototype />;
}
