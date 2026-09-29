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
    // 18 key control points forming a scenic, gently rounded track loop without sharp corners
    const points: THREE.Vector3[] = [
      new THREE.Vector3(-12, 0.4, -6),    // Station approach straight
      new THREE.Vector3(-12, 0.4, 0),     // Station center
      new THREE.Vector3(-12, 0.4, 6),     // Station exit
      new THREE.Vector3(-10.5, 0.45, 10), // Gentle North-West curve start
      new THREE.Vector3(-7.5, 0.65, 13.5),// Gentle North-West transition
      new THREE.Vector3(-4, 0.9, 15),     // Bridge incline
      new THREE.Vector3(0, 0.9, 15),      // Bridge center (Gap here in Mission 1!)
      new THREE.Vector3(4, 0.9, 15),      // Bridge exit
      new THREE.Vector3(7.5, 0.65, 13.5), // North-East curve transition
      new THREE.Vector3(10.5, 0.45, 10),  // North-East curve (Forest entry)
      new THREE.Vector3(12.5, 0.4, 6),    // North-East smooth transition
      new THREE.Vector3(13, 0.4, 0),      // Pine Forest straight
      new THREE.Vector3(13, 0.4, -6),     // South-East straight
      new THREE.Vector3(11.5, 0.4, -10.5),// South-East gentle curve
      new THREE.Vector3(7.5, 0.4, -13.5), // South-East curve transition
      new THREE.Vector3(0, 0.4, -15),     // South curve across meadow
      new THREE.Vector3(-7.5, 0.4, -13.5),// South-West curve transition
      new THREE.Vector3(-11.5, 0.4, -10.5)// South-West curve back to station approach
    ];

    return new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.5);
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

  private isCustomLoop: boolean = false;

  /**
   * Register a user-placed Lego City track piece
   */
  public registerCustomTrack(piece: PlacedTrackPieceData): void {
    this.customTracks.push(piece);
    this.rebuildCustomTrackPath();
    // Default to custom route when user places tracks
    this.activeRoute = 'custom';
  }

  public unregisterCustomTrack(mesh: THREE.Group): void {
    this.customTracks = this.customTracks.filter(t => t.mesh !== mesh);
    this.rebuildCustomTrackPath();
    if (this.customTracks.length === 0) {
      this.activeRoute = 'circuit';
    }
  }

  public getCustomTracks(): PlacedTrackPieceData[] {
    return this.customTracks;
  }

  public getIsCustomLoop(): boolean {
    return this.isCustomLoop;
  }

  /**
   * Topological Track Solver: chains connected track pieces into a continuous curve
   */
  private rebuildCustomTrackPath(): void {
    if (this.customTracks.length === 0) {
      this.customCurve = null;
      this.customTotalLength = 0;
      this.isCustomLoop = false;
      return;
    }

    interface TrackSegment {
      piece: PlacedTrackPieceData;
      portA: THREE.Vector3;
      portB: THREE.Vector3;
      waypoints: THREE.Vector3[];
    }

    const segments: TrackSegment[] = this.customTracks.map((t) => {
      const localPts: THREE.Vector3[] = [];
      let lA: THREE.Vector3;
      let lB: THREE.Vector3;

      if (t.shape === 'track_straight_long') {
        const halfLen = 4.0;
        lA = new THREE.Vector3(0, 0.45, -halfLen);
        lB = new THREE.Vector3(0, 0.45, halfLen);
        for (let s = -halfLen; s <= halfLen; s += 0.8) {
          localPts.push(new THREE.Vector3(0, 0.45, s));
        }
      } else if (t.shape === 'track_curve_right' || t.shape === 'track_curve') {
        // Curve Right: R = 4.0 gentle arc from (0, -4.0) to (4.0, 0.0)
        lA = new THREE.Vector3(0, 0.45, -4.0);
        lB = new THREE.Vector3(4.0, 0.45, 0.0);
        for (let i = 0; i <= 12; i++) {
          const phi = (i / 12) * (Math.PI / 2);
          const x = 4.0 - 4.0 * Math.cos(phi);
          const z = -4.0 + 4.0 * Math.sin(phi);
          localPts.push(new THREE.Vector3(x, 0.45, z));
        }
      } else if (t.shape === 'track_curve_left') {
        // Curve Left: R = 4.0 gentle arc from (0, -4.0) to (-4.0, 0.0)
        lA = new THREE.Vector3(0, 0.45, -4.0);
        lB = new THREE.Vector3(-4.0, 0.45, 0.0);
        for (let i = 0; i <= 12; i++) {
          const phi = (i / 12) * (Math.PI / 2);
          const x = -(4.0 - 4.0 * Math.cos(phi));
          const z = -4.0 + 4.0 * Math.sin(phi);
          localPts.push(new THREE.Vector3(x, 0.45, z));
        }
      } else if (t.shape === 'track_buffer') {
        lA = new THREE.Vector3(0, 0.45, -2.0);
        lB = new THREE.Vector3(0, 0.45, 0.8);
        for (let s = -2.0; s <= 0.8; s += 0.7) {
          localPts.push(new THREE.Vector3(0, 0.45, s));
        }
      } else if (t.shape === 'track_station') {
        lA = new THREE.Vector3(-1.0, 0.45, -2.0);
        lB = new THREE.Vector3(-1.0, 0.45, 2.0);
        for (let s = -2.0; s <= 2.0; s += 0.8) {
          localPts.push(new THREE.Vector3(-1.0, 0.45, s));
        }
      } else {
        // Default track_straight (length 4) or track_crossing
        lA = new THREE.Vector3(0, 0.45, -2.0);
        lB = new THREE.Vector3(0, 0.45, 2.0);
        for (let s = -2.0; s <= 2.0; s += 0.8) {
          localPts.push(new THREE.Vector3(0, 0.45, s));
        }
      }

      // Transform local points to world space
      const cosR = Math.cos(t.rotationY);
      const sinR = Math.sin(t.rotationY);
      const toWorld = (pt: THREE.Vector3) =>
        new THREE.Vector3(
          t.position.x + (pt.x * cosR + pt.z * sinR),
          pt.y,
          t.position.z + (-pt.x * sinR + pt.z * cosR)
        );

      return {
        piece: t,
        portA: toWorld(lA),
        portB: toWorld(lB),
        waypoints: localPts.map(toWorld)
      };
    });

    if (segments.length === 1) {
      const pts = segments[0].waypoints;
      this.customCurve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.15);
      this.customTotalLength = this.customCurve.getLength();
      this.isCustomLoop = false;
      return;
    }

    // Topological Chain Traversal:
    const visited = new Set<number>();
    const orderedPoints: THREE.Vector3[] = [];

    // Find a starting segment that is an open end (degree 1), or start at 0
    let startIdx = 0;
    let startForward = true;

    for (let i = 0; i < segments.length; i++) {
      const segA = segments[i];
      let matchesA = 0;
      let matchesB = 0;
      for (let j = 0; j < segments.length; j++) {
        if (i === j) continue;
        const segB = segments[j];
        if (segA.portA.distanceTo(segB.portA) < 1.0 || segA.portA.distanceTo(segB.portB) < 1.0) matchesA++;
        if (segA.portB.distanceTo(segB.portA) < 1.0 || segA.portB.distanceTo(segB.portB) < 1.0) matchesB++;
      }
      if (matchesA === 0 && matchesB > 0) {
        startIdx = i;
        startForward = true;
        break;
      } else if (matchesB === 0 && matchesA > 0) {
        startIdx = i;
        startForward = false;
        break;
      }
    }

    let currentIdx = startIdx;
    let forward = startForward;

    while (currentIdx !== -1 && !visited.has(currentIdx)) {
      visited.add(currentIdx);
      const seg = segments[currentIdx];
      const pts = forward ? [...seg.waypoints] : [...seg.waypoints].reverse();

      pts.forEach((p) => {
        if (orderedPoints.length === 0 || orderedPoints[orderedPoints.length - 1].distanceTo(p) > 0.2) {
          orderedPoints.push(p);
        }
      });

      const exitPort = forward ? seg.portB : seg.portA;

      let nextIdx = -1;
      let nextForward = true;
      let bestDist = 1.2;

      for (let j = 0; j < segments.length; j++) {
        if (visited.has(j)) continue;
        const other = segments[j];
        const distA = exitPort.distanceTo(other.portA);
        const distB = exitPort.distanceTo(other.portB);

        if (distA < bestDist) {
          bestDist = distA;
          nextIdx = j;
          nextForward = true;
        } else if (distB < bestDist) {
          bestDist = distB;
          nextIdx = j;
          nextForward = false;
        }
      }

      currentIdx = nextIdx;
      forward = nextForward;
    }

    // Check if loop closes back to start
    let isLoop = false;
    if (orderedPoints.length >= 4) {
      const first = orderedPoints[0];
      const last = orderedPoints[orderedPoints.length - 1];
      if (first.distanceTo(last) < 1.8) {
        isLoop = true;
      }
    }

    if (orderedPoints.length < 2) {
      orderedPoints.push(segments[0].portA, segments[0].portB);
    }

    this.customCurve = new THREE.CatmullRomCurve3(orderedPoints, isLoop, 'centripetal', 0.5);
    this.customTotalLength = this.customCurve.getLength();
    this.isCustomLoop = isLoop;
  }

  public setRoute(route: 'circuit' | 'custom'): boolean {
    if (route === 'custom') {
      if (!this.customCurve || this.customTracks.length < 1) {
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
   * Get 3D transform at a distance along track with PROPER RIGHT-HANDED BASIS and BOGIE WHEELBASE SMOOTHING
   */
  public getTransformAtDistance(distance: number, wheelbase: number = 0): {
    position: THREE.Vector3;
    quaternion: THREE.Quaternion;
    rotation: THREE.Euler;
    tangent: THREE.Vector3;
    normal: THREE.Vector3;
  } {
    const activeCurve = (this.activeRoute === 'custom' && this.customCurve) ? this.customCurve : this.trackCurve;
    const len = (this.activeRoute === 'custom' && this.customCurve) ? this.customTotalLength : this.totalLength;

    if (len <= 0) {
      return {
        position: new THREE.Vector3(0, 0.45, 0),
        quaternion: new THREE.Quaternion(),
        rotation: new THREE.Euler(),
        tangent: new THREE.Vector3(0, 0, 1),
        normal: new THREE.Vector3(0, 1, 0)
      };
    }

    const isLoop = (this.activeRoute === 'circuit') || this.isCustomLoop;

    const sampleAtDist = (dVal: number): THREE.Vector3 => {
      let d = dVal;
      if (isLoop) {
        d = d % len;
        if (d < 0) d += len;
      } else {
        d = THREE.MathUtils.clamp(d, 0, len);
      }
      const u = THREE.MathUtils.clamp(d / len, 0, 1);
      return activeCurve.getPointAt(u);
    };

    let position: THREE.Vector3;
    let tangent: THREE.Vector3;

    if (wheelbase > 0.1) {
      // Bogie front & rear axle sampling: smooth vehicle orientation through all curves!
      const pFront = sampleAtDist(distance + wheelbase * 0.5);
      const pRear = sampleAtDist(distance - wheelbase * 0.5);
      position = new THREE.Vector3().addVectors(pFront, pRear).multiplyScalar(0.5);
      tangent = new THREE.Vector3().subVectors(pFront, pRear);
      if (tangent.lengthSq() > 0.0001) {
        tangent.normalize();
      } else {
        tangent.set(0, 0, 1);
      }
    } else {
      let d = distance;
      if (isLoop) {
        d = d % len;
        if (d < 0) d += len;
      } else {
        d = THREE.MathUtils.clamp(d, 0, len);
      }
      const u = THREE.MathUtils.clamp(d / len, 0, 1);
      position = activeCurve.getPointAt(u);
      tangent = activeCurve.getTangentAt(u).normalize();
    }

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

  /**
   * Helper defining connection ports for each track piece shape in local coordinates
   */
  public static getShapeLocalPorts(shape: string): { pos: THREE.Vector3; dir: THREE.Vector3 }[] {
    if (shape === 'track_straight_long') {
      return [
        { pos: new THREE.Vector3(0, 0, 4.0), dir: new THREE.Vector3(0, 0, 1) },
        { pos: new THREE.Vector3(0, 0, -4.0), dir: new THREE.Vector3(0, 0, -1) }
      ];
    } else if (shape === 'track_curve_right') {
      return [
        { pos: new THREE.Vector3(0, 0, -4.0), dir: new THREE.Vector3(0, 0, -1) },
        { pos: new THREE.Vector3(4.0, 0, 0.0), dir: new THREE.Vector3(1, 0, 0) }
      ];
    } else if (shape === 'track_curve_left' || shape === 'track_curve') {
      return [
        { pos: new THREE.Vector3(0, 0, -4.0), dir: new THREE.Vector3(0, 0, -1) },
        { pos: new THREE.Vector3(-4.0, 0, 0.0), dir: new THREE.Vector3(-1, 0, 0) }
      ];
    } else if (shape === 'track_crossing') {
      return [
        { pos: new THREE.Vector3(0, 0, 2.0), dir: new THREE.Vector3(0, 0, 1) },
        { pos: new THREE.Vector3(0, 0, -2.0), dir: new THREE.Vector3(0, 0, -1) },
        { pos: new THREE.Vector3(2.0, 0, 0.0), dir: new THREE.Vector3(1, 0, 0) },
        { pos: new THREE.Vector3(-2.0, 0, 0.0), dir: new THREE.Vector3(-1, 0, 0) }
      ];
    } else if (shape === 'track_station') {
      return [
        { pos: new THREE.Vector3(-1.0, 0, 2.0), dir: new THREE.Vector3(0, 0, 1) },
        { pos: new THREE.Vector3(-1.0, 0, -2.0), dir: new THREE.Vector3(0, 0, -1) }
      ];
    } else if (shape === 'track_buffer') {
      return [
        { pos: new THREE.Vector3(0, 0, -2.0), dir: new THREE.Vector3(0, 0, -1) }
      ];
    } else {
      // track_straight (length 4)
      return [
        { pos: new THREE.Vector3(0, 0, 2.0), dir: new THREE.Vector3(0, 0, 1) },
        { pos: new THREE.Vector3(0, 0, -2.0), dir: new THREE.Vector3(0, 0, -1) }
      ];
    }
  }

  /**
   * Magnetic snap calculation: if candidate track is near an open track port,
   * snaps position and aligns rotation to seamlessly continue the railway!
   */
  public findMagneticTrackSnap(
    candidateShape: string,
    pointerWorldPos: THREE.Vector3
  ): { position: THREE.Vector3; rotationY: number } | null {
    if (this.customTracks.length === 0) return null;

    // 1. Gather all ports of placed tracks in world space
    const placedPorts: { pos: THREE.Vector3; dir: THREE.Vector3 }[] = [];
    for (const t of this.customTracks) {
      const localPorts = TrackNetwork.getShapeLocalPorts(t.shape);
      const cosR = Math.cos(t.rotationY);
      const sinR = Math.sin(t.rotationY);
      for (const lp of localPorts) {
        const wx = t.position.x + (lp.pos.x * cosR + lp.pos.z * sinR);
        const wz = t.position.z + (-lp.pos.x * sinR + lp.pos.z * cosR);
        const dx = lp.dir.x * cosR + lp.dir.z * sinR;
        const dz = -lp.dir.x * sinR + lp.dir.z * cosR;
        placedPorts.push({
          pos: new THREE.Vector3(wx, 0, wz),
          dir: new THREE.Vector3(dx, 0, dz).normalize()
        });
      }
    }

    // 2. Filter for open ports (not connected to another port within 0.8 units)
    const openPorts: { pos: THREE.Vector3; dir: THREE.Vector3 }[] = [];
    for (let i = 0; i < placedPorts.length; i++) {
      let isConnected = false;
      for (let j = 0; j < placedPorts.length; j++) {
        if (i !== j && placedPorts[i].pos.distanceTo(placedPorts[j].pos) < 0.8) {
          isConnected = true;
          break;
        }
      }
      if (!isConnected) {
        openPorts.push(placedPorts[i]);
      }
    }

    if (openPorts.length === 0) return null;

    // 3. Test open ports within 3.6 units of pointerWorldPos
    const candLocalPorts = TrackNetwork.getShapeLocalPorts(candidateShape);
    const candidateRotations = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

    let bestResult: { position: THREE.Vector3; rotationY: number } | null = null;
    let bestDist = 3.6;

    for (const openPort of openPorts) {
      const distToPort = pointerWorldPos.distanceTo(openPort.pos);
      if (distToPort > 4.2) continue;

      for (const rot of candidateRotations) {
        const cosR = Math.cos(rot);
        const sinR = Math.sin(rot);

        for (const clp of candLocalPorts) {
          // Outward normal of candidate port transformed to world
          const candDirX = clp.dir.x * cosR + clp.dir.z * sinR;
          const candDirZ = -clp.dir.x * sinR + clp.dir.z * cosR;
          const dot = candDirX * openPort.dir.x + candDirZ * openPort.dir.z;

          // Ports connect when their outward normals point toward each other (dot ~ -1.0)
          if (dot < -0.85) {
            // Center of candidate piece
            const offX = clp.pos.x * cosR + clp.pos.z * sinR;
            const offZ = -clp.pos.x * sinR + clp.pos.z * cosR;
            const candPosX = openPort.pos.x - offX;
            const candPosZ = openPort.pos.z - offZ;

            const dist = pointerWorldPos.distanceTo(new THREE.Vector3(candPosX, 0, candPosZ));
            if (dist < bestDist) {
              bestDist = dist;
              bestResult = {
                position: new THREE.Vector3(candPosX, 0, candPosZ),
                rotationY: rot
              };
            }
          }
        }
      }
    }

    return bestResult;
  }
}
