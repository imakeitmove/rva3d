import type { MutableRefObject } from "react";
import type { Quaternion, Vector2 } from "three";

export type FaceTransform = {
  markerColor: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
};

export type CubeInteractionState = {
  angularVelocity: Vector2;
  dragging: boolean;
  lastPointerTime: number;
  lastPointerX: number;
  lastPointerY: number;
  orientation: Quaternion;
  pitchDelta: Quaternion;
  pointerId: number | null;
  recentDragVelocity: Vector2;
  yawDelta: Quaternion;
};

export type CubeInteractionRef = MutableRefObject<CubeInteractionState>;
