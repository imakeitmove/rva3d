// lib/ContentWindow3D.ts
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import type { RigidBody, World } from '@dimforge/rapier3d-compat';
import type { NotionPortfolioItem } from '@/types/portfolio';

export type ContentWindowState = 'idle' | 'transitioning' | 'active';
export type GeometryShape = 'cube' | 'pie-slice' | 'card' | 'sphere-segment' | 'wave-segment';
export type DisplayMode = 'thumbnail' | 'fullscreen';

let fontCache: any = null;

export class ContentWindow3D {
  id: string;
  notionData: NotionPortfolioItem;
  
  // Hierarchy structure
  targetObject: THREE.Object3D;  // Invisible - animated by GSAP
  group: THREE.Group;             // Root visible container
  cubeGroup: THREE.Group;         // The cube itself
  contentGroup: THREE.Group;      // Title, excerpt, images (children of cube)
  
  // Geometry
  cubeMesh: THREE.Mesh | null = null;
  currentShape: GeometryShape = 'cube';
  baseSize: number = 2; // Base dimension for the cube
  
  // Content elements
  thumbnailPlane?: THREE.Mesh;
  coverPlane?: THREE.Mesh;
  videoPlane?: THREE.Mesh;
  videoElement?: HTMLVideoElement;
  titleMesh?: THREE.Mesh;
  excerptPlane?: THREE.Mesh;
  excerptCanvas?: HTMLCanvasElement;
  
  // Textures
  thumbnailTexture?: THREE.Texture;
  fullResTexture?: THREE.Texture;
  videoTexture?: THREE.VideoTexture;
  
  // Display state
  displayMode: DisplayMode = 'thumbnail';
  
  // Physics
  velocity: THREE.Vector3 = new THREE.Vector3();
  angularVelocity: THREE.Euler = new THREE.Euler();
  springStrength: number = 0.05;
  dampingFactor: number = 0.85;
  rotationSpringStrength: number = 0.03;
  
  // Interaction
  isHovered: boolean = false;
  isDragged: boolean = false;
  isSelected: boolean = false;
  state: ContentWindowState = 'idle';
  
  // Visual effects
  glowIntensity: number = 0;
  hoverScale: number = 1.0;
  
  // Loading state
  thumbnailLoaded: boolean = false;
  fullContentLoaded: boolean = false;
  
  constructor(
    notionData: NotionPortfolioItem,
    position: THREE.Vector3 = new THREE.Vector3(),
    world?: World
  ) {
    this.id = notionData.id;
    this.notionData = notionData;
    
    // Create invisible target
    this.targetObject = new THREE.Object3D();
    this.targetObject.position.copy(position);
    
    // Create visible hierarchy
    this.group = new THREE.Group();
    this.group.position.copy(position);
    
    this.cubeGroup = new THREE.Group();
    this.group.add(this.cubeGroup);
    
    this.contentGroup = new THREE.Group();
    this.cubeGroup.add(this.contentGroup);
    
    // Create the cube
    this.createCube();
    
    // Start loading thumbnail
    this.loadThumbnail();
  }
  
private createCube() {
  const geometry = new THREE.BoxGeometry(
    this.baseSize,
    this.baseSize,
    this.baseSize
  );
  const material = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0.4,
    roughness: 0.6,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { contentWindow: this };
  mesh.position.x = 1;

  this.cubeMesh = mesh;
  this.cubeGroup.add(mesh);
}


  
  private async loadThumbnail() {
    const thumbnailUrl = this.notionData.thumbnail || this.notionData.coverImage;
    if (!thumbnailUrl) {
      console.warn(`No thumbnail for ${this.notionData.title}`);
      return;
    }
    
    try {
      const loader = new THREE.TextureLoader();
      this.thumbnailTexture = await loader.loadAsync(thumbnailUrl);
      this.thumbnailTexture.colorSpace = THREE.SRGBColorSpace;
      
      // Create image plane floating off front of cube
      this.createThumbnailPlane();
      
      this.thumbnailLoaded = true;
      console.log(`✅ Thumbnail loaded for: ${this.notionData.title}`);
    } catch (error) {
      console.warn(`Failed to load thumbnail for ${this.id}:`, error);
    }
  }
  
  private createThumbnailPlane() {
    if (!this.thumbnailTexture) return;
    
    // Image width is 94% of cube width (3% border on each side)
    const imageWidth = this.baseSize * 0.94;
    const imageHeight = imageWidth * (9/16); // Assuming 16:9 aspect
    
    const geometry = new THREE.PlaneGeometry(imageWidth, imageHeight);
    const material = new THREE.MeshStandardMaterial({
      map: this.thumbnailTexture,
      transparent: true,
    });
    
    this.thumbnailPlane = new THREE.Mesh(geometry, material);
    this.thumbnailPlane.position.z = this.baseSize / 2 + 0.02; // Float off front face
    this.contentGroup.add(this.thumbnailPlane);
  }
  
  async loadFullContent() {
    if (this.fullContentLoaded) return;
    
    console.log(`📦 Loading full content for: ${this.notionData.title}`);
    
    // Load cover image if different from thumbnail
    const coverUrl = this.notionData.coverImage;
    if (coverUrl && coverUrl !== this.notionData.thumbnail) {
      try {
        const loader = new THREE.TextureLoader();
        this.fullResTexture = await loader.loadAsync(coverUrl);
        this.fullResTexture.colorSpace = THREE.SRGBColorSpace;
        
        this.createCoverPlane();
      } catch (error) {
        console.warn(`Failed to load cover for ${this.id}:`, error);
      }
    }
    
    // Load title text
    await this.createTitleText();
    
    // Create excerpt panel
    this.createExcerptPanel();
    
    // TODO: Load video if present
    // this.loadVideo();
    
    this.fullContentLoaded = true;
    console.log(`✅ Full content loaded for: ${this.notionData.title}`);
  }
  
  private createCoverPlane() {
    if (!this.fullResTexture) return;
    
    const imageWidth = this.baseSize * 0.94;
    const imageHeight = imageWidth * (9/16);
    
    const geometry = new THREE.PlaneGeometry(imageWidth, imageHeight);
    const material = new THREE.MeshStandardMaterial({
      map: this.fullResTexture,
      transparent: true,
    });
    
    this.coverPlane = new THREE.Mesh(geometry, material);
    this.coverPlane.position.z = this.baseSize / 2 + 0.02;
    this.coverPlane.visible = false; // Only show in fullscreen
    this.contentGroup.add(this.coverPlane);
  }
  
  private async createTitleText() {
    // Load font if not cached
    if (!fontCache) {
      const loader = new FontLoader();
      try {
        fontCache = await loader.loadAsync('/fonts/helvetiker_bold.typeface.json');
      } catch (error) {
        console.warn('Failed to load font, using fallback:', error);
        return;
      }
    }
    
    // Create extruded 3D text
    const textGeometry = new TextGeometry(this.notionData.title, {
      font: fontCache,
      size: 0.15,
      depth: 0.05,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 3
    });
    
    // Center the text
    textGeometry.computeBoundingBox();
    const textWidth = textGeometry.boundingBox!.max.x - textGeometry.boundingBox!.min.x;
    
    // Scale to fit window width
    const targetWidth = this.baseSize;
    const scale = Math.min(1, targetWidth / textWidth);
    
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.5,
      roughness: 0.4,
      emissive: 0x4488ff,
      emissiveIntensity: 0.2
    });
    
    this.titleMesh = new THREE.Mesh(textGeometry, material);
    this.titleMesh.scale.setScalar(scale);
    
    // Center horizontally
    textGeometry.computeBoundingBox();
    const centeredX = -(textGeometry.boundingBox!.max.x - textGeometry.boundingBox!.min.x) * scale / 2;
    
    // Position above the cube
    this.titleMesh.position.set(centeredX, this.baseSize / 2 + 0.4, 0);
    this.titleMesh.visible = false; // Only show in fullscreen
    this.contentGroup.add(this.titleMesh);
  }
  
  private createExcerptPanel() {
    if (!this.notionData.excerpt) return;
    
    // Create rounded rectangle background (90% of window width)
    const panelWidth = this.baseSize * 0.9;
    const panelHeight = this.baseSize * 0.6;
    const borderRadius = 0.1;
    
    // Create rounded rectangle shape
    const shape = new THREE.Shape();
    const panelX = -panelWidth / 2;
    const panelY = -panelHeight / 2;
    
    shape.moveTo(panelX + borderRadius, panelY);
    shape.lineTo(panelX + panelWidth - borderRadius, panelY);
    shape.quadraticCurveTo(panelX + panelWidth, panelY, panelX + panelWidth, panelY + borderRadius);
    shape.lineTo(panelX + panelWidth, panelY + panelHeight - borderRadius);
    shape.quadraticCurveTo(panelX + panelWidth, panelY + panelHeight, panelX + panelWidth - borderRadius, panelY + panelHeight);
    shape.lineTo(panelX + borderRadius, panelY + panelHeight);
    shape.quadraticCurveTo(panelX, panelY + panelHeight, panelX, panelY + panelHeight - borderRadius);
    shape.lineTo(panelX, panelY + borderRadius);
    shape.quadraticCurveTo(panelX, panelY, panelX + borderRadius, panelY);
    
    const geometry = new THREE.ShapeGeometry(shape);
    
    // Create canvas for text rendering
    this.excerptCanvas = document.createElement('canvas');
    const ctx = this.excerptCanvas.getContext('2d')!;
    this.excerptCanvas.width = 512;
    this.excerptCanvas.height = 384;
    
    // Draw background
    ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
    ctx.fillRect(0, 0, this.excerptCanvas.width, this.excerptCanvas.height);
    
    // Draw text with padding
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial, sans-serif';
    
    const padding = 40; // Good inner padding
    const maxWidth = this.excerptCanvas.width - padding * 2;
    const lineHeight = 32;
    
    // Word wrap
    const words = this.notionData.excerpt.split(' ');
    let line = '';
    let y = padding + lineHeight;
    
    words.forEach(word => {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, padding, y);
        line = word + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    });
    ctx.fillText(line, padding, y);
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(this.excerptCanvas);
    texture.needsUpdate = true;
    
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.95
    });
    
    this.excerptPlane = new THREE.Mesh(geometry, material);
    this.excerptPlane.position.set(0, -this.baseSize / 2 - panelHeight / 2 - 0.2, 0);
    this.excerptPlane.visible = false; // Only show in fullscreen
    this.contentGroup.add(this.excerptPlane);
  }
  
  setDisplayMode(mode: DisplayMode) {
    this.displayMode = mode;
    
    if (mode === 'fullscreen') {
      // Show all content elements
      if (this.coverPlane) this.coverPlane.visible = true;
      if (this.thumbnailPlane) this.thumbnailPlane.visible = false; // Hide thumbnail, show cover
      if (this.titleMesh) this.titleMesh.visible = true;
      if (this.excerptPlane) this.excerptPlane.visible = true;
      
      // Load full content if not loaded
      if (!this.fullContentLoaded) {
        this.loadFullContent();
      }
    } else {
      // Thumbnail mode - only show thumbnail
      if (this.thumbnailPlane) this.thumbnailPlane.visible = true;
      if (this.coverPlane) this.coverPlane.visible = false;
      if (this.titleMesh) this.titleMesh.visible = false;
      if (this.excerptPlane) this.excerptPlane.visible = false;
    }
  }
  
  setTarget(
    position: THREE.Vector3,
    rotation: THREE.Euler = new THREE.Euler(),
    scale: THREE.Vector3 = new THREE.Vector3(1, 1, 1)
  ) {
    this.targetObject.position.copy(position);
    this.targetObject.rotation.copy(rotation);
    this.targetObject.scale.copy(scale);
  }
  
  update(deltaTime: number) {
    // Spring physics: visible group follows invisible target
    if (!this.isDragged) {
      // Position spring
      const positionDelta = new THREE.Vector3()
        .subVectors(this.targetObject.position, this.group.position)
        .multiplyScalar(this.springStrength);
      
      this.velocity.add(positionDelta);
      this.velocity.multiplyScalar(this.dampingFactor);
      this.group.position.add(this.velocity);
      
      // Rotation spring
      const rotationDelta = new THREE.Euler(
        (this.targetObject.rotation.x - this.group.rotation.x) * this.rotationSpringStrength,
        (this.targetObject.rotation.y - this.group.rotation.y) * this.rotationSpringStrength,
        (this.targetObject.rotation.z - this.group.rotation.z) * this.rotationSpringStrength
      );
      
      this.angularVelocity.x += rotationDelta.x;
      this.angularVelocity.y += rotationDelta.y;
      this.angularVelocity.z += rotationDelta.z;
      
      this.angularVelocity.x *= this.dampingFactor;
      this.angularVelocity.y *= this.dampingFactor;
      this.angularVelocity.z *= this.dampingFactor;
      
      this.group.rotation.x += this.angularVelocity.x;
      this.group.rotation.y += this.angularVelocity.y;
      this.group.rotation.z += this.angularVelocity.z;
      
      // Scale spring
      const scaleDelta = new THREE.Vector3()
        .subVectors(this.targetObject.scale, this.group.scale)
        .multiplyScalar(this.springStrength * 2);
      
      this.group.scale.add(scaleDelta);
    }
    
    // Idle rotation
    if (this.state === 'idle') {
      this.cubeGroup.rotation.x += 0.002;
      this.cubeGroup.rotation.y += 0.003;
    }
    
    // Hover effects
    if (this.isHovered) {
      this.glowIntensity = Math.min(this.glowIntensity + deltaTime * 3, 1);
      this.hoverScale = Math.min(this.hoverScale + deltaTime * 2, 1.05);
    } else {
      this.glowIntensity = Math.max(this.glowIntensity - deltaTime * 4, 0);
      this.hoverScale = Math.max(this.hoverScale - deltaTime * 3, 1.0);
    }
    
    this.cubeGroup.scale.setScalar(this.hoverScale);
    
    // Update cube material glow
    const cubeMaterial = this.cubeMesh.material as THREE.MeshStandardMaterial;
    if (this.isHovered || this.isSelected) {
      cubeMaterial.emissive.setHex(0x4488ff);
      cubeMaterial.emissiveIntensity = this.glowIntensity * 0.3;
    } else {
      cubeMaterial.emissiveIntensity = 0;
    }
  }
  
  async morphToShape(shape: GeometryShape, duration: number = 1.0) {
    if (this.currentShape === shape) return;
    
    console.log(`🔄 Morphing ${this.notionData.title} to ${shape}`);
    
    const targetGeometry = this.createGeometryForShape(shape);
    this.cubeMesh.geometry.dispose();
    this.cubeMesh.geometry = targetGeometry;
    
    this.currentShape = shape;
  }
  
  private createGeometryForShape(shape: GeometryShape): THREE.BufferGeometry {
    switch (shape) {
      case 'cube':
        return new THREE.BoxGeometry(this.baseSize, this.baseSize, this.baseSize);
      case 'pie-slice':
        return this.createPieSliceGeometry();
      case 'card':
        return new THREE.BoxGeometry(this.baseSize * 1.5, this.baseSize * 0.1, this.baseSize);
      default:
        return new THREE.BoxGeometry(this.baseSize, this.baseSize, this.baseSize);
    }
  }
  
  private createPieSliceGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.CylinderGeometry(0.1, this.baseSize, this.baseSize * 2, 8, 1, false, 0, Math.PI / 6);
    geometry.rotateZ(Math.PI / 2);
    return geometry;
  }
  
  setState(state: ContentWindowState) {
    this.state = state;
    
    if (state === 'active' && !this.fullContentLoaded) {
      this.loadFullContent();
    }
  }
  
  onHoverStart() {
    this.isHovered = true;
  }
  
  onHoverEnd() {
    this.isHovered = false;
  }
  
  onDragStart() {
    this.isDragged = true;
    this.velocity.set(0, 0, 0);
  }
  
  onDragMove(worldPosition: THREE.Vector3) {
    if (this.isDragged) {
      this.group.position.copy(worldPosition);
    }
  }
  
  onDragEnd(throwVelocity: THREE.Vector3) {
    this.isDragged = false;
    this.velocity.copy(throwVelocity);
  }
  
  onClick() {
    this.isSelected = !this.isSelected;
    
    window.dispatchEvent(new CustomEvent('contentWindowClick', {
      detail: { window: this, notionData: this.notionData }
    }));
  }
  
  addToScene(scene: THREE.Scene) {
    scene.add(this.group);
  }
  
  removeFromScene(scene: THREE.Scene) {
    scene.remove(this.group);
  }
  
  dispose() {
    this.cubeMesh.geometry.dispose();
    (this.cubeMesh.material as THREE.Material).dispose();
    
    if (this.thumbnailTexture) this.thumbnailTexture.dispose();
    if (this.fullResTexture) this.fullResTexture.dispose();
    if (this.videoTexture) this.videoTexture.dispose();
    
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.remove();
    }
    
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}