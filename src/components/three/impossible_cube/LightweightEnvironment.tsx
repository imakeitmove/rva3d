"use client";

import { useThree } from "@react-three/fiber";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { Mesh, PMREMGenerator } from "three";
import type {
  Material,
  Texture,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const LightweightEnvironmentContext = createContext<Texture | null>(null);
const pendingDisposals = new WeakMap<
  WebGLRenderTarget,
  ReturnType<typeof setTimeout>
>();
function disposeRoomEnvironment(room: RoomEnvironment) {
  room.traverse((object) => {
    const mesh = object as Mesh;

    if (!mesh.isMesh) {
      return;
    }

    mesh.geometry.dispose();
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];

    materials.forEach((material: Material) => material.dispose());
  });
}

function createRoomEnvironmentTarget(gl: WebGLRenderer) {
  const room = new RoomEnvironment();
  const pmrem = new PMREMGenerator(gl);

  pmrem.compileCubemapShader();
  const target = pmrem.fromScene(room, 0.04);
  disposeRoomEnvironment(room);
  pmrem.dispose();

  return target;
}

/** Binds the shared zero-download PMREM to whichever R3F scene owns it. */
export function LightweightEnvironmentBinding() {
  const environment = useContext(LightweightEnvironmentContext);

  return environment ? (
    <primitive attach="environment" object={environment} />
  ) : null;
}

export function LightweightEnvironmentProvider({
  children,
}: {
  children: ReactNode;
}) {
  const gl = useThree((state) => state.gl);
  const [target] = useState(() => createRoomEnvironmentTarget(gl));

  useEffect(() => {
    const pendingDisposal = pendingDisposals.get(target);

    if (pendingDisposal !== undefined) {
      clearTimeout(pendingDisposal);
      pendingDisposals.delete(target);
    }

    return () => {
      // A deferred dispose survives React's development-only effect replay,
      // while a real unmount still releases the PMREM on the next task.
      const disposalTimer = setTimeout(() => {
        target.dispose();
        pendingDisposals.delete(target);
      }, 0);

      pendingDisposals.set(target, disposalTimer);
    };
  }, [target]);

  return (
    <LightweightEnvironmentContext.Provider value={target.texture}>
      <LightweightEnvironmentBinding />
      {children}
    </LightweightEnvironmentContext.Provider>
  );
}
