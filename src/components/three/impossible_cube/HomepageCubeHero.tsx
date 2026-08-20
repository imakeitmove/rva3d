"use client";

import dynamic from "next/dynamic";

const InteractiveImpossibleCube = dynamic(
  () =>
    import("./ImpossibleCubePrototype").then(
      (module) => module.ImpossibleCubePrototype,
    ),
  {
    loading: () => null,
    ssr: false,
  },
);

export function HomepageCubeHero() {
  return (
    <InteractiveImpossibleCube presentation="hero" showDebug={false} />
  );
}
