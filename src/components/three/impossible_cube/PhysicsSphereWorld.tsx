"use client";

import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useBeforePhysicsStep,
} from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import { useMemo, useRef } from "react";
import type { RefObject } from "react";
import { Euler, Quaternion, Vector3 } from "three";

import {
  mixRva3dColor,
  RVA3D_BLUE,
  RVA3D_GREEN,
  RVA3D_INK,
  RVA3D_PINK,
  RVA3D_WHITE,
} from "./rva3dPalette";
import type { CubeInteractionRef } from "./types";

export const PHYSICS_SPHERE_COUNT = 16;
export const PHYSICS_RESTITUTION = 0.32;
export const PHYSICS_FRICTION = 0.55;
export const PHYSICS_LINEAR_DAMPING = 0.35;
export const PHYSICS_ANGULAR_DAMPING = 0.45;

const WORLD_GRAVITY = new Vector3(0, -9.81, 0);
const MAX_COUPLED_ANGULAR_SPEED = 5;
const MIN_INERTIAL_CHANGE = 0.22;
const INERTIAL_COUPLING = 0.28;
const MAX_INERTIAL_KICK = 1.6;
const MAX_BALL_SPEED = 5.5;

// Previous arbitrary palette retained for rollback:
// const SPHERE_COLORS = ["#d7a85c", "#7895ad", "#b96d57", "#d6d8d9"];
const SPHERE_COLORS = [
  RVA3D_GREEN,
  mixRva3dColor(RVA3D_GREEN, RVA3D_WHITE, 0.24),
  mixRva3dColor(RVA3D_GREEN, RVA3D_INK, 0.18),
  RVA3D_GREEN,
  RVA3D_BLUE,
  mixRva3dColor(RVA3D_GREEN, RVA3D_WHITE, 0.12),
  RVA3D_PINK,
  mixRva3dColor(RVA3D_BLUE, RVA3D_WHITE, 0.2),
  mixRva3dColor(RVA3D_GREEN, RVA3D_INK, 0.3),
  mixRva3dColor(RVA3D_PINK, RVA3D_WHITE, 0.18),
];

const SPHERES = Array.from({ length: PHYSICS_SPHERE_COUNT }, (_, index) => {
  const column = index % 4;
  const row = Math.floor(index / 4);

  return {
    color: SPHERE_COLORS[index % SPHERE_COLORS.length],
    position: [
      -0.58 + column * 0.38,
      -0.58 + row * 0.38,
      -0.18 - column * 0.03,
    ] as [number, number, number],
    radius: 0.095 + ((index * 7) % 5) * 0.01,
  };
});

type OrientedGravityProps = {
  faceRotation: [number, number, number];
  interactionRef: CubeInteractionRef;
};

function OrientedGravity({
  faceRotation,
  interactionRef,
}: OrientedGravityProps) {
  const faceQuaternion = useMemo(
    () => new Quaternion().setFromEuler(new Euler(...faceRotation)),
    [faceRotation],
  );
  const inverseFaceWorldQuaternion = useRef(new Quaternion());
  const localGravity = useRef(new Vector3());

  useBeforePhysicsStep((world) => {
    inverseFaceWorldQuaternion.current
      .copy(interactionRef.current.orientation)
      .multiply(faceQuaternion)
      .invert();
    localGravity.current
      .copy(WORLD_GRAVITY)
      .applyQuaternion(inverseFaceWorldQuaternion.current);

    world.gravity.x = localGravity.current.x;
    world.gravity.y = localGravity.current.y;
    world.gravity.z = localGravity.current.z;
  });

  return null;
}

type InertialImpulseCouplerProps = {
  bodyRefs: RefObject<(RapierRigidBody | null)[]>;
  faceRotation: [number, number, number];
  interactionRef: CubeInteractionRef;
  prefersReducedMotion: boolean;
};

function InertialImpulseCoupler({
  bodyRefs,
  faceRotation,
  interactionRef,
  prefersReducedMotion,
}: InertialImpulseCouplerProps) {
  const faceQuaternion = useMemo(
    () => new Quaternion().setFromEuler(new Euler(...faceRotation)),
    [faceRotation],
  );
  const currentAngularVelocity = useRef(new Vector3());
  const previousAngularVelocity = useRef(new Vector3());
  const angularVelocityChange = useRef(new Vector3());
  const inverseFaceWorldQuaternion = useRef(new Quaternion());
  const localAngularChange = useRef(new Vector3());
  const relativePosition = useRef(new Vector3());
  const velocityKick = useRef(new Vector3());
  const nextVelocity = useRef(new Vector3());

  useBeforePhysicsStep(() => {
    const interaction = interactionRef.current;
    const sourceVelocity = interaction.dragging
      ? interaction.recentDragVelocity
      : interaction.angularVelocity;

    currentAngularVelocity.current
      .set(sourceVelocity.x, sourceVelocity.y, 0)
      .clampLength(0, MAX_COUPLED_ANGULAR_SPEED);

    if (prefersReducedMotion) {
      previousAngularVelocity.current.copy(currentAngularVelocity.current);
      return;
    }

    angularVelocityChange.current
      .copy(currentAngularVelocity.current)
      .sub(previousAngularVelocity.current);
    previousAngularVelocity.current.copy(currentAngularVelocity.current);

    if (
      angularVelocityChange.current.lengthSq() <
      MIN_INERTIAL_CHANGE * MIN_INERTIAL_CHANGE
    ) {
      return;
    }

    inverseFaceWorldQuaternion.current
      .copy(interaction.orientation)
      .multiply(faceQuaternion)
      .invert();
    localAngularChange.current
      .copy(angularVelocityChange.current)
      .applyQuaternion(inverseFaceWorldQuaternion.current);

    bodyRefs.current.forEach((body) => {
      if (!body) {
        return;
      }

      const translation = body.translation();
      const linearVelocity = body.linvel();

      relativePosition.current.set(
        translation.x,
        translation.y,
        translation.z,
      );
      velocityKick.current
        .crossVectors(localAngularChange.current, relativePosition.current)
        .multiplyScalar(-INERTIAL_COUPLING)
        .clampLength(0, MAX_INERTIAL_KICK);
      nextVelocity.current
        .set(linearVelocity.x, linearVelocity.y, linearVelocity.z)
        .add(velocityKick.current)
        .clampLength(0, MAX_BALL_SPEED);
      body.setLinvel(nextVelocity.current, true);
    });
  });

  return null;
}

type PhysicsSphereWorldProps = {
  faceRotation: [number, number, number];
  interactionRef: CubeInteractionRef;
  prefersReducedMotion: boolean;
};

export function PhysicsSphereWorld({
  faceRotation,
  interactionRef,
  prefersReducedMotion,
}: PhysicsSphereWorldProps) {
  const bodyRefs = useRef<(RapierRigidBody | null)[]>([]);

  return (
    <group name="TOP_PHYSICS_WORLD">
      {/* A shallow tray keeps the settled simulation legible at oblique cube angles. */}
      <mesh position={[0, 0, -0.53]}>
        <boxGeometry args={[1.72, 1.72, 0.04]} />
        <meshStandardMaterial color={RVA3D_INK} roughness={0.82} />
      </mesh>

      <Physics
        colliders={false}
        gravity={[0, -9.81, 0]}
        paused={prefersReducedMotion}
        timeStep={1 / 60}
      >
        <OrientedGravity
          faceRotation={faceRotation}
          interactionRef={interactionRef}
        />
        <InertialImpulseCoupler
          bodyRefs={bodyRefs}
          faceRotation={faceRotation}
          interactionRef={interactionRef}
          prefersReducedMotion={prefersReducedMotion}
        />

        <RigidBody colliders={false} type="fixed">
          <CuboidCollider
            args={[0.04, 0.82, 0.21]}
            position={[-0.86, 0, -0.27]}
          />
          <CuboidCollider args={[0.04, 0.82, 0.21]} position={[0.86, 0, -0.27]} />
          <CuboidCollider
            args={[0.82, 0.04, 0.21]}
            position={[0, 0.86, -0.27]}
          />
          <CuboidCollider
            args={[0.82, 0.04, 0.21]}
            position={[0, -0.86, -0.27]}
          />
          <CuboidCollider args={[0.82, 0.82, 0.04]} position={[0, 0, -0.5]} />
          <CuboidCollider args={[0.82, 0.82, 0.04]} position={[0, 0, -0.02]} />
        </RigidBody>

        {SPHERES.map((sphere, index) => (
          <RigidBody
            key={index}
            angularDamping={PHYSICS_ANGULAR_DAMPING}
            canSleep={false}
            ccd
            colliders={false}
            linearDamping={PHYSICS_LINEAR_DAMPING}
            position={sphere.position}
            ref={(body) => {
              bodyRefs.current[index] = body;
            }}
          >
            <BallCollider
              args={[sphere.radius]}
              friction={PHYSICS_FRICTION}
              restitution={PHYSICS_RESTITUTION}
            />
            <mesh scale={sphere.radius}>
              <sphereGeometry args={[1, 16, 12]} />
              <meshStandardMaterial
                color={sphere.color}
                metalness={0.18}
                roughness={0.5}
              />
            </mesh>
          </RigidBody>
        ))}
      </Physics>
    </group>
  );
}
