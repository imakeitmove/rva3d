// lib/interactions/AdvancedInteractions.ts
import * as THREE from 'three';
import type { ContentWindow3D } from '../ContentWindow3D';
import type { PortfolioScene } from '../PortfolioScene';

/**
 * Adds advanced physics-based interactions to windows
 * Inspired by drag/throw mechanics and magnetic forces
 */
export class PhysicsInteractionController {
  private scene: PortfolioScene;
  private dragPlane: THREE.Plane;
  private dragOffset: THREE.Vector3 = new THREE.Vector3();
  private previousMousePosition: THREE.Vector3 = new THREE.Vector3();
  private throwVelocity: THREE.Vector3 = new THREE.Vector3();
  private dragHistory: THREE.Vector3[] = [];
  
  constructor(scene: PortfolioScene) {
    this.scene = scene;
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  }
  
  /**
   * Apply magnetic attraction between nearby windows
   */
  applyMagneticForces(windows: ContentWindow3D[]) {
    const magneticStrength = 0.001;
    const magneticRange = 4;
    
    for (let i = 0; i < windows.length; i++) {
      for (let j = i + 1; j < windows.length; j++) {
        const windowA = windows[i];
        const windowB = windows[j];
        
        const distance = windowA.group.position.distanceTo(windowB.group.position);
        
        if (distance < magneticRange && distance > 0.1) {
          const force = new THREE.Vector3()
            .subVectors(windowB.group.position, windowA.group.position)
            .normalize()
            .multiplyScalar(magneticStrength / distance);
          
          windowA.velocity.add(force);
          windowB.velocity.sub(force);
        }
      }
    }
  }
  
  /**
   * Apply mouse-based repulsion field
   */
  applyMouseRepulsion(
    windows: ContentWindow3D[], 
    mouseWorldPos: THREE.Vector3,
    isMouseDown: boolean
  ) {
    const repulsionRadius = isMouseDown ? 5 : 3;
    const repulsionStrength = isMouseDown ? 0.1 : 0.05;
    
    windows.forEach(window => {
      if (window.isDragged) return;
      
      const distance = window.group.position.distanceTo(mouseWorldPos);
      
      if (distance < repulsionRadius) {
        const force = new THREE.Vector3()
          .subVectors(window.group.position, mouseWorldPos)
          .normalize()
          .multiplyScalar(repulsionStrength / Math.max(distance, 0.5));
        
        window.velocity.add(force);
      }
    });
  }
  
  /**
   * Smooth drag with momentum tracking
   */
  startDrag(window: ContentWindow3D, intersectionPoint: THREE.Vector3) {
    this.dragOffset.copy(intersectionPoint).sub(window.group.position);
    this.previousMousePosition.copy(intersectionPoint);
    this.dragHistory = [intersectionPoint.clone()];
    
    window.onDragStart();
  }
  
  updateDrag(window: ContentWindow3D, intersectionPoint: THREE.Vector3) {
    // Track recent positions for momentum calculation
    this.dragHistory.push(intersectionPoint.clone());
    if (this.dragHistory.length > 5) {
      this.dragHistory.shift();
    }
    
    // Move window to mouse position minus offset
    const targetPos = intersectionPoint.clone().sub(this.dragOffset);
    window.group.position.copy(targetPos);
    
    this.previousMousePosition.copy(intersectionPoint);
  }
  
  endDrag(window: ContentWindow3D) {
    // Calculate throw velocity from recent movement
    if (this.dragHistory.length >= 2) {
      const recent = this.dragHistory[this.dragHistory.length - 1];
      const older = this.dragHistory[0];
      
      this.throwVelocity
        .subVectors(recent, older)
        .multiplyScalar(0.3); // Velocity multiplier
      
      window.onDragEnd(this.throwVelocity.clone());
    } else {
      window.onDragEnd(new THREE.Vector3());
    }
    
    this.dragHistory = [];
  }
  
  /**
   * Get intersection point on drag plane
   */
  getIntersectionPoint(
    raycaster: THREE.Raycaster,
    targetZ: number = 0
  ): THREE.Vector3 | null {
    this.dragPlane.constant = -targetZ;
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(this.dragPlane, intersection);
    return intersection;
  }
}

/**
 * Swarm/Flocking behavior for idle animation
 * Based on boids algorithm
 */
export class SwarmBehavior {
  private targets: THREE.Vector3[] = [];
  private velocities: THREE.Vector3[] = [];
  
  initialize(windows: ContentWindow3D[]) {
    this.targets = windows.map(w => w.targetPosition.clone());
    this.velocities = windows.map(() => new THREE.Vector3(
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.05
    ));
  }
  
  update(windows: ContentWindow3D[], deltaTime: number) {
    const cohesionStrength = 0.001;
    const separationStrength = 0.02;
    const alignmentStrength = 0.005;
    const centeringStrength = 0.002;
    const neighborRadius = 5;
    
    windows.forEach((window, i) => {
      const pos = window.group.position;
      const vel = this.velocities[i];
      
      // Find neighbors
      const neighbors: number[] = [];
      windows.forEach((other, j) => {
        if (i !== j) {
          const distance = pos.distanceTo(other.group.position);
          if (distance < neighborRadius) {
            neighbors.push(j);
          }
        }
      });
      
      if (neighbors.length > 0) {
        // Cohesion: move toward average position of neighbors
        const cohesion = new THREE.Vector3();
        neighbors.forEach(j => {
          cohesion.add(windows[j].group.position);
        });
        cohesion.divideScalar(neighbors.length).sub(pos).multiplyScalar(cohesionStrength);
        
        // Separation: avoid crowding
        const separation = new THREE.Vector3();
        neighbors.forEach(j => {
          const diff = new THREE.Vector3().subVectors(pos, windows[j].group.position);
          const distance = diff.length();
          if (distance > 0) {
            separation.add(diff.normalize().divideScalar(distance));
          }
        });
        separation.multiplyScalar(separationStrength);
        
        // Alignment: match velocity of neighbors
        const alignment = new THREE.Vector3();
        neighbors.forEach(j => {
          alignment.add(this.velocities[j]);
        });
        alignment.divideScalar(neighbors.length).multiplyScalar(alignmentStrength);
        
        vel.add(cohesion).add(separation).add(alignment);
      }
      
      // Center attraction: pull back toward original target
      const centering = new THREE.Vector3()
        .subVectors(this.targets[i], pos)
        .multiplyScalar(centeringStrength);
      vel.add(centering);
      
      // Limit velocity
      const maxSpeed = 0.1;
      if (vel.length() > maxSpeed) {
        vel.normalize().multiplyScalar(maxSpeed);
      }
      
      // Apply velocity (as additional force to spring system)
      window.velocity.add(vel);
      
      // Damping
      vel.multiplyScalar(0.98);
    });
  }
}

/**
 * Particle trail system for mouse movement
 */
export class MouseTrailEffect {
  private particles: THREE.Points;
  private positions: Float32Array;
  private velocities: Float32Array;
  private lifetimes: Float32Array;
  private particleCount: number;
  private currentIndex: number = 0;
  
  constructor(scene: THREE.Scene, particleCount: number = 100) {
    this.particleCount = particleCount;
    this.positions = new Float32Array(particleCount * 3);
    this.velocities = new Float32Array(particleCount * 3);
    this.lifetimes = new Float32Array(particleCount);
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0x4488ff,
      size: 0.2,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    this.particles = new THREE.Points(geometry, material);
    scene.add(this.particles);
  }
  
  emit(position: THREE.Vector3, velocity: THREE.Vector3) {
    const i = this.currentIndex;
    
    this.positions[i * 3] = position.x;
    this.positions[i * 3 + 1] = position.y;
    this.positions[i * 3 + 2] = position.z;
    
    this.velocities[i * 3] = velocity.x;
    this.velocities[i * 3 + 1] = velocity.y;
    this.velocities[i * 3 + 2] = velocity.z;
    
    this.lifetimes[i] = 1.0;
    
    this.currentIndex = (this.currentIndex + 1) % this.particleCount;
  }
  
  update(deltaTime: number) {
    for (let i = 0; i < this.particleCount; i++) {
      if (this.lifetimes[i] > 0) {
        // Update position
        this.positions[i * 3] += this.velocities[i * 3] * deltaTime;
        this.positions[i * 3 + 1] += this.velocities[i * 3 + 1] * deltaTime;
        this.positions[i * 3 + 2] += this.velocities[i * 3 + 2] * deltaTime;
        
        // Apply gravity
        this.velocities[i * 3 + 1] -= 0.01 * deltaTime;
        
        // Decay lifetime
        this.lifetimes[i] -= deltaTime * 2;
      }
    }
    
    this.particles.geometry.attributes.position.needsUpdate = true;
  }
  
  dispose() {
    this.particles.geometry.dispose();
    (this.particles.material as THREE.Material).dispose();
  }
}

/**
 * Connection lines between nearby windows (constellation effect)
 */
export class ConnectionLines {
  private lines: THREE.LineSegments;
  private positions: Float32Array;
  private maxConnections: number;
  private connectionDistance: number;
  
  constructor(scene: THREE.Scene, maxConnections: number = 50, connectionDistance: number = 5) {
    this.maxConnections = maxConnections;
    this.connectionDistance = connectionDistance;
    this.positions = new Float32Array(maxConnections * 6); // 2 points per line, 3 coords per point
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    
    const material = new THREE.LineBasicMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    });
    
    this.lines = new THREE.LineSegments(geometry, material);
    scene.add(this.lines);
  }
  
  update(windows: ContentWindow3D[]) {
    let lineIndex = 0;
    
    for (let i = 0; i < windows.length && lineIndex < this.maxConnections; i++) {
      for (let j = i + 1; j < windows.length && lineIndex < this.maxConnections; j++) {
        const posA = windows[i].group.position;
        const posB = windows[j].group.position;
        const distance = posA.distanceTo(posB);
        
        if (distance < this.connectionDistance) {
          // Add line
          this.positions[lineIndex * 6] = posA.x;
          this.positions[lineIndex * 6 + 1] = posA.y;
          this.positions[lineIndex * 6 + 2] = posA.z;
          this.positions[lineIndex * 6 + 3] = posB.x;
          this.positions[lineIndex * 6 + 4] = posB.y;
          this.positions[lineIndex * 6 + 5] = posB.z;
          
          lineIndex++;
        }
      }
    }
    
    // Hide unused lines
    for (let i = lineIndex; i < this.maxConnections; i++) {
      this.positions[i * 6] = 0;
      this.positions[i * 6 + 1] = 0;
      this.positions[i * 6 + 2] = 0;
      this.positions[i * 6 + 3] = 0;
      this.positions[i * 6 + 4] = 0;
      this.positions[i * 6 + 5] = 0;
    }
    
    this.lines.geometry.attributes.position.needsUpdate = true;
  }
  
  setVisible(visible: boolean) {
    this.lines.visible = visible;
  }
  
  dispose() {
    this.lines.geometry.dispose();
    (this.lines.material as THREE.Material).dispose();
  }
}