// lib/PortfolioScene.ts
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { ContentWindow3D } from './ContentWindow3D';
import { LayoutFactory } from './layouts/calculators';
import type {
  NotionPortfolioItem,
  ViewMode,
  LayoutConfig,
} from '@/types/portfolio';

export type SceneState = 'idle' | 'transitioning' | 'active';

type MouseState = {
  position: THREE.Vector2;
  worldPosition: THREE.Vector3;
  velocity: THREE.Vector2;
  isDown: boolean;
};

type SceneInteractionState = {
  mouse: MouseState;
  raycaster: THREE.Raycaster;
  hoveredWindow?: ContentWindow3D;
  draggedWindow?: ContentWindow3D;
};

export class PortfolioScene {
  // Three.js core
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  
  // Content
  windows: ContentWindow3D[] = [];
  layoutFactory: LayoutFactory;
  currentLayout?: LayoutConfig;
  currentMode: ViewMode = 'grid';
  
  // Scene state
  sceneState: SceneState = 'idle';
  
  // Central logo (placeholder for now)
  logoGroup: THREE.Group;
  
  // Interaction
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  interactionState: SceneInteractionState;
  
  // Animation
  clock: THREE.Clock;
  isTransitioning: boolean = false;
  idleTime: number = 0;
  idleTimeout: number = 10000; // 10 seconds
  
  // Orbit animation
  orbitRadius: number = 8;
  orbitSpeed: number = 0.3;
  orbitAngleOffset: number = 0;
  
  constructor(canvas: HTMLCanvasElement) {
    // Setup scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);
    this.scene.fog = new THREE.Fog(0x0a0a0a, 30, 60);
    
    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 25);
    
    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Setup controls
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 50;
    
    // Setup lighting
    this.setupLighting();
    
    // Create central logo placeholder
    this.logoGroup = this.createLogoPlaceholder();
    this.scene.add(this.logoGroup);
    
    // Setup interaction
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.interactionState = {
      mouse: {
        position: new THREE.Vector2(),
        worldPosition: new THREE.Vector3(),
        velocity: new THREE.Vector2(),
        isDown: false
      },
      raycaster: this.raycaster
    };
    
    // Setup layout system
    this.layoutFactory = new LayoutFactory();
    
    // Setup clock
    this.clock = new THREE.Clock();
    
    // Event listeners
    this.setupEventListeners(canvas);
  }
  
  private setupLighting() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);
    
    // Key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
    keyLight.position.set(8, 10, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.left = -20;
    keyLight.shadow.camera.right = 20;
    keyLight.shadow.camera.top = 20;
    keyLight.shadow.camera.bottom = -20;
    this.scene.add(keyLight);
    
    // Fill light
    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.4);
    fillLight.position.set(-5, 0, -5);
    this.scene.add(fillLight);
    
    // Rim light
    const rimLight = new THREE.DirectionalLight(0xff8844, 0.3);
    rimLight.position.set(0, -5, -5);
    this.scene.add(rimLight);
  }
  
  private createLogoPlaceholder(): THREE.Group {
    const group = new THREE.Group();
    
    // Placeholder sphere (replace with GLTF logo later)
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0x4488ff,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0x2244aa,
      emissiveIntensity: 0.5
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.castShadow = true;
    group.add(sphere);
    
    // Rings around logo
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(1.5 + i * 0.5, 0.05, 16, 100);
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0x4488ff,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x2244aa,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.6 - i * 0.15
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2 + i * 0.3;
      ring.rotation.z = i * 0.5;
      group.add(ring);
    }
    
    return group;
  }
  
  private setupEventListeners(canvas: HTMLCanvasElement) {
    // Mouse move
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      this.interactionState.mouse.position.copy(this.mouse);
      this.idleTime = 0; // Reset idle timer
    });
    
    // Mouse down
    canvas.addEventListener('mousedown', () => {
      this.interactionState.mouse.isDown = true;
      this.handleMouseDown();
    });
    
    // Mouse up
    canvas.addEventListener('mouseup', () => {
      this.interactionState.mouse.isDown = false;
      this.handleMouseUp();
    });
    
    // Click
    canvas.addEventListener('click', () => {
      this.handleClick();
      
      // Transition from idle to active on first click
      if (this.sceneState === 'idle') {
        this.transitionToActive();
      }
    });
    
    // Resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  
  async loadPortfolio(items: NotionPortfolioItem[]) {
    console.log(`📦 Loading ${items.length} portfolio items...`);
    
    // Clear existing windows
    this.windows.forEach(w => w.dispose());
    this.windows = [];
    
    // Create windows in orbit around logo
    const angleStep = (Math.PI * 2) / items.length;
    
    items.forEach((item, i) => {
      const angle = i * angleStep;
      const x = Math.cos(angle) * this.orbitRadius;
      const z = Math.sin(angle) * this.orbitRadius;
      const y = (Math.random() - 0.5) * 2; // Slight vertical variation
      
      const window = new ContentWindow3D(
        item,
        new THREE.Vector3(x, y, z)
      );
      
      // Set initial state to idle
      window.setState('idle');
      
      // Set spring parameters for idle state (looser)
      window.springStrength = 0.02;
      window.dampingFactor = 0.92;
      
      window.addToScene(this.scene);
      this.windows.push(window);
    });
    
    console.log(`✅ Loaded ${this.windows.length} windows in idle orbit state`);
    
    // Start in idle state
    this.sceneState = 'idle';
  }
  
  /**
   * Transition from idle orbit to active grid layout
   */
  async transitionToActive() {
    if (this.sceneState !== 'idle') return;
    
    console.log('🚀 Transitioning from idle to active...');
    this.sceneState = 'transitioning';
    
    // Update all windows to active state
    this.windows.forEach(w => {
      w.setState('active');
      // Tighten spring parameters for active state
      w.springStrength = 0.05;
      w.dampingFactor = 0.85;
    });
    
    // Transition to grid layout
    await this.transitionToLayout('grid', {}, 2.0);
    
    this.sceneState = 'active';
    console.log('✅ Transition complete - scene is now active');
  }
  
  async transitionToLayout(
    mode: ViewMode,
    params: any = {},
    duration: number = 1.5
  ) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    console.log(`🔄 Transitioning to ${mode} layout...`);
    
    const newLayout = this.layoutFactory.calculate(
      mode,
      this.windows.length,
      params
    );
    
    // Animate camera
    gsap.to(this.camera.position, {
      x: newLayout.camera.position.x,
      y: newLayout.camera.position.y,
      z: newLayout.camera.position.z,
      duration,
      ease: 'power2.inOut'
    });
    
    gsap.to(this.controls.target, {
      x: newLayout.camera.target.x,
      y: newLayout.camera.target.y,
      z: newLayout.camera.target.z,
      duration,
      ease: 'power2.inOut'
    });
    
    // Animate window targets with stagger
    this.windows.forEach((window, i) => {
      const transform = newLayout.transforms[i];
      
      // Animate the invisible target object
      gsap.to(window.targetObject.position, {
        x: transform.position.x,
        y: transform.position.y,
        z: transform.position.z,
        duration: duration,
        delay: i * 0.03, // Stagger
        ease: 'power2.out'
      });
      
      gsap.to(window.targetObject.rotation, {
        x: transform.rotation.x,
        y: transform.rotation.y,
        z: transform.rotation.z,
        duration: duration,
        delay: i * 0.03,
        ease: 'power2.out'
      });
      
      gsap.to(window.targetObject.scale, {
        x: transform.scale.x,
        y: transform.scale.y,
        z: transform.scale.z,
        duration: duration,
        delay: i * 0.03,
        ease: 'power2.out'
      });
      
      // Morph geometry based on layout
      const shapeMap: { [key in ViewMode]?: any } = {
        'grid': 'cube',
        'carousel': 'pie-slice',
        'sphere': 'sphere-segment',
        'wave': 'wave-segment',
        'timeline': 'card'
      };
      
      const targetShape = shapeMap[mode] || 'cube';
      if (targetShape !== window.currentShape) {
        setTimeout(() => {
          window.morphToShape(targetShape, duration);
        }, i * 30);
      }
    });
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, duration * 1000 + 100));
    
    this.currentLayout = newLayout;
    this.currentMode = mode;
    this.isTransitioning = false;
    
    console.log(`✅ Transitioned to ${mode}`);
  }
  
  /**
   * Update orbit positions for idle state
   */
  private updateIdleOrbit(deltaTime: number) {
    if (this.sceneState !== 'idle') return;
    
    this.orbitAngleOffset += this.orbitSpeed * deltaTime;
    
    const angleStep = (Math.PI * 2) / this.windows.length;
    
    this.windows.forEach((window, i) => {
      const angle = i * angleStep + this.orbitAngleOffset;
      const x = Math.cos(angle) * this.orbitRadius;
      const z = Math.sin(angle) * this.orbitRadius;
      const y = Math.sin(angle * 2) * 0.5; // Gentle wave motion
      
      // Update target position (spring physics will follow)
      window.targetObject.position.set(x, y, z);
      
      // Face toward logo
      const lookAtVector = new THREE.Vector3(0, 0, 0);
      const direction = lookAtVector.sub(window.targetObject.position).normalize();
      const rotationY = Math.atan2(direction.x, direction.z);
      window.targetObject.rotation.y = rotationY;
    });
    
    // Rotate logo
    this.logoGroup.rotation.y += deltaTime * 0.3;
    this.logoGroup.children.forEach((child, i) => {
      if (i > 0) { // Skip the sphere, just rotate rings
        child.rotation.x += deltaTime * (0.2 + i * 0.1);
        child.rotation.z += deltaTime * (0.15 + i * 0.05);
      }
    });
  }
  
  private handleMouseDown() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.windows.map(w => w.mesh)
    );
    
    if (intersects.length > 0) {
      const window = intersects[0].object.userData.contentWindow as ContentWindow3D;
      if (window) {
        window.onDragStart();
        this.interactionState.draggedWindow = window;
      }
    }
  }
  
  private handleMouseUp() {
    if (this.interactionState.draggedWindow) {
      this.interactionState.draggedWindow.onDragEnd(
        this.interactionState.draggedWindow.velocity
      );
      this.interactionState.draggedWindow = undefined;
    }
  }
  
  private handleClick() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.windows.map(w => w.mesh)
    );
    
    if (intersects.length > 0) {
      const window = intersects[0].object.userData.contentWindow as ContentWindow3D;
      if (window) {
        window.onClick();
      }
    }
  }
  
  update() {
    const deltaTime = this.clock.getDelta();
    
    // Update controls
    this.controls.update();
    
    // Update idle orbit animation
    if (this.sceneState === 'idle') {
      this.updateIdleOrbit(deltaTime);
    }
    
    // Update raycaster for hover effects (only in active state)
    if (this.sceneState === 'active') {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(
        this.windows.map(w => w.mesh)
      );
      
      // Clear previous hovers
      this.windows.forEach(w => {
        if (w.isHovered && !intersects.find(i => i.object === w.mesh)) {
          w.onHoverEnd();
        }
      });
      
      // Set new hover
      if (intersects.length > 0 && !this.interactionState.draggedWindow) {
        const window = intersects[0].object.userData.contentWindow as ContentWindow3D;
        if (window && !window.isHovered) {
          window.onHoverStart();
        }
        this.interactionState.hoveredWindow = window;
      } else {
        this.interactionState.hoveredWindow = undefined;
      }
    }
    
    // Update windows
    this.windows.forEach(w => w.update(deltaTime));
  }
  
  render() {
    this.renderer.render(this.scene, this.camera);
  }
  
  dispose() {
    this.windows.forEach(w => w.dispose());
    this.renderer.dispose();
    this.controls.dispose();
  }
}
