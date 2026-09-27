import * as THREE from 'three';
import { BrickFactory, BRICK_DEFS, type BrickShape } from './BrickFactory';
import { soundSynth } from './SoundSynth';

export interface PlacedBrick {
  id: string;
  shape: BrickShape;
  colorHex: string;
  gridX: number;
  gridY: number; // Layer (0 = on baseplate)
  gridZ: number;
  rotationY: number; // in radians (0, PI/2, PI, 3PI/2)
  mesh: THREE.Group;
}

export class GridSystem {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private baseplate: THREE.Mesh | null = null;
  private interactableMeshes: THREE.Object3D[] = [];

  // Grid occupation map: "gx,gy,gz" -> PlacedBrick
  private gridOccupancy = new Map<string, PlacedBrick>();
  private placedBricks: PlacedBrick[] = [];

  // Ghost preview state
  private ghostGroup: THREE.Group | null = null;
  private currentShape: BrickShape = '2x2';
  private currentColor: string = '#FAC80A'; // Default Groc
  private currentRotation: number = 0; // 0, PI/2, etc.
  private currentGhostValid: boolean = true;
  private lastSnapCoord: { x: number; y: number; z: number; layer: number } | null = null;

  // Placement animation queue
  private animatedBricks: { mesh: THREE.Group; time: number; duration: number }[] = [];

  // Bridge callback
  private onBridgeGapFilled?: (slotIndex: number, brick: THREE.Group) => void;

  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
    this.createBaseplateAndEnvironment();
    this.updateGhostMesh();
  }

  public setBridgeCallback(cb: (slotIndex: number, brick: THREE.Group) => void): void {
    this.onBridgeGapFilled = cb;
  }

  /**
   * Generates studded baseplate with river gorge and toy scenery
   */
  private createBaseplateAndEnvironment(): void {
    const size = 36; // 36x36 studs
    const greenMat = BrickFactory.getMaterial('#2E7D32', 0.25, 0.05); // Meadow green
    const plateGeo = new THREE.BoxGeometry(size, 0.4, size);
    this.baseplate = new THREE.Mesh(plateGeo, greenMat);
    this.baseplate.position.set(0, -0.2, 0);
    this.baseplate.receiveShadow = true;
    this.scene.add(this.baseplate);
    this.interactableMeshes.push(this.baseplate);

    // Decorative river canal across the baseplate at Z = 15
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x0288D1,
      roughness: 0.1,
      metalness: 0.15,
      transparent: true,
      opacity: 0.85
    });
    const riverGeo = new THREE.BoxGeometry(size, 0.2, 5.0);
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.position.set(0, 0.05, 15);
    river.receiveShadow = true;
    this.scene.add(river);

    // River stone banks
    const stoneMat = BrickFactory.getMaterial('#8A9299', 0.4, 0.05);
    const bankGeo = new THREE.BoxGeometry(size, 0.35, 0.6);
    const bankNorth = new THREE.Mesh(bankGeo, stoneMat);
    bankNorth.position.set(0, 0.15, 17.5);
    bankNorth.castShadow = true;
    bankNorth.receiveShadow = true;

    const bankSouth = new THREE.Mesh(bankGeo, stoneMat);
    bankSouth.position.set(0, 0.15, 12.5);
    bankSouth.castShadow = true;
    bankSouth.receiveShadow = true;

    this.scene.add(bankNorth, bankSouth);
    this.interactableMeshes.push(bankNorth, bankSouth);

    // Baseplate studs: create instanced mesh for 60fps performance!
    const studCylinderGeo = new THREE.CylinderGeometry(
      BrickFactory.STUD_RADIUS * 0.8,
      BrickFactory.STUD_RADIUS * 0.8,
      0.14,
      12
    );
    const studCount = size * size;
    const instancedStuds = new THREE.InstancedMesh(studCylinderGeo, greenMat, studCount);
    instancedStuds.receiveShadow = true;

    const dummy = new THREE.Object3D();
    let idx = 0;
    const half = size / 2;
    for (let x = -half; x < half; x++) {
      for (let z = -half; z < half; z++) {
        // Skip studs under river canal
        if (z >= 12 && z <= 17) continue;

        dummy.position.set(x + 0.5, 0.07, z + 0.5);
        dummy.updateMatrix();
        instancedStuds.setMatrixAt(idx++, dummy.matrix);
      }
    }
    instancedStuds.count = idx;
    instancedStuds.instanceMatrix.needsUpdate = true;
    this.scene.add(instancedStuds);

    // Add Station Platform
    const station = BrickFactory.createStationPlatform();
    station.position.set(-14.5, 0, 0);
    this.scene.add(station);

    // Add surrounding scenic pine trees & flowers
    this.spawnScenicScenery();
  }

  private spawnScenicScenery(): void {
    const treePositions = [
      { x: 12, z: 2 },
      { x: 14, z: -4 },
      { x: 13, z: -10 },
      { x: 7, z: -10 },
      { x: -14, z: 12 },
      { x: -13, z: -12 },
      { x: 8, z: 10 },
      { x: 10, z: 14 }
    ];

    treePositions.forEach((pos) => {
      const tree = BrickFactory.createPineTree();
      tree.position.set(pos.x, 0, pos.z);
      this.scene.add(tree);
      this.interactableMeshes.push(tree);
    });

    const flowerPositions = [
      { x: -12.5, z: 7, color: '#FAC80A' },
      { x: -12.5, z: -7, color: '#D11A2A' },
      { x: -5, z: -10, color: '#0055BF' },
      { x: 3, z: -8, color: '#8E44AD' }
    ];

    flowerPositions.forEach((fp) => {
      const fl = BrickFactory.createFlower(fp.color);
      fl.position.set(fp.x, 0, fp.z);
      this.scene.add(fl);
    });
  }

  public setToolShape(shape: BrickShape): void {
    this.currentShape = shape;
    this.updateGhostMesh();
  }

  public setToolColor(colorHex: string): void {
    this.currentColor = colorHex;
    this.updateGhostMesh();
  }

  public rotateTool(): void {
    this.currentRotation = (this.currentRotation + Math.PI / 2) % (Math.PI * 2);
    if (this.ghostGroup) {
      this.ghostGroup.rotation.y = this.currentRotation;
    }
  }

  private updateGhostMesh(): void {
    if (this.ghostGroup) {
      this.scene.remove(this.ghostGroup);
      this.ghostGroup = null;
    }

    if (this.currentShape === 'tree_pine') {
      this.ghostGroup = BrickFactory.createPineTree(this.currentColor);
      // Apply ghost opacity
      this.ghostGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = BrickFactory.getGhostMaterial(this.currentGhostValid);
        }
      });
    } else if (this.currentShape === 'flower') {
      this.ghostGroup = BrickFactory.createFlower(this.currentColor);
      this.ghostGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = BrickFactory.getGhostMaterial(this.currentGhostValid);
        }
      });
    } else if (this.currentShape === 'slope2x2') {
      this.ghostGroup = BrickFactory.createSlopeBrick(2, 2, this.currentColor, true);
    } else if (this.currentShape === 'track_straight') {
      this.ghostGroup = BrickFactory.createTrackStraight(4.0, true);
    } else {
      const def = BRICK_DEFS[this.currentShape] || { width: 2, depth: 2 };
      this.ghostGroup = BrickFactory.createStandardBrick(def.width, def.depth, this.currentColor, true, this.currentGhostValid);
    }

    this.ghostGroup.rotation.y = this.currentRotation;
    this.ghostGroup.visible = false;
    this.scene.add(this.ghostGroup);
  }

  public setGhostVisible(visible: boolean): void {
    if (this.ghostGroup) {
      this.ghostGroup.visible = visible;
    }
  }

  /**
   * Raycast from pointer/touch screen coordinate to snap ghost brick
   */
  public updatePointerPosition(ndc: THREE.Vector2): void {
    this.raycaster.setFromCamera(ndc, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactableMeshes, true);

    if (intersects.length === 0 || !this.ghostGroup) {
      if (this.ghostGroup) this.ghostGroup.visible = false;
      this.lastSnapCoord = null;
      return;
    }

    const hit = intersects[0];
    const point = hit.point;
    const normal = hit.face ? hit.face.normal.clone().applyQuaternion(hit.object.getWorldQuaternion(new THREE.Quaternion())) : new THREE.Vector3(0, 1, 0);

    const def = BRICK_DEFS[this.currentShape] || { width: 2, depth: 2, heightUnits: 1 };
    const isRotated = Math.round(this.currentRotation / (Math.PI / 2)) % 2 !== 0;
    const effWidth = isRotated ? def.depth : def.width;
    const effDepth = isRotated ? def.width : def.depth;

    // Grid Snap along X and Z
    const snapX = Math.round(point.x + (effWidth % 2 === 0 ? 0.5 : 0)) - (effWidth % 2 === 0 ? 0.5 : 0);
    const snapZ = Math.round(point.z + (effDepth % 2 === 0 ? 0.5 : 0)) - (effDepth % 2 === 0 ? 0.5 : 0);

    // Height layer snap
    let snapY = 0;
    let layer = 0;

    if (normal.y > 0.5) {
      // Top of something
      const hUnit = BrickFactory.BRICK_HEIGHT;
      layer = Math.max(0, Math.floor((point.y + 0.05) / hUnit));
      snapY = layer * hUnit;
    } else {
      snapY = 0;
      layer = 0;
    }

    this.lastSnapCoord = { x: snapX, y: snapY, z: snapZ, layer };

    this.ghostGroup.position.set(snapX, snapY, snapZ);
    this.ghostGroup.rotation.y = this.currentRotation;
    this.ghostGroup.visible = true;

    // Collision validation check
    const isValid = this.checkPlacementValidity(snapX, layer, snapZ, effWidth, effDepth);
    if (isValid !== this.currentGhostValid) {
      this.currentGhostValid = isValid;
      this.ghostGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = BrickFactory.getGhostMaterial(isValid);
        }
      });
    }
  }

  private checkPlacementValidity(snapX: number, layer: number, snapZ: number, width: number, depth: number): boolean {
    const halfW = width / 2;
    const halfD = depth / 2;

    // Check bounds
    if (Math.abs(snapX) > 17 || Math.abs(snapZ) > 17) return false;

    // Check against existing placed bricks in occupancy map
    for (let x = -Math.floor(halfW); x < Math.ceil(halfW); x++) {
      for (let z = -Math.floor(halfD); z < Math.ceil(halfD); z++) {
        const key = `${Math.round(snapX + x)},${layer},${Math.round(snapZ + z)}`;
        if (this.gridOccupancy.has(key)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Place brick at current snapped location
   */
  public placeCurrentBrick(): PlacedBrick | null {
    if (!this.lastSnapCoord || !this.currentGhostValid) {
      return null;
    }

    const { x, y, z, layer } = this.lastSnapCoord;
    const def = BRICK_DEFS[this.currentShape] || { width: 2, depth: 2, heightUnits: 1 };

    let brickGroup: THREE.Group;
    if (this.currentShape === 'tree_pine') {
      brickGroup = BrickFactory.createPineTree(this.currentColor);
    } else if (this.currentShape === 'flower') {
      brickGroup = BrickFactory.createFlower(this.currentColor);
    } else if (this.currentShape === 'slope2x2') {
      brickGroup = BrickFactory.createSlopeBrick(2, 2, this.currentColor);
    } else if (this.currentShape === 'track_straight') {
      brickGroup = BrickFactory.createTrackStraight(4.0);
    } else {
      brickGroup = BrickFactory.createStandardBrick(def.width, def.depth, this.currentColor);
    }

    brickGroup.position.set(x, y, z);
    brickGroup.rotation.y = this.currentRotation;

    // Tactile placement sound
    soundSynth.playBrickSnap(1.0 + layer * 0.08);

    // Squash-and-stretch micro-animation
    brickGroup.scale.set(1.12, 0.8, 1.12);
    this.animatedBricks.push({
      mesh: brickGroup,
      time: 0,
      duration: 0.22
    });

    this.scene.add(brickGroup);
    this.interactableMeshes.push(brickGroup);

    // Register occupancy
    const placed: PlacedBrick = {
      id: `brick_${Date.now()}_${Math.random()}`,
      shape: this.currentShape,
      colorHex: this.currentColor,
      gridX: x,
      gridY: layer,
      gridZ: z,
      rotationY: this.currentRotation,
      mesh: brickGroup
    };

    const isRotated = Math.round(this.currentRotation / (Math.PI / 2)) % 2 !== 0;
    const effWidth = isRotated ? def.depth : def.width;
    const effDepth = isRotated ? def.width : def.depth;

    for (let ix = -Math.floor(effWidth / 2); ix < Math.ceil(effWidth / 2); ix++) {
      for (let iz = -Math.floor(effDepth / 2); iz < Math.ceil(effDepth / 2); iz++) {
        const key = `${Math.round(x + ix)},${layer},${Math.round(z + iz)}`;
        this.gridOccupancy.set(key, placed);
      }
    }

    this.placedBricks.push(placed);

    // Check if placement filled a bridge slot in Mission 1!
    // Bridge gap is at Z = 15, Y near 0.9, X in [-1.2, 0, 1.2]
    if (Math.abs(z - 15) < 1.0 && Math.abs(y - 0.9) < 0.8) {
      const slotIndex = Math.abs(x - (-1.2)) < 0.6 ? 0 :
                        Math.abs(x - 0.0) < 0.6 ? 1 :
                        Math.abs(x - 1.2) < 0.6 ? 2 : -1;
      if (slotIndex !== -1 && this.onBridgeGapFilled) {
        this.onBridgeGapFilled(slotIndex, brickGroup);
      }
    }

    // Update ghost validation
    this.updateGhostMesh();

    return placed;
  }

  /**
   * Delete / Remove brick under cursor
   */
  public deleteBrickUnderPointer(ndc: THREE.Vector2): boolean {
    this.raycaster.setFromCamera(ndc, this.camera);
    const intersects = this.raycaster.intersectObjects(this.placedBricks.map(b => b.mesh), true);

    if (intersects.length === 0) return false;

    // Find root group
    let obj: THREE.Object3D | null = intersects[0].object;
    while (obj && !this.placedBricks.some(b => b.mesh === obj)) {
      obj = obj.parent;
    }

    if (!obj) return false;

    const brickIndex = this.placedBricks.findIndex(b => b.mesh === obj);
    if (brickIndex === -1) return false;

    const brick = this.placedBricks[brickIndex];
    this.scene.remove(brick.mesh);
    this.interactableMeshes = this.interactableMeshes.filter(m => m !== brick.mesh);
    this.placedBricks.splice(brickIndex, 1);

    // Remove from occupancy
    for (const [key, val] of this.gridOccupancy.entries()) {
      if (val === brick) {
        this.gridOccupancy.delete(key);
      }
    }

    soundSynth.playBrickRemove();
    return true;
  }

  /**
   * Undo last placed brick
   */
  public undoLastBrick(): boolean {
    if (this.placedBricks.length === 0) return false;
    const last = this.placedBricks.pop()!;
    this.scene.remove(last.mesh);
    this.interactableMeshes = this.interactableMeshes.filter(m => m !== last.mesh);

    for (const [key, val] of this.gridOccupancy.entries()) {
      if (val === last) {
        this.gridOccupancy.delete(key);
      }
    }

    soundSynth.playBrickRemove();
    return true;
  }

  /**
   * Animation tick for micro-bounces
   */
  public update(dt: number): void {
    for (let i = this.animatedBricks.length - 1; i >= 0; i--) {
      const anim = this.animatedBricks[i];
      anim.time += dt;
      const progress = Math.min(1.0, anim.time / anim.duration);

      // Elastic bounce: 0.8 -> 1.06 -> 0.98 -> 1.0
      const bounce = 1.0 + Math.sin(progress * Math.PI * 2.5) * (1.0 - progress) * 0.25;
      anim.mesh.scale.set(
        1.0 + (1.0 - bounce) * 0.5,
        bounce,
        1.0 + (1.0 - bounce) * 0.5
      );

      if (progress >= 1.0) {
        anim.mesh.scale.set(1, 1, 1);
        this.animatedBricks.splice(i, 1);
      }
    }
  }

  public getPlacedBricks(): PlacedBrick[] {
    return this.placedBricks;
  }

  public getGhostPosition(): THREE.Vector3 | null {
    return this.ghostGroup && this.ghostGroup.visible ? this.ghostGroup.position : null;
  }
}
