import type { Metadata } from "next";

import { CalibrationPortal } from "@/components/three/impossible_cube/CalibrationPortal";

export const metadata: Metadata = {
  title: "RVA3D Impossible Portal Calibration",
  description: "One-face Cinema 4D to GLB to Drei portal calibration.",
};

export default function ImpossibleCubeCalibrationPage() {
  return <CalibrationPortal />;
}
