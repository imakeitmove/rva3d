import { MeshStandardMaterial, SphereGeometry } from "three";

import { RVA3D_GREEN } from "./rva3dPalette";
import type { CubeFaceNumber } from "./types";

const PIP_X = 0.032;
const PIP_Y = 0.032;
const PIP_GEOMETRY = new SphereGeometry(0.014, 12, 8);
const PIP_MATERIAL = new MeshStandardMaterial({
  color: RVA3D_GREEN,
  emissive: RVA3D_GREEN,
  emissiveIntensity: 0.05,
  metalness: 0.08,
  roughness: 0.34,
});

const PIP_LAYOUTS: Record<
  CubeFaceNumber,
  readonly [number, number][]
> = {
  1: [[0, 0]],
  2: [
    [-PIP_X, PIP_Y],
    [PIP_X, -PIP_Y],
  ],
  3: [
    [-PIP_X, PIP_Y],
    [0, 0],
    [PIP_X, -PIP_Y],
  ],
  4: [
    [-PIP_X, PIP_Y],
    [PIP_X, PIP_Y],
    [-PIP_X, -PIP_Y],
    [PIP_X, -PIP_Y],
  ],
  5: [
    [-PIP_X, PIP_Y],
    [PIP_X, PIP_Y],
    [0, 0],
    [-PIP_X, -PIP_Y],
    [PIP_X, -PIP_Y],
  ],
  6: [
    [-PIP_X, PIP_Y],
    [PIP_X, PIP_Y],
    [-PIP_X, 0],
    [PIP_X, 0],
    [-PIP_X, -PIP_Y],
    [PIP_X, -PIP_Y],
  ],
};

type FacePipsProps = {
  value: CubeFaceNumber;
  z?: number;
};

export function FacePips({ value, z = 0.095 }: FacePipsProps) {
  return (
    <group
      dispose={null}
      name={`FACE_${value}_PIPS`}
      position={[0.79, 0.94, z]}
    >
      {PIP_LAYOUTS[value].map(([x, y], index) => (
        <mesh
          key={`${x}-${y}-${index}`}
          geometry={PIP_GEOMETRY}
          material={PIP_MATERIAL}
          position={[x, y, 0]}
        />
      ))}
    </group>
  );
}
