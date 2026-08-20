"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import {
  Color,
  DynamicDrawUsage,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";
import type { InstancedMesh } from "three";

import {
  mixRva3dColor,
  RVA3D_BLUE,
  RVA3D_GREEN,
  RVA3D_INK,
  RVA3D_PINK,
  RVA3D_WHITE,
} from "./rva3dPalette";
import type { CubeInteractionRef } from "./types";

export const FLOCK_ARROW_COUNT = 42;

const NEIGHBOR_RADIUS = 0.36;
const SEPARATION_RADIUS = 0.17;
const CRUISE_SPEED = 0.27;
const MIN_SPEED = 0.12;
const MAX_SPEED = 0.38;
const MAX_STEERING_FORCE = 0.34;
const SEPARATION_WEIGHT = 1.2;
const ALIGNMENT_WEIGHT = 0.52;
const COHESION_WEIGHT = 0.36;
const BOUNDARY_WEIGHT = 1.55;
const THROW_DISTURBANCE_WEIGHT = 0.16;
const MAX_FLOCK_DELTA = 1 / 30;
const FLOCK_SIMULATION_SPEED = 3;
const BOUNDS = {
  x: 0.78,
  y: 0.78,
  frontZ: -0.2,
  rearZ: -1.48,
} as const;

const ARROW_UP = new Vector3(0, 1, 0);
const ARROW_SCALE = new Vector3(1, 1, 1);
const ARROW_COLORS = [
  new Color(RVA3D_GREEN),
  new Color(RVA3D_GREEN),
  new Color(mixRva3dColor(RVA3D_GREEN, RVA3D_WHITE, 0.18)),
  new Color(RVA3D_GREEN),
  new Color(mixRva3dColor(RVA3D_GREEN, RVA3D_INK, 0.14)),
  new Color(RVA3D_GREEN),
  new Color(RVA3D_BLUE),
  new Color(RVA3D_GREEN),
  new Color(mixRva3dColor(RVA3D_GREEN, RVA3D_WHITE, 0.1)),
  new Color(RVA3D_GREEN),
  new Color(RVA3D_PINK),
  new Color(RVA3D_GREEN),
] as const;

type FlockState = {
  accelerations: Vector3[];
  positions: Vector3[];
  velocities: Vector3[];
};

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createFlockState(): FlockState {
  const random = createSeededRandom(0x52564133);
  const positions: Vector3[] = [];
  const velocities: Vector3[] = [];
  const accelerations: Vector3[] = [];

  for (let index = 0; index < FLOCK_ARROW_COUNT; index += 1) {
    positions.push(
      new Vector3(
        (random() * 2 - 1) * 0.68,
        (random() * 2 - 1) * 0.68,
        BOUNDS.frontZ - 0.12 - random() * 1.05,
      ),
    );

    const velocity = new Vector3(
      random() * 2 - 1,
      random() * 2 - 1,
      (random() * 2 - 1) * 0.45,
    )
      .normalize()
      .multiplyScalar(MIN_SPEED + random() * (CRUISE_SPEED - MIN_SPEED));

    velocities.push(velocity);
    accelerations.push(new Vector3());
  }

  return { accelerations, positions, velocities };
}

type FlockingArrowWorldProps = {
  interactionRef: CubeInteractionRef;
  prefersReducedMotion: boolean;
};

export function FlockingArrowWorld({
  interactionRef,
  prefersReducedMotion,
}: FlockingArrowWorldProps) {
  const instancedMeshRef = useRef<InstancedMesh>(null);
  const flockRef = useRef<FlockState | null>(null);

  if (flockRef.current === null) {
    flockRef.current = createFlockState();
  }

  const flock = flockRef.current;
  const separation = useRef(new Vector3());
  const alignment = useRef(new Vector3());
  const cohesion = useRef(new Vector3());
  const direction = useRef(new Vector3());
  const instanceMatrix = useRef(new Matrix4());
  const instanceQuaternion = useRef(new Quaternion());

  useEffect(() => {
    const instancedMesh = instancedMeshRef.current;

    if (!instancedMesh) {
      return;
    }

    instancedMesh.instanceMatrix.setUsage(DynamicDrawUsage);

    for (let index = 0; index < FLOCK_ARROW_COUNT; index += 1) {
      instancedMesh.setColorAt(index, ARROW_COLORS[index % ARROW_COLORS.length]);
    }

    if (instancedMesh.instanceColor) {
      instancedMesh.instanceColor.needsUpdate = true;
    }
  }, []);

  useFrame((_, frameDelta) => {
    const instancedMesh = instancedMeshRef.current;

    if (!instancedMesh) {
      return;
    }

    if (!prefersReducedMotion) {
      // Previous 1x simulation retained for rollback:
      // const delta = Math.min(frameDelta, MAX_FLOCK_DELTA);
      // Scale simulation time in one place so the flock keeps the same forces,
      // speed limits, and steering relationships while moving three times faster.
      const delta =
        Math.min(frameDelta, MAX_FLOCK_DELTA) * FLOCK_SIMULATION_SPEED;
      const neighborRadiusSquared = NEIGHBOR_RADIUS * NEIGHBOR_RADIUS;
      const separationRadiusSquared = SEPARATION_RADIUS * SEPARATION_RADIUS;
      const throwStrength = Math.min(
        interactionRef.current.angularVelocity.length() / 4.5,
        1,
      );

      for (let index = 0; index < FLOCK_ARROW_COUNT; index += 1) {
        const position = flock.positions[index];
        const velocity = flock.velocities[index];
        const acceleration = flock.accelerations[index].set(0, 0, 0);
        let neighborCount = 0;

        separation.current.set(0, 0, 0);
        alignment.current.set(0, 0, 0);
        cohesion.current.set(0, 0, 0);

        for (
          let neighborIndex = 0;
          neighborIndex < FLOCK_ARROW_COUNT;
          neighborIndex += 1
        ) {
          if (neighborIndex === index) {
            continue;
          }

          const neighborPosition = flock.positions[neighborIndex];
          const deltaX = neighborPosition.x - position.x;
          const deltaY = neighborPosition.y - position.y;
          const deltaZ = neighborPosition.z - position.z;
          const distanceSquared =
            deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ;

          if (distanceSquared >= neighborRadiusSquared) {
            continue;
          }

          neighborCount += 1;
          alignment.current.add(flock.velocities[neighborIndex]);
          cohesion.current.add(neighborPosition);

          if (distanceSquared < separationRadiusSquared) {
            const inverseDistance = 1 / Math.max(distanceSquared, 0.0025);
            separation.current.x -= deltaX * inverseDistance;
            separation.current.y -= deltaY * inverseDistance;
            separation.current.z -= deltaZ * inverseDistance;
          }
        }

        if (neighborCount > 0) {
          alignment.current
            .divideScalar(neighborCount)
            .setLength(CRUISE_SPEED)
            .sub(velocity)
            .clampLength(0, MAX_STEERING_FORCE)
            .multiplyScalar(ALIGNMENT_WEIGHT);
          cohesion.current
            .divideScalar(neighborCount)
            .sub(position)
            .clampLength(0, MAX_STEERING_FORCE)
            .multiplyScalar(COHESION_WEIGHT);
          separation.current
            .clampLength(0, MAX_STEERING_FORCE)
            .multiplyScalar(SEPARATION_WEIGHT);

          acceleration
            .add(alignment.current)
            .add(cohesion.current)
            .add(separation.current);
        }

        if (position.x > 0.62) {
          acceleration.x -= (position.x - 0.62) * BOUNDARY_WEIGHT;
        } else if (position.x < -0.62) {
          acceleration.x += (-0.62 - position.x) * BOUNDARY_WEIGHT;
        }

        if (position.y > 0.62) {
          acceleration.y -= (position.y - 0.62) * BOUNDARY_WEIGHT;
        } else if (position.y < -0.62) {
          acceleration.y += (-0.62 - position.y) * BOUNDARY_WEIGHT;
        }

        if (position.z > -0.34) {
          acceleration.z -= (position.z + 0.34) * BOUNDARY_WEIGHT;
        } else if (position.z < -1.34) {
          acceleration.z += (-1.34 - position.z) * BOUNDARY_WEIGHT;
        }

        if (throwStrength > 0.02) {
          const disturbance = throwStrength * THROW_DISTURBANCE_WEIGHT;
          acceleration.x +=
            position.x * disturbance +
            interactionRef.current.angularVelocity.y * 0.012;
          acceleration.y +=
            position.y * disturbance +
            interactionRef.current.angularVelocity.x * 0.012;
          acceleration.z += (index % 2 === 0 ? 1 : -1) * disturbance * 0.2;
        }

        velocity
          .addScaledVector(acceleration, delta)
          .clampLength(MIN_SPEED, MAX_SPEED);
        position.addScaledVector(velocity, delta);

        if (position.x > BOUNDS.x || position.x < -BOUNDS.x) {
          position.x = clamp(position.x, -BOUNDS.x, BOUNDS.x);
          velocity.x *= -0.55;
        }
        if (position.y > BOUNDS.y || position.y < -BOUNDS.y) {
          position.y = clamp(position.y, -BOUNDS.y, BOUNDS.y);
          velocity.y *= -0.55;
        }
        if (position.z > BOUNDS.frontZ || position.z < BOUNDS.rearZ) {
          position.z = clamp(
            position.z,
            BOUNDS.rearZ,
            BOUNDS.frontZ,
          );
          velocity.z *= -0.55;
        }
      }
    }

    for (let index = 0; index < FLOCK_ARROW_COUNT; index += 1) {
      direction.current.copy(flock.velocities[index]).normalize();
      instanceQuaternion.current.setFromUnitVectors(
        ARROW_UP,
        direction.current,
      );
      instanceMatrix.current.compose(
        flock.positions[index],
        instanceQuaternion.current,
        ARROW_SCALE,
      );
      instancedMesh.setMatrixAt(index, instanceMatrix.current);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group name="BOTTOM_FLOCK_WORLD">
      <mesh position={[0, 0, -1.52]}>
        <boxGeometry args={[1.72, 1.72, 0.04]} />
        <meshStandardMaterial color={RVA3D_INK} roughness={0.88} />
      </mesh>
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, FLOCK_ARROW_COUNT]}
        frustumCulled={false}
      >
        <coneGeometry args={[0.045, 0.16, 3]} />
        {/* Previous single-color arrow material retained for rollback:
        color="#79d5c6"
        */}
        <meshStandardMaterial
          color={RVA3D_WHITE}
          metalness={0.08}
          roughness={0.5}
        />
      </instancedMesh>
    </group>
  );
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}
