import * as THREE from 'three';
import { BrickFactory } from './BrickFactory';

export interface BridgeGapSlot {
  id: number;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  isFilled: boolean;
  mesh?: THREE.Group;
  ghostMesh?: THREE.Group;
}

export interface PlacedTrackPieceData {
  id: string;
  position: THREE.Vector3;
  rotationY: number;
  shape: string;
  mesh: THREE.Group;
}

export class TrackNetwork {
  private scene: THREE.Scene;
  private trackCurve: THREE.CatmullRomCurve3;
  private totalLength: number = 0;
  private bridgeSlots: BridgeGapSlot[] = [];
  private isBridgeRepaired: boolean = false;
  private trackMeshesGroup: THREE.Group = new THREE.Group();
  private bridgeGroup: THREE.Group = new THREE.Group();

  // Custom placed tracks system
  private customTracks: PlacedTrackPieceData[] = [];
  private activeRoute: 'circuit' | 'custom' = 'circuit';
  private customCurve: THREE.CatmullRomCurve3 | null = null;
  private customTotalLength: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.trackCurve = this.createDefaultCircuit();
    this.totalLength = this.trackCurve.getLength();
    this.setupBridgeSlots();
    this.buildTrackVisuals();
  }

  /**
   * Builds the default scenic circuit
   */
  private createDefaultCircuit(): THREE.CatmullRomCurve3 {
    // 12 key control points forming a scenic rounded track loop
    const points: THREE.Vector3[] = [
      new THREE.Vector3(-12, 0.4, -6),   // Station approach
      new THREE.Vector3(-12, 0.4, 6),    // Passing Station
      new THREE.Vector3(-10, 0.4, 12),   // North-West curve
      new THREE.Vector3(-4, 0.9, 15),    // Bridge incline
      new THREE.Vector3(0, 0.9, 15),     // Bridge center (Gap here in Mission 1!)
      new THREE.Vector3(4, 0.9, 15),     // Bridge exit
      new THREE.Vector3(11, 0.4, 12),    // North-East curve (Forest)
      new THREE.Vector3(13, 0.4, 4),     // Pine Forest straight
      new THREE.Vector3(13, 0.4, -6),    // South-East straight
      new THREE.Vector3(9, 0.4, -13),    // South-East curve
      new THREE.Vector3(0, 0.4, -15),    // South curve across meadow
      new THREE.Vector3(-9, 0.4, -13)    // South-West curve back to station
    ];

    return new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.15);
  }

  /**
   * Sets up 3 yellow bridge gaps for Mission 1
   */
  private setupBridgeSlots(): void {
    // Bridge gap positions along the river gorge at Z = 15, Y = 0.9
    // Three 2x2 bricks placed at X = -2.0, 0.0, +2.0
    const gapXPositions = [-2.0, 0.0, 2.0];

    // Bridge stone foundation abutments / pillars on each river bank
    const abutmentMat = BrickFactory.getMaterial('#8A9299', 0.5, 0.1);
    const abutmentGeo = new THREE.BoxGeometry(1.4, 1.2, 3.2);

    const leftAbutment = new THREE.Mesh(abutmentGeo, abutmentMat);
    leftAbutment.position.set(-3.7, 0.45, 15);
    leftAbutment.castShadow = true;
    leftAbutment.receiveShadow = true;

    const rightAbutment = new THREE.Mesh(abutmentGeo, abutmentMat);
    rightAbutment.position.set(3.7, 0.45, 15);
    rightAbutment.castShadow = true;
    rightAbutment.receiveShadow = true;

    this.bridgeGroup.add(leftAbutment, rightAbutment);

    // Glowing golden yellow material for the missing bridge slots
    const yellowGhostMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FAC80A'),
      emissive: new THREE.Color('#FAC80A'),
      emissiveIntensity: 0.75,
      transparent: true,
      opacity: 0.7,
      roughness: 0.2,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    gapXPositions.forEach((x, index) => {
      const pos = new THREE.Vector3(x, 0.9, 15);
      const rot = new THREE.Euler(0, 0, 0);

      // Create glowing yellow ghost for each missing slot
      const ghost = BrickFactory.createStandardBrick(2, 2, '#FAC80A', true, true);
      ghost.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = yellowGhostMat;
        }
      });

      ghost.position.copy(pos);
      ghost.position.y -= BrickFactory.BRICK_HEIGHT / 2;
      this.bridgeGroup.add(ghost);

      this.bridgeSlots.push({
        id: index,
        position: pos,
        rotation: rot,
        isFilled: false,
        ghostMesh: ghost
      });
    });

    this.scene.add(this.bridgeGroup);
  }

  /**
   * Generates continuous Lego City style track sleepers and shiny metal rails along the spline
   */
  private buildTrackVisuals(): void {
    // Authentic Lego City dark grey plastic sleepers with studs
    const sleeperMat = BrickFactory.getMaterial('#475569', 0.4, 0.1);
    const railMat = BrickFactory.getMaterial('#CBD5E1', 0.15, 0.85); // Shiny silver rails
    const sleeperGeo = new THREE.BoxGeometry(2.4, 0.25, 0.5);

    const sleeperDistance = 1.0;
    const numSleepers = Math.floor(this.totalLength / sleeperDistance);

    for (let i = 0; i < numSleepers; i++) {
      const u = (i / numSleepers);
      const pos = this.trackCurve.getPointAt(u);
      const tangent = this.trackCurve.getTangentAt(u).normalize();
      const normal = new THREE.Vector3(0, 1, 0);

      // PROPER RIGHT-HANDED BASIS: right = normal x tangent
      const right = new THREE.Vector3().crossVectors(normal, tangent).normalize();
      const correctedUp = new THREE.Vector3().crossVectors(tangent, right).normalize();

      // Check if sleeper is within bridge gap while unrepaired
      const isInsideBridgeGap = Math.abs(pos.z - 15) < 1.8 && Math.abs(pos.x) < 2.0;

      if (!isInsideBridgeGap || this.isBridgeRepaired) {
        const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
        sleeper.position.copy(pos);
        sleeper.position.y -= 0.1;

        const rotMatrix = new THREE.Matrix4().makeBasis(right, correctedUp, tangent);
        sleeper.rotation.setFromRotationMatrix(rotMatrix);
        sleeper.castShadow = true;
        sleeper.receiveShadow = true;
        this.trackMeshesGroup.add(sleeper);
      }
    }

    // Extrude the dual steel rails along the spline
    const gauge = 1.3;
    const railLeftPoints: THREE.Vector3[] = [];
    const railRightPoints: THREE.Vector3[] = [];
    const segments = 160;

    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const pos = this.trackCurve.getPointAt(u);
      const tangent = this.trackCurve.getTangentAt(u).normalize();
      const normal = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(normal, tangent).normalize();

      railLeftPoints.push(pos.clone().addScaledVector(right, -gauge / 2).add(new THREE.Vector3(0, 0.08, 0)));
      railRightPoints.push(pos.clone().addScaledVector(right, gauge / 2).add(new THREE.Vector3(0, 0.08, 0)));
    }

    const leftRailCurve = new THREE.CatmullRomCurve3(railLeftPoints, true);
    const rightRailCurve = new THREE.CatmullRomCurve3(railRightPoints, true);

    const leftRailGeo = new THREE.TubeGeometry(leftRailCurve, 140, 0.07, 8, true);
    const rightRailGeo = new THREE.TubeGeometry(rightRailCurve, 140, 0.07, 8, true);

    const leftRailMesh = new THREE.Mesh(leftRailGeo, railMat);
    const rightRailMesh = new THREE.Mesh(rightRailGeo, railMat);
    leftRailMesh.castShadow = true;
    rightRailMesh.castShadow = true;

    this.trackMeshesGroup.add(leftRailMesh, rightRailMesh);
    this.scene.add(this.trackMeshesGroup);
  }

  /**
   * Register a user-placed Lego City track piece
   */
  public registerCustomTrack(piece: PlacedTrackPieceData): void {
    this.customTracks.push(piece);
    this.rebuildCustomTrackPath();
  }

  public unregisterCustomTrack(mesh: THREE.Group): void {
    this.customTracks = this.customTracks.filter(t => t.mesh !== mesh);
    this.rebuildCustomTrackPath();
  }

  public getCustomTracks(): PlacedTrackPieceData[] {
    return this.customTracks;
  }

  /**
   * Solves a continuous curve connecting user placed track pieces
   */
  private rebuildCustomTrackPath(): void {
    if (this.customTracks.length < 2) {
      this.customCurve = null;
      this.customTotalLength = 0;
      return;
    }

    const waypoints: THREE.Vector3[] = [];
    this.customTracks.forEach((t) => {
      waypoints.push(new THREE.Vector3(t.position.x, 0.4, t.position.z));
    });

    const isClosed = this.customTracks.length >= 4 &&
      waypoints[0].distanceTo(waypoints[waypoints.length - 1]) < 5.0;

    this.customCurve = new THREE.CatmullRomCurve3(waypoints, isClosed, 'centripetal', 0.2);
    this.customTotalLength = this.customCurve.getLength();
  }

  public setRoute(route: 'circuit' | 'custom'): boolean {
    if (route === 'custom') {
      if (!this.customCurve || this.customTracks.length < 2) {
        return false;
      }
      this.activeRoute = 'custom';
      return true;
    } else {
      this.activeRoute = 'circuit';
      return true;
    }
  }

  public getActiveRoute(): 'circuit' | 'custom' {
    return this.activeRoute;
  }

  /**
   * Get 3D transform at a distance along track with PROPER RIGHT-HANDED BASIS
   */
  public getTransformAtDistance(distance: number): {
    position: THREE.Vector3;
    quaternion: THREE.Quaternion;
    rotation: THREE.Euler;
    tangent: THREE.Vector3;
    normal: THREE.Vector3;
  } {
    const activeCurve = (this.activeRoute === 'custom' && this.customCurve) ? this.customCurve : this.trackCurve;
    const len = (this.activeRoute === 'custom' && this.customCurve) ? this.customTotalLength : this.totalLength;

    let d = distance % len;
    if (d < 0) d += len;

    const u = d / len;
    const position = activeCurve.getPointAt(u);
    const tangent = activeCurve.getTangentAt(u).normalize();

    // STRICT RIGHT-HANDED ORTHONORMAL BASIS:
    // tangent = forward (+Z)
    // up = normal (+Y)
    // right = up x forward (+X)
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(up, tangent).normalize();
    const correctedUp = new THREE.Vector3().crossVectors(tangent, right).normalize();

    const m = new THREE.Matrix4().makeBasis(right, correctedUp, tangent);
    const quaternion = new THREE.Quaternion().setFromRotationMatrix(m);
    const rotation = new THREE.Euler().setFromQuaternion(quaternion);

    return { position, quaternion, rotation, tangent, normal: correctedUp };
  }

  public getTotalLength(): number {
    return (this.activeRoute === 'custom' && this.customCurve) ? this.customTotalLength : this.totalLength;
  }

  public getBridgeSlots(): BridgeGapSlot[] {
    return this.bridgeSlots;
  }

  public isBridgeComplete(): boolean {
    return this.isBridgeRepaired || this.bridgeSlots.every(s => s.isFilled);
  }

  /**
   * Fill a bridge slot during Mission 1
   */
  public fillBridgeSlot(index: number, brickGroup: THREE.Group): boolean {
    if (index < 0 || index >= this.bridgeSlots.length) return false;
    const slot = this.bridgeSlots[index];
    if (slot.isFilled) return false;

    slot.isFilled = true;
    slot.mesh = brickGroup;
    if (slot.ghostMesh) {
      slot.ghostMesh.visible = false;
    }

    // Add wooden sleeper and dual rails directly on top of the placed bridge brick!
    const sleeperMat = BrickFactory.getMaterial('#475569', 0.4, 0.1);
    const railMat = BrickFactory.getMaterial('#CBD5E1', 0.15, 0.85);

    const bridgeTrackPiece = new THREE.Group();
    const sleeperGeo = new THREE.BoxGeometry(0.5, 0.2, 2.2);
    const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
    sleeper.position.set(0, BrickFactory.BRICK_HEIGHT + 0.1, 0);
    sleeper.castShadow = true;
    bridgeTrackPiece.add(sleeper);

    const railGeo = new THREE.BoxGeometry(2.0, 0.18, 0.1);
    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(0, BrickFactory.BRICK_HEIGHT + 0.22, -0.65);
    leftRail.castShadow = true;

    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(0, BrickFactory.BRICK_HEIGHT + 0.22, 0.65);
    rightRail.castShadow = true;

    bridgeTrackPiece.add(leftRail, rightRail);
    brickGroup.add(bridgeTrackPiece);

    if (this.bridgeSlots.every(s => s.isFilled)) {
      this.isBridgeRepaired = true;
    }
    return true;
  }

  public repairBridgeInstantly(): void {
    this.bridgeSlots.forEach((slot, idx) => {
      if (!slot.isFilled) {
        const brick = BrickFactory.createStandardBrick(2, 2, '#FAC80A');
        brick.position.copy(slot.position);
        brick.position.y -= BrickFactory.BRICK_HEIGHT / 2;
        this.bridgeGroup.add(brick);
        this.fillBridgeSlot(idx, brick);
      }
    });
    this.isBridgeRepaired = true;
  }

  public canTrainPassAt(distance: number): boolean {
    if (this.isBridgeRepaired || this.activeRoute === 'custom') return true;
    const { position } = this.getTransformAtDistance(distance);
    const isAtBridgeGap = Math.abs(position.z - 15) < 2.0 && Math.abs(position.x) < 2.5;
    return !isAtBridgeGap;
  }
}
