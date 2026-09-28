import * as THREE from 'three';
import { BrickFactory, BRICK_DEFS, type BrickShape } from './BrickFactory';
import { soundSynth } from './SoundSynth';
import type { TrackNetwork } from './TrackNetwork';

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
  private trackNetwork: TrackNetwork | null = null;
  private wasMagneticSnapped: boolean = false;

  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
    this.createBaseplateAndEnvironment();
    this.updateGhostMesh();
  }

  public setTrackNetwork(network: TrackNetwork): void {
    this.trackNetwork = network;
  }

  public setBridgeCallback(cb: (slotIndex: number, brick: THREE.Group) => void): void {
    this.onBridgeGapFilled = cb;
  }

  /**
   * Generates studded baseplate with river gorge and toy scenery
   */
  private createBaseplateAndEnvironment(): void {
    const size = 56; // Enlarged canvas: 56x56 studs (over 2.4x buildable surface!)
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

  private instantiateShape(
    shape: BrickShape,
    colorHex: string,
    isGhost: boolean = false,
    isValidGhost: boolean = true
  ): THREE.Group {
    let group: THREE.Group;

    switch (shape) {
      case 'plate2x2':
        group = BrickFactory.createFlatTile(2, 2, colorHex, isGhost);
        break;
      case 'plate4x4':
        group = BrickFactory.createPlate(4, 4, colorHex, isGhost);
        break;
      case 'slope2x2':
        group = BrickFactory.createSlopeBrick(2, 2, colorHex, isGhost);
        break;
      case 'slope2x4':
        group = BrickFactory.createSlopeBrick(4, 2, colorHex, isGhost);
        break;
      case 'arch1x4':
        group = BrickFactory.createArchBrick(colorHex, isGhost);
        break;
      case 'finestra':
        group = BrickFactory.createWindow(colorHex, isGhost);
        break;
      case 'porta':
        group = BrickFactory.createDoor(colorHex, isGhost);
        break;
      case 'torre2x2':
        group = BrickFactory.createRoundTower(colorHex, isGhost);
        break;
      case 'teulada_con':
        group = BrickFactory.createConicalTurretRoof(colorHex, isGhost);
        break;
      case 'merlet':
        group = BrickFactory.createCastleWallCrenellation(colorHex, isGhost);
        break;
      case 'tanca':
        group = BrickFactory.createGardenFence(colorHex, isGhost);
        break;
      case 'xemeneia':
        group = BrickFactory.createChimneyWithSmoke(colorHex, isGhost);
        break;
      case 'corner2x2':
        group = BrickFactory.createCornerBrick(colorHex, isGhost);
        break;
      case 'cyl1x1':
        group = BrickFactory.createCylinderBrick(colorHex, isGhost);
        break;
      case 'cone1x1':
        group = BrickFactory.createConeStud(colorHex, isGhost);
        break;
      case 'fanal':
        group = BrickFactory.createStreetLight();
        break;
      case 'barril':
        group = BrickFactory.createCargoBarrel(colorHex);
        break;
      case 'tree_pine':
        group = BrickFactory.createPineTree(colorHex);
        break;
      case 'tree_apple':
        group = BrickFactory.createAppleTree();
        break;
      case 'arbust':
        group = BrickFactory.createBush();
        break;
      case 'flower':
        group = BrickFactory.createFlower(colorHex);
        break;
      case 'minifigure':
        group = BrickFactory.createMinifigure();
        break;
      case 'senyal_tren':
        group = BrickFactory.createRailwayCrossingSign(isGhost);
        break;
      case 'hidrant':
        group = BrickFactory.createFireHydrant(isGhost);
        break;
      case 'banc':
        group = BrickFactory.createParkBench(isGhost);
        break;
      case 'rellotge':
        group = BrickFactory.createStationClock(isGhost);
        break;
      case 'senyera':
        group = BrickFactory.createFlagpoleSenyera(isGhost);
        break;
      case 'vaca':
        group = BrickFactory.createCow(isGhost);
        break;
      case 'ovella':
        group = BrickFactory.createSheep(isGhost);
        break;
      case 'anec':
        group = BrickFactory.createDuck(isGhost);
        break;
      case 'caixa':
        group = BrickFactory.createCargoBox(colorHex, isGhost);
        break;
      case 'track_straight':
        group = BrickFactory.createLegoCityStraightTrack(isGhost, 4.0);
        break;
      case 'track_straight_long':
        group = BrickFactory.createLegoCityStraightTrack(isGhost, 8.0);
        break;
      case 'track_curve':
      case 'track_curve_right':
        group = BrickFactory.createLegoCityCurvedTrack(isGhost, false);
        break;
      case 'track_curve_left':
        group = BrickFactory.createLegoCityCurvedTrack(isGhost, true);
        break;
      case 'track_crossing':
        group = BrickFactory.createLevelCrossing(isGhost);
        break;
      case 'track_buffer':
        group = BrickFactory.createBufferStop(isGhost);
        break;
      case 'track_station':
        group = BrickFactory.createStationTrack(isGhost);
        break;
      default: {
        const def = BRICK_DEFS[shape] || { width: 2, depth: 2 };
        group = BrickFactory.createStandardBrick(def.width, def.depth, colorHex, isGhost, isValidGhost);
        break;
      }
    }

    if (isGhost) {
      const ghostMat = BrickFactory.getGhostMaterial(isValidGhost);
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = ghostMat;
        }
      });
    }

    return group;
  }

  private updateGhostMesh(): void {
    if (this.ghostGroup) {
      this.scene.remove(this.ghostGroup);
      this.ghostGroup = null;
    }

    this.ghostGroup = this.instantiateShape(this.currentShape, this.currentColor, true, this.currentGhostValid);
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

    // Grid Snap along X and Z, with Magnetic Track Snap & Smart Bridge Snap Assist for kids!
    let snapX = 0;
    let snapZ = 0;
    let snapY = 0;
    let layer = 0;

    let isMagneticTrackSnapped = false;
    if (this.currentShape.startsWith('track_') && this.trackNetwork) {
      const magneticSnap = this.trackNetwork.findMagneticTrackSnap(this.currentShape, point);
      if (magneticSnap) {
        snapX = magneticSnap.position.x;
        snapZ = magneticSnap.position.z;
        snapY = 0;
        layer = 0;
        if (this.currentRotation !== magneticSnap.rotationY) {
          this.currentRotation = magneticSnap.rotationY;
        }
        isMagneticTrackSnapped = true;
        if (!this.wasMagneticSnapped) {
          soundSynth.playMagneticTrackSnap();
          this.wasMagneticSnapped = true;
        }
      }
    }

    if (!isMagneticTrackSnapped) {
      this.wasMagneticSnapped = false;
    }

    const isNearBridge = !isMagneticTrackSnapped && Math.abs(point.z - 15) < 2.2 && Math.abs(point.x) < 3.6;
    if (isMagneticTrackSnapped) {
      // Already snapped to exact track alignment
    } else if (isNearBridge) {
      const bridgeSlots = [-2.0, 0.0, 2.0];
      let bestSlot = bridgeSlots[0];
      let bestDist = 999;
      bridgeSlots.forEach((s) => {
        const d = Math.abs(point.x - s);
        if (d < bestDist) {
          bestDist = d;
          bestSlot = s;
        }
      });
      snapX = bestSlot;
      snapZ = 15;
      snapY = 0.9 - BrickFactory.BRICK_HEIGHT / 2;
      layer = 1;
    } else {
      snapX = Math.round(point.x + (effWidth % 2 === 0 ? 0.5 : 0)) - (effWidth % 2 === 0 ? 0.5 : 0);
      snapZ = Math.round(point.z + (effDepth % 2 === 0 ? 0.5 : 0)) - (effDepth % 2 === 0 ? 0.5 : 0);

      // Identify if an existing placed brick was intersected
      let hitBrick: PlacedBrick | undefined;
      for (const b of this.placedBricks) {
        if (b.mesh === hit.object || b.mesh.getObjectById(hit.object.id)) {
          hitBrick = b;
          break;
        }
      }

      const hUnit = BrickFactory.BRICK_HEIGHT;
      if (hitBrick) {
        const hitDef = BRICK_DEFS[hitBrick.shape] || { width: 2, depth: 2, heightUnits: 1 };
        const hitHeightLayers = Math.max(1, Math.round(hitDef.heightUnits || 1));
        if (normal.y > 0.4) {
          // Hovering over top face/studs: snap cleanly to the layer immediately on top of the entire piece!
          layer = hitBrick.gridY + hitHeightLayers;
          snapY = layer * hUnit;
        } else {
          // Hovering on the side face of a piece
          layer = Math.max(0, Math.floor((point.y + 0.05) / hUnit));
          snapY = layer * hUnit;
        }
      } else if (normal.y > 0.5) {
        layer = Math.max(0, Math.floor((point.y + 0.05) / hUnit));
        snapY = layer * hUnit;
      } else {
        snapY = 0;
        layer = 0;
      }
    }

    this.lastSnapCoord = { x: snapX, y: snapY, z: snapZ, layer };

    this.ghostGroup.position.set(snapX, snapY, snapZ);
    this.ghostGroup.rotation.y = this.currentRotation;
    this.ghostGroup.visible = true;

    // Collision validation check across all vertical layers of the incoming shape
    const incomingLayers = Math.max(1, Math.round(def.heightUnits || 1));
    const isValid = isNearBridge || this.checkPlacementValidity(snapX, layer, snapZ, effWidth, effDepth, incomingLayers);
    if (isValid !== this.currentGhostValid) {
      this.currentGhostValid = isValid;
      this.ghostGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = BrickFactory.getGhostMaterial(isValid);
        }
      });
    }
  }

  private checkPlacementValidity(
    snapX: number,
    layer: number,
    snapZ: number,
    width: number,
    depth: number,
    heightLayers: number = 1
  ): boolean {
    const halfW = width / 2;
    const halfD = depth / 2;

    // Check bounds (56x56 studs baseplate)
    if (Math.abs(snapX) > 26 || Math.abs(snapZ) > 26) return false;

    // Check against existing placed bricks across all vertical layers
    for (let l = layer; l < layer + heightLayers; l++) {
      for (let x = -Math.floor(halfW); x < Math.ceil(halfW); x++) {
        for (let z = -Math.floor(halfD); z < Math.ceil(halfD); z++) {
          const key = `${Math.round(snapX + x)},${l},${Math.round(snapZ + z)}`;
          if (this.gridOccupancy.has(key)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Place brick directly at specified coordinate (used by player and blueprints)
   */
  public placeBrickDirect(
    shape: BrickShape,
    colorHex: string,
    x: number,
    y: number,
    z: number,
    layer: number,
    rotationY: number
  ): PlacedBrick {
    const def = BRICK_DEFS[shape] || { width: 2, depth: 2, heightUnits: 1 };
    const brickGroup = this.instantiateShape(shape, colorHex, false);
    brickGroup.position.set(x, y, z);
    brickGroup.rotation.y = rotationY;

    this.scene.add(brickGroup);
    this.interactableMeshes.push(brickGroup);

    const placed: PlacedBrick = {
      id: `brick_${Date.now()}_${Math.random()}`,
      shape,
      colorHex,
      gridX: x,
      gridY: layer,
      gridZ: z,
      rotationY,
      mesh: brickGroup
    };

    const isRotated = Math.round(rotationY / (Math.PI / 2)) % 2 !== 0;
    const effWidth = isRotated ? def.depth : def.width;
    const effDepth = isRotated ? def.width : def.depth;
    const heightLayers = Math.max(1, Math.round(def.heightUnits || 1));

    for (let l = layer; l < layer + heightLayers; l++) {
      for (let ix = -Math.floor(effWidth / 2); ix < Math.ceil(effWidth / 2); ix++) {
        for (let iz = -Math.floor(effDepth / 2); iz < Math.ceil(effDepth / 2); iz++) {
          const key = `${Math.round(x + ix)},${l},${Math.round(z + iz)}`;
          this.gridOccupancy.set(key, placed);
        }
      }
    }

    this.placedBricks.push(placed);

    if (shape.startsWith('track_') && this.trackNetwork) {
      this.trackNetwork.registerCustomTrack({
        id: placed.id,
        position: new THREE.Vector3(x, y, z),
        rotationY,
        shape,
        mesh: brickGroup
      });
    }

    return placed;
  }

  /**
   * Place brick at current snapped location
   */
  public placeCurrentBrick(): PlacedBrick | null {
    if (!this.lastSnapCoord || !this.currentGhostValid) {
      return null;
    }

    const { x, y, z, layer } = this.lastSnapCoord;

    const placed = this.placeBrickDirect(
      this.currentShape,
      this.currentColor,
      x,
      y,
      z,
      layer,
      this.currentRotation
    );

    // Tactile placement sound
    soundSynth.playBrickSnap(1.0 + layer * 0.08);

    // Squash-and-stretch micro-animation
    placed.mesh.scale.set(1.12, 0.8, 1.12);
    this.animatedBricks.push({
      mesh: placed.mesh,
      time: 0,
      duration: 0.22
    });

    // Check if placement filled a bridge slot in Mission 1!
    if (Math.abs(z - 15) < 1.5) {
      const slotIndex = Math.abs(x - (-2.0)) < 0.8 ? 0 :
                        Math.abs(x - 0.0) < 0.8 ? 1 :
                        Math.abs(x - 2.0) < 0.8 ? 2 : -1;
      if (slotIndex !== -1 && this.onBridgeGapFilled) {
        this.onBridgeGapFilled(slotIndex, placed.mesh);
      }
    }

    // Update ghost validation
    this.updateGhostMesh();
    this.saveToStorage();

    return placed;
  }

  /**
   * Clear all placed bricks from the scene
   */
  public clearAllBricks(): void {
    for (const b of this.placedBricks) {
      if (b.shape.startsWith('track_') && this.trackNetwork) {
        this.trackNetwork.unregisterCustomTrack(b.mesh);
      }
      this.scene.remove(b.mesh);
    }
    this.placedBricks = [];
    this.gridOccupancy.clear();
    this.interactableMeshes = [this.baseplate!].filter(Boolean);
    try {
      localStorage.removeItem('blockstory_catala_save');
    } catch {
      // ignore
    }
    soundSynth.playBrickRemove();
  }

  public saveToStorage(): void {
    try {
      const data = this.placedBricks.map(b => ({
        shape: b.shape,
        colorHex: b.colorHex,
        gridX: b.gridX,
        gridY: b.gridY,
        gridZ: b.gridZ,
        rotationY: b.rotationY
      }));
      localStorage.setItem('blockstory_catala_save', JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  public loadFromStorage(): boolean {
    try {
      const saved = localStorage.getItem('blockstory_catala_save');
      if (!saved) return false;
      const data = JSON.parse(saved);
      if (Array.isArray(data) && data.length > 0) {
        this.clearAllBricks();
        for (const item of data) {
          const y = item.gridY * BrickFactory.BRICK_HEIGHT;
          this.placeBrickDirect(
            item.shape,
            item.colorHex,
            item.gridX,
            y,
            item.gridZ,
            item.gridY,
            item.rotationY
          );
        }
        return true;
      }
    } catch {
      // ignore
    }
    return false;
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
    if (brick.shape.startsWith('track_') && this.trackNetwork) {
      this.trackNetwork.unregisterCustomTrack(brick.mesh);
    }
    this.scene.remove(brick.mesh);
    this.interactableMeshes = this.interactableMeshes.filter(m => m !== brick.mesh);
    this.placedBricks.splice(brickIndex, 1);

    // Remove from occupancy
    for (const [key, val] of this.gridOccupancy.entries()) {
      if (val === brick) {
        this.gridOccupancy.delete(key);
      }
    }

    this.saveToStorage();
    soundSynth.playBrickRemove();
    return true;
  }

  /**
   * Undo last placed brick
   */
  public undoLastBrick(): boolean {
    if (this.placedBricks.length === 0) return false;
    const last = this.placedBricks.pop()!;
    if (last.shape.startsWith('track_') && this.trackNetwork) {
      this.trackNetwork.unregisterCustomTrack(last.mesh);
    }
    this.scene.remove(last.mesh);
    this.interactableMeshes = this.interactableMeshes.filter(m => m !== last.mesh);

    for (const [key, val] of this.gridOccupancy.entries()) {
      if (val === last) {
        this.gridOccupancy.delete(key);
      }
    }

    this.saveToStorage();
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

  /**
   * Tap / Click to interact with placed bricks (animals, props, minifigures)
   */
  public interactWithBrickAt(ndc: THREE.Vector2): { shape: BrickShape; mesh: THREE.Group } | null {
    this.raycaster.setFromCamera(ndc, this.camera);
    const intersects = this.raycaster.intersectObjects(this.placedBricks.map(b => b.mesh), true);
    if (intersects.length === 0) return null;

    let obj: THREE.Object3D | null = intersects[0].object;
    while (obj && !this.placedBricks.some(b => b.mesh === obj)) {
      obj = obj.parent;
    }
    if (!obj) return null;

    const brick = this.placedBricks.find(b => b.mesh === obj);
    if (!brick) return null;

    // Trigger bouncy elastic animation on the tapped piece!
    brick.mesh.scale.set(1.22, 0.78, 1.22);
    this.animatedBricks.push({
      mesh: brick.mesh,
      time: 0,
      duration: 0.32
    });

    return { shape: brick.shape, mesh: brick.mesh };
  }
}
