"use client";

import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useBeforePhysicsStep,
} from "@react-three/rapier";
import { useMemo, useRef } from "react";
import { Euler, Quaternion, Vector3 } from "three";

import type { CubeInteractionRef } from "./types";

export const PHYSICS_SPHERE_COUNT = 16;
export const PHYSICS_RESTITUTION = 0.32;
export const PHYSICS_FRICTION = 0.55;
export const PHYSICS_LINEAR_DAMPING = 0.35;
export const PHYSICS_ANGULAR_DAMPING = 0.45;

const WORLD_GRAVITY = new Vector3(0, -9.81, 0);

const SPHERE_COLORS = ["#d7a85c", "#7895ad", "#b96d57", "#d6d8d9"];

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
  return (
    <group name="TOP_PHYSICS_WORLD">
      {/* A shallow tray keeps the settled simulation legible at oblique cube angles. */}
      <mesh position={[0, 0, -0.53]}>
        <boxGeometry args={[1.72, 1.72, 0.04]} />
        <meshStandardMaterial color="#17212a" roughness={0.82} />
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
