// src/lib/interactions/AdvancedInteractions.ts
import * as THREE from "three";
import { ContentWindow3D } from "../ContentWindow3D";

/**
 * AdvancedInteractions
 *
 * Adds subtle flocking / organic motion on top of the layout target positions.
 * It works by:
 *  - Storing a base target position for each window (from the layout)
 *  - Applying small forces (separation / cohesion / noise)
 *  - Offsetting the window.targetObject.position around that base
 *
 * If you want it completely disabled, just never call initialize() or update().
 */
export class AdvancedInteractions {
  windows: ContentWindow3D[] = [];

  // Base layout positions (where the layout system wants each window to be)
  baseTargets: THREE.Vector3[] = [];

  // Per-window velocity used for the extra motion
  velocities: THREE.Vector3[] = [];

  enabled = true;

  // Tunable behavior params
  separationDistance = 1.8;
  separationStrength = 0.3;

  cohesionStrength = 0.08;
  alignmentStrength = 0.04;

  noiseStrength = 0.15;

  maxOffset = 1.2; // how far from the base target a window is allowed to drift

  constructor(windows?: ContentWindow3D[]) {
    if (windows) {
      this.initialize(windows);
    }
  }

  /**
   * Initialize with the current set of windows.
   * Should be called whenever the layout changes significantly.
   */
  initialize(windows: ContentWindow3D[]) {
    this.windows = windows;

    this.baseTargets = windows.map((w) =>
      w.targetObject.position.clone()
    );

    this.velocities = windows.map(
      () =>
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05
        )
    );
  }

  setEnabled(enabled: boolean) {
    this.enabled = !!enabled;
  }

  /**
   * Call this every frame *after* your layout / targetObject animations
   * but before `window.update(deltaTime)`.
   */
  update(deltaTime: number) {
    if (!this.enabled || this.windows.length === 0) return;

    const tmpSeparation = new THREE.Vector3();
    const tmpCohesion = new THREE.Vector3();
    const tmpAlignment = new THREE.Vector3();

    const currentPositions = this.windows.map((w) =>
      w.targetObject.position.clone()
    );

    for (let i = 0; i < this.windows.length; i++) {
      const pos = currentPositions[i];
      const base = this.baseTargets[i];
      const vel = this.velocities[i];

      tmpSeparation.set(0, 0, 0);
      tmpCohesion.set(0, 0, 0);
      tmpAlignment.set(0, 0, 0);

      let neighborCount = 0;

      // --- Neighborhood forces (simple boids-like behavior) ---
      for (let j = 0; j < this.windows.length; j++) {
        if (i === j) continue;

        const otherPos = currentPositions[j];
        const distance = pos.distanceTo(otherPos);

        if (distance < this.separationDistance && distance > 0.0001) {
          // Separation: steer away from neighbors that are too close
          const away = new THREE.Vector3()
            .subVectors(pos, otherPos)
            .normalize()
            .multiplyScalar((this.separationDistance - distance) / this.separationDistance);

          tmpSeparation.add(away);

          // Cohesion: steer toward average neighbor position
          tmpCohesion.add(otherPos);

          // Alignment: steer velocity toward neighbor velocities
          tmpAlignment.add(this.velocities[j]);

          neighborCount++;
        }
      }

      if (neighborCount > 0) {
        tmpCohesion.multiplyScalar(1 / neighborCount).sub(pos); // average - current
        tmpAlignment.multiplyScalar(1 / neighborCount);
      }

      // Apply forces to velocity
      vel.addScaledVector(tmpSeparation, this.separationStrength * deltaTime);
      vel.addScaledVector(tmpCohesion, this.cohesionStrength * deltaTime);
      vel.addScaledVector(tmpAlignment, this.alignmentStrength * deltaTime);

      // --- Gentle noise to keep motion alive ---
      vel.x += (Math.random() - 0.5) * this.noiseStrength * deltaTime;
      vel.y += (Math.random() - 0.5) * this.noiseStrength * deltaTime;
      vel.z += (Math.random() - 0.5) * this.noiseStrength * deltaTime;

      // Damping
      vel.multiplyScalar(0.92);

      // Propose new position by offsetting around the base layout position
      const offsetPos = pos.clone().addScaledVector(vel, deltaTime);
      const offsetFromBase = new THREE.Vector3().subVectors(offsetPos, base);

      // Clamp to max offset from base
      if (offsetFromBase.length() > this.maxOffset) {
        offsetFromBase.setLength(this.maxOffset);
        offsetPos.copy(base).add(offsetFromBase);
      }

      // Apply back to the window's targetObject
      this.windows[i].targetObject.position.copy(offsetPos);
    }
  }
}