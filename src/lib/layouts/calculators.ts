// lib/layouts/calculators.ts
import * as THREE from 'three';
import type { LayoutConfig, LayoutCalculator } from '@/types/portfolio';

export class GridLayout implements LayoutCalculator {
  calculate(itemCount: number, params: any = {}): LayoutConfig {
    const { spacing = 3, aspectRatio = 16/9 } = params;
    
    // Calculate optimal grid dimensions
    const cols = Math.ceil(Math.sqrt(itemCount * aspectRatio));
    const rows = Math.ceil(itemCount / cols);
    
    const transforms = [];
    const totalWidth = (cols - 1) * spacing;
    const totalHeight = (rows - 1) * spacing;
    
    for (let i = 0; i < itemCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      const x = col * spacing - totalWidth / 2;
      const y = -(row * spacing - totalHeight / 2);
      const z = 0;
      
      transforms.push({
        position: new THREE.Vector3(x, y, z),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1)
      });
    }
    
    return {
      mode: 'grid',
      itemCount,
      transforms,
      camera: {
        position: new THREE.Vector3(0, 0, Math.max(totalWidth, totalHeight) * 0.8),
        target: new THREE.Vector3(0, 0, 0),
        fov: 50
      },
      params: { spacing, columns: cols, rows },
      interactionMode: 'hover',
      physicsEnabled: true
    };
  }
}

export class SpiralLayout implements LayoutCalculator {
  calculate(itemCount: number, params: any = {}): LayoutConfig {
    const { 
      radiusStart = 2, 
      radiusGrowth = 0.5, 
      heightGrowth = 0.3,
      rotations = 3 
    } = params;
    
    const transforms = [];
    const angleStep = (Math.PI * 2 * rotations) / itemCount;
    
    for (let i = 0; i < itemCount; i++) {
      const t = i / (itemCount - 1);
      const angle = i * angleStep;
      const radius = radiusStart + (t * radiusGrowth * itemCount);
      
      const x = Math.cos(angle) * radius;
      const y = t * heightGrowth * itemCount - (heightGrowth * itemCount) / 2;
      const z = Math.sin(angle) * radius;
      
      // Rotate to face center
      const rotY = -angle + Math.PI / 2;
      
      transforms.push({
        position: new THREE.Vector3(x, y, z),
        rotation: new THREE.Euler(0, rotY, 0),
        scale: new THREE.Vector3(1, 1, 1)
      });
    }
    
    return {
      mode: 'spiral',
      itemCount,
      transforms,
      camera: {
        position: new THREE.Vector3(
          radiusStart * 3,
          heightGrowth * itemCount * 0.3,
          radiusStart * 3
        ),
        target: new THREE.Vector3(0, 0, 0),
        fov: 60
      },
      params: { radiusStart, radiusGrowth, heightGrowth, rotations },
      interactionMode: 'drag',
      physicsEnabled: true
    };
  }
}

export class SphereLayout implements LayoutCalculator {
  calculate(itemCount: number, params: any = {}): LayoutConfig {
    const { radius = 8 } = params;
    
    const transforms = [];
    
    // Fibonacci sphere distribution for even spacing
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = Math.PI * 2 * goldenRatio;
    
    for (let i = 0; i < itemCount; i++) {
      const t = i / (itemCount - 1);
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = angleIncrement * i;
      
      const x = radius * Math.sin(inclination) * Math.cos(azimuth);
      const y = radius * Math.sin(inclination) * Math.sin(azimuth);
      const z = radius * Math.cos(inclination);
      
      // Look at center
      const lookAt = new THREE.Vector3(x, y, z).normalize();
      const rotation = new THREE.Euler().setFromVector3(
        lookAt.multiplyScalar(-1)
      );
      
      transforms.push({
        position: new THREE.Vector3(x, y, z),
        rotation,
        scale: new THREE.Vector3(0.8, 0.8, 0.8)
      });
    }
    
    return {
      mode: 'sphere',
      itemCount,
      transforms,
      camera: {
        position: new THREE.Vector3(0, 0, radius * 2),
        target: new THREE.Vector3(0, 0, 0),
        fov: 50
      },
      params: { radius },
      interactionMode: 'drag',
      physicsEnabled: false // Simpler without physics for sphere
    };
  }
}

export class WaveLayout implements LayoutCalculator {
  calculate(itemCount: number, params: any = {}): LayoutConfig {
    const { 
      spacing = 2.5,
      amplitude = 3,
      frequency = 0.5,
      phase = 0 
    } = params;
    
    const cols = Math.ceil(Math.sqrt(itemCount * 1.5));
    const rows = Math.ceil(itemCount / cols);
    
    const transforms = [];
    const totalWidth = (cols - 1) * spacing;
    
    for (let i = 0; i < itemCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      const x = col * spacing - totalWidth / 2;
      const y = Math.sin((col * frequency) + phase) * amplitude;
      const z = -(row * spacing);
      
      // Slight rotation based on wave
      const rotZ = Math.sin((col * frequency) + phase) * 0.2;
      
      transforms.push({
        position: new THREE.Vector3(x, y, z),
        rotation: new THREE.Euler(0, 0, rotZ),
        scale: new THREE.Vector3(1, 1, 1)
      });
    }
    
    return {
      mode: 'wave',
      itemCount,
      transforms,
      camera: {
        position: new THREE.Vector3(0, amplitude * 2, totalWidth * 0.8),
        target: new THREE.Vector3(0, 0, -(rows * spacing) / 2),
        fov: 50
      },
      params: { spacing, amplitude, frequency, phase },
      interactionMode: 'hover',
      physicsEnabled: true
    };
  }
}

export class ConstellationLayout implements LayoutCalculator {
  calculate(itemCount: number, params: any = {}): LayoutConfig {
    const { 
      spread = 15,
      minDistance = 2,
      seed = 42 
    } = params;
    
    // Seeded random for consistent layouts
    const random = this.seededRandom(seed);
    
    const transforms = [];
    const positions: THREE.Vector3[] = [];
    
    // Generate positions with minimum distance
    for (let i = 0; i < itemCount; i++) {
      let position: THREE.Vector3;
      let attempts = 0;
      
      do {
        position = new THREE.Vector3(
          (random() - 0.5) * spread,
          (random() - 0.5) * spread,
          (random() - 0.5) * spread * 0.5
        );
        attempts++;
      } while (
        attempts < 50 &&
        positions.some(p => p.distanceTo(position) < minDistance)
      );
      
      positions.push(position);
      
      // Random slight rotation
      const rotation = new THREE.Euler(
        (random() - 0.5) * 0.3,
        (random() - 0.5) * 0.3,
        (random() - 0.5) * 0.2
      );
      
      transforms.push({
        position,
        rotation,
        scale: new THREE.Vector3(1, 1, 1)
      });
    }
    
    return {
      mode: 'constellation',
      itemCount,
      transforms,
      camera: {
        position: new THREE.Vector3(spread * 0.8, spread * 0.3, spread * 1.2),
        target: new THREE.Vector3(0, 0, 0),
        fov: 50
      },
      // Expose generated positions for consumers that need the full constellation layout
      params: { spread, minDistance, seed, positions },
      interactionMode: 'drag',
      physicsEnabled: true
    };
  }
  
  private seededRandom(seed: number) {
    let value = seed;
    return () => {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }
}

export class CarouselLayout implements LayoutCalculator {
  calculate(itemCount: number, params: any = {}): LayoutConfig {
    const { 
      radius = 12,
      tilt = 0.2,
      currentIndex = 0 
    } = params;
    
    const transforms = [];
    const angleStep = (Math.PI * 2) / itemCount;
    
    for (let i = 0; i < itemCount; i++) {
      const angle = i * angleStep;
      
      const x = Math.sin(angle) * radius;
      const y = Math.sin(angle) * tilt * 2;
      const z = Math.cos(angle) * radius;
      
      // Face center
      const rotY = -angle + Math.PI;
      
      // Scale based on distance from current
      const distanceFromCurrent = Math.min(
        Math.abs(i - currentIndex),
        itemCount - Math.abs(i - currentIndex)
      );
      const scale = 1 - (distanceFromCurrent / itemCount) * 0.3;
      
      transforms.push({
        position: new THREE.Vector3(x, y, z),
        rotation: new THREE.Euler(0, rotY, 0),
        scale: new THREE.Vector3(scale, scale, scale)
      });
    }
    
    return {
      mode: 'carousel',
      itemCount,
      transforms,
      camera: {
        position: new THREE.Vector3(0, 3, radius * 1.8),
        target: new THREE.Vector3(0, 0, 0),
        fov: 50
      },
      params: { radius, tilt, currentIndex },
      interactionMode: 'click',
      physicsEnabled: false
    };
  }
}

export class TimelineLayout implements LayoutCalculator {
  calculate(itemCount: number, params: any = {}): LayoutConfig {
    const { 
      spacing = 4,
      curve = 0.5,
      dates = [] // Array of dates for each item
    } = params;
    
    const transforms = [];
    
    for (let i = 0; i < itemCount; i++) {
      const t = i / (itemCount - 1);
      
      // Curved path
      const x = (i * spacing) - ((itemCount - 1) * spacing) / 2;
      const y = Math.sin(t * Math.PI) * curve;
      const z = -t * 2;
      
      // Alternate sides
      const side = i % 2 === 0 ? 1 : -1;
      const offsetX = side * 1.5;
      
      transforms.push({
        position: new THREE.Vector3(x + offsetX, y, z),
        rotation: new THREE.Euler(0, side * 0.3, 0),
        scale: new THREE.Vector3(0.9, 0.9, 0.9)
      });
    }
    
    return {
      mode: 'timeline',
      itemCount,
      transforms,
      camera: {
        position: new THREE.Vector3(0, curve * 3, itemCount * spacing * 0.4),
        target: new THREE.Vector3(0, 0, -itemCount),
        fov: 60
      },
      params: { spacing, curve, dates },
      interactionMode: 'hover',
      physicsEnabled: true
    };
  }
}

// Layout factory
export class LayoutFactory {
  private calculators: Map<string, LayoutCalculator> = new Map();
  
  constructor() {
    this.register('grid', new GridLayout());
    this.register('spiral', new SpiralLayout());
    this.register('sphere', new SphereLayout());
    this.register('wave', new WaveLayout());
    this.register('constellation', new ConstellationLayout());
    this.register('carousel', new CarouselLayout());
    this.register('timeline', new TimelineLayout());
  }
  
  register(name: string, calculator: LayoutCalculator) {
    this.calculators.set(name, calculator);
  }
  
  calculate(mode: string, itemCount: number, params: any = {}): LayoutConfig {
    const calculator = this.calculators.get(mode);
    if (!calculator) {
      throw new Error(`Layout calculator not found: ${mode}`);
    }
    return calculator.calculate(itemCount, params);
  }
  
  getAvailableLayouts(): string[] {
    return Array.from(this.calculators.keys());
  }
}