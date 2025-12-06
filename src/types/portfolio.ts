// types/portfolio.ts
import * as THREE from 'three';
import type { RigidBody } from '@dimforge/rapier3d-compat';
import type {
  BlockObjectResponse,
  PartialBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

export interface NotionPortfolioItem {
  id: string;
  title: string;
  slug: string;
  coverImage?: string;
  thumbnail?: string;
  category?: string;
  tags?: string[];
  publishedAt: Date;
  excerpt?: string;
  // Rich Notion page content
  blocks?: Array<BlockObjectResponse | PartialBlockObjectResponse>;
}

export interface ContentWindowState {
  id: string;
  notionData: NotionPortfolioItem;
  
  // Three.js objects
  mesh: THREE.Mesh;
  group: THREE.Group;
  texture?: THREE.Texture;
  
  // Physics
  rigidBody?: RigidBody;
  velocity: THREE.Vector3;
  
  // Transform targets (for spring physics)
  targetPosition: THREE.Vector3;
  targetRotation: THREE.Euler;
  targetScale: THREE.Vector3;
  
  // Current state
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  
  // Interaction state
  isHovered: boolean;
  isDragged: boolean;
  isSelected: boolean;
  
  // Behavior rules
  interactionMode: 'hover' | 'drag' | 'click' | 'none';
  springStrength: number;
  dampingFactor: number;
  
  // Visual effects
  particles?: THREE.Points;
  trail?: THREE.Line;
  glowIntensity: number;
}

export type ViewMode = 
  | 'grid'           // Classic grid layout
  | 'spiral'         // Spiral outward from center
  | 'sphere'         // Distributed on sphere surface
  | 'wave'           // Undulating wave formation
  | 'constellation'  // Random but connected with lines
  | 'carousel'       // Rotating carousel
  | 'stack'          // Card stack (like a deck)
  | 'exploded'       // Scattered with physics
  | 'timeline'       // Linear timeline based on date
  | 'fullscreen';    // Single item fullscreen

export interface LayoutParams {
  spacing?: number;
  radius?: number;
  amplitude?: number;
  columns?: number;
  rows?: number;
  // Some layouts (e.g., constellation) expose their generated positions for reuse/debugging
  positions?: THREE.Vector3[];
  [key: string]:
    | number
    | string
    | boolean
    | Date
    | THREE.Vector3
    | THREE.Vector3[]
    | THREE.Euler
    | THREE.Color
    | (string | Date)[]
    | undefined;
}

export interface LayoutConfig {
  mode: ViewMode;
  itemCount: number;
  
  // Calculated transforms for each item
  transforms: Array<{
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
  }>;
  
  // Camera configuration for this view
  camera: {
    position: THREE.Vector3;
    target: THREE.Vector3;
    fov?: number;
  };
  
  // Layout-specific parameters
  params: LayoutParams;
  
  // Behavior overrides for this layout
  interactionMode?: 'hover' | 'drag' | 'click' | 'none';
  physicsEnabled?: boolean;
}

export interface TransitionConfig {
  duration: number;
  easing: string;
  stagger: number;
  
  // Phases
  phases: {
    // Optional dramatic exit
    exit?: {
      duration: number;
      effect: 'scatter' | 'implode' | 'fade' | 'morph' | 'none';
    };
    
    // Main transition
    move: {
      duration: number;
      usePhysics: boolean;
      overshoot?: number; // For spring animations
    };
    
    // Settle phase
    settle?: {
      duration: number;
      dampingIncrease: number;
    };
  };
}

export interface InteractionState {
  hoveredWindow?: ContentWindowState;
  draggedWindow?: ContentWindowState;
  selectedWindow?: ContentWindowState;
  
  mouse: {
    position: THREE.Vector2;
    worldPosition: THREE.Vector3;
    velocity: THREE.Vector2;
    isDown: boolean;
  };
  
  raycaster: THREE.Raycaster;
}

export interface PortfolioSceneConfig {
  // Notion setup
  notionDatabaseId: string;
  
  // Visual settings
  backgroundColor: THREE.Color;
  ambientColor: THREE.Color;
  
  // Physics settings
  physicsEnabled: boolean;
  gravity: THREE.Vector3;
  
  // Particle system settings
  particlesEnabled: boolean;
  particleCount: number;
  
  // Performance
  enableShadows: boolean;
  enablePostProcessing: boolean;
  targetFPS: number;
  
  // Idle behavior
  idleTimeout: number; // ms before starting idle animation
  idleAnimation: 'swarm' | 'breathe' | 'drift' | 'none';
}

// Layout calculator interface
export interface LayoutCalculator {
  calculate(items: number, params: LayoutParams): LayoutConfig;
}

// Transition orchestrator
export interface TransitionOrchestrator {
  transition(
    windows: ContentWindowState[],
    fromLayout: LayoutConfig,
    toLayout: LayoutConfig,
    config: TransitionConfig
  ): Promise<void>;
}