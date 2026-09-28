import * as THREE from 'three';

export type BrickShape =
  | '1x1'
  | '1x2'
  | '2x2'
  | '2x3'
  | '2x4'
  | '1x6'
  | '2x8'
  | 'plate2x2'
  | 'plate4x4'
  | 'slope2x2'
  | 'slope2x4'
  | 'arch1x4'
  | 'finestra'
  | 'porta'
  | 'torre2x2'
  | 'fanal'
  | 'barril'
  | 'tree_pine'
  | 'tree_apple'
  | 'arbust'
  | 'flower'
  | 'minifigure'
  | 'track_straight'
  | 'track_curve'
  | 'track_crossing'
  | 'track_buffer';

export interface BrickDefinition {
  width: number; // in studs along X
  depth: number; // in studs along Z
  heightUnits: number; // standard height = 1 (1.2 units)
  nameCatalan: string;
  category: 'bloc' | 'casa' | 'vies' | 'natura';
  icon: string;
}

export const BRICK_DEFS: Record<BrickShape, BrickDefinition> = {
  // Classic Bricks
  '1x1': { width: 1, depth: 1, heightUnits: 1, nameCatalan: 'Bloc 1x1', category: 'bloc', icon: '🧱 1x1' },
  '1x2': { width: 2, depth: 1, heightUnits: 1, nameCatalan: 'Bloc 1x2', category: 'bloc', icon: '🧱 1x2' },
  '2x2': { width: 2, depth: 2, heightUnits: 1, nameCatalan: 'Bloc 2x2', category: 'bloc', icon: '🧱 2x2' },
  '2x3': { width: 3, depth: 2, heightUnits: 1, nameCatalan: 'Bloc 2x3', category: 'bloc', icon: '🧱 2x3' },
  '2x4': { width: 4, depth: 2, heightUnits: 1, nameCatalan: 'Bloc 2x4', category: 'bloc', icon: '🧱 2x4' },
  '1x6': { width: 6, depth: 1, heightUnits: 1, nameCatalan: 'Bloc 1x6', category: 'bloc', icon: '🧱 1x6' },
  '2x8': { width: 8, depth: 2, heightUnits: 1, nameCatalan: 'Viga 2x8', category: 'bloc', icon: '🧱 2x8' },

  // House & Architecture
  'plate2x2': { width: 2, depth: 2, heightUnits: 0.35, nameCatalan: 'Rajola Llisa 2x2', category: 'casa', icon: '▫️ Rajola' },
  'plate4x4': { width: 4, depth: 4, heightUnits: 0.35, nameCatalan: 'Placa 4x4', category: 'casa', icon: '⬜ Placa' },
  'slope2x2': { width: 2, depth: 2, heightUnits: 1, nameCatalan: 'Rampa 2x2', category: 'casa', icon: '📐 Rampa' },
  'slope2x4': { width: 4, depth: 2, heightUnits: 1, nameCatalan: 'Rampa Gran 2x4', category: 'casa', icon: '🏠 Sostre' },
  'arch1x4': { width: 4, depth: 1, heightUnits: 1, nameCatalan: 'Arc de Pont', category: 'casa', icon: '🌉 Arc' },
  'finestra': { width: 2, depth: 1, heightUnits: 1.2, nameCatalan: 'Finestra', category: 'casa', icon: '🪟 Finestra' },
  'porta': { width: 2, depth: 1, heightUnits: 2.0, nameCatalan: 'Porta de Casa', category: 'casa', icon: '🚪 Porta' },
  'torre2x2': { width: 2, depth: 2, heightUnits: 1.5, nameCatalan: 'Torre Rodona', category: 'casa', icon: '🏰 Torre' },
  'fanal': { width: 1, depth: 1, heightUnits: 2.2, nameCatalan: 'Fanal de Carrer', category: 'casa', icon: '💡 Fanal' },
  'barril': { width: 1, depth: 1, heightUnits: 1.1, nameCatalan: 'Barril de Càrrega', category: 'casa', icon: '🛢️ Barril' },

  // Lego City Modular Tracks
  'track_straight': { width: 4, depth: 2, heightUnits: 0.35, nameCatalan: 'Via Recta Lego City', category: 'vies', icon: '🛤️ Via Recta' },
  'track_curve': { width: 4, depth: 4, heightUnits: 0.35, nameCatalan: 'Via Corba 45°', category: 'vies', icon: '🔄 Via Corba' },
  'track_crossing': { width: 4, depth: 4, heightUnits: 0.35, nameCatalan: 'Pas a Nivell', category: 'vies', icon: '🚧 Pas a Nivell' },
  'track_buffer': { width: 2, depth: 2, heightUnits: 1.0, nameCatalan: 'Topall de Via', category: 'vies', icon: '🛑 Topall' },

  // Nature & Minifigures
  'tree_pine': { width: 2, depth: 2, heightUnits: 3, nameCatalan: 'Avet del Bosc', category: 'natura', icon: '🌲 Avet' },
  'tree_apple': { width: 3, depth: 3, heightUnits: 3.2, nameCatalan: 'Pomera Fruitera', category: 'natura', icon: '🌳 Pomera' },
  'arbust': { width: 2, depth: 2, heightUnits: 1.2, nameCatalan: 'Arbust Verd', category: 'natura', icon: '🌿 Arbust' },
  'flower': { width: 1, depth: 1, heightUnits: 0.8, nameCatalan: 'Flor Bonica', category: 'natura', icon: '🌸 Flor' },
  'minifigure': { width: 1, depth: 1, heightUnits: 1.8, nameCatalan: 'Passatger Minifigura', category: 'natura', icon: '🧑 Passatger' }
};

export class BrickFactory {
  public static readonly GRID_UNIT = 1.0;
  public static readonly BRICK_HEIGHT = 1.2;
  public static readonly STUD_RADIUS = 0.28;
  public static readonly STUD_HEIGHT = 0.20;

  private static materialCache = new Map<string, THREE.MeshStandardMaterial>();
  private static ghostMaterial: THREE.MeshStandardMaterial | null = null;
  private static invalidGhostMaterial: THREE.MeshStandardMaterial | null = null;

  // Reusable stud geometry
  private static studGeometry: THREE.CylinderGeometry | null = null;
  private static studRimGeometry: THREE.TorusGeometry | null = null;

  private static getStudGeometry(): { cylinder: THREE.CylinderGeometry; rim: THREE.TorusGeometry } {
    if (!this.studGeometry) {
      this.studGeometry = new THREE.CylinderGeometry(
        this.STUD_RADIUS,
        this.STUD_RADIUS,
        this.STUD_HEIGHT,
        18
      );
      this.studRimGeometry = new THREE.TorusGeometry(
        this.STUD_RADIUS * 0.65,
        0.03,
        8,
        18
      );
    }
    return { cylinder: this.studGeometry, rim: this.studRimGeometry! };
  }

  public static getMaterial(colorHex: string, roughness: number = 0.18, metalness: number = 0.05): THREE.MeshStandardMaterial {
    const key = `${colorHex}_${roughness}_${metalness}`;
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        roughness: roughness,
        metalness: metalness,
        envMapIntensity: 1.2,
        side: THREE.DoubleSide // Guarantee 100% visible front and back faces!
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key)!;
  }

  public static getGhostMaterial(isValid: boolean = true): THREE.MeshStandardMaterial {
    if (isValid) {
      if (!this.ghostMaterial) {
        this.ghostMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#48CAE4'),
          transparent: true,
          opacity: 0.65,
          roughness: 0.1,
          metalness: 0.1,
          emissive: new THREE.Color('#0077B6'),
          emissiveIntensity: 0.4,
          side: THREE.DoubleSide
        });
      }
      return this.ghostMaterial;
    } else {
      if (!this.invalidGhostMaterial) {
        this.invalidGhostMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#E63946'),
          transparent: true,
          opacity: 0.65,
          roughness: 0.1,
          metalness: 0.1,
          emissive: new THREE.Color('#D00000'),
          emissiveIntensity: 0.5,
          side: THREE.DoubleSide
        });
      }
      return this.invalidGhostMaterial;
    }
  }

  /**
   * Generates a standard rectangular toy brick with studs on top and hollow tube details on the bottom.
   */
  public static createStandardBrick(
    widthStuds: number,
    depthStuds: number,
    colorHex: string,
    isGhost: boolean = false,
    isValidGhost: boolean = true
  ): THREE.Group {
    const group = new THREE.Group();
    const material = isGhost ? this.getGhostMaterial(isValidGhost) : this.getMaterial(colorHex);

    const w = widthStuds * this.GRID_UNIT;
    const d = depthStuds * this.GRID_UNIT;
    const h = this.BRICK_HEIGHT;

    // Main box body with slight bevel inset
    const boxMargin = 0.02;
    const boxGeo = new THREE.BoxGeometry(w - boxMargin, h, d - boxMargin);
    const boxMesh = new THREE.Mesh(boxGeo, material);
    boxMesh.position.y = h / 2;
    boxMesh.castShadow = !isGhost;
    boxMesh.receiveShadow = !isGhost;
    group.add(boxMesh);

    // Studs on top face
    const { cylinder: studGeo, rim: studRimGeo } = this.getStudGeometry();
    const startX = -((widthStuds - 1) / 2) * this.GRID_UNIT;
    const startZ = -((depthStuds - 1) / 2) * this.GRID_UNIT;

    for (let ix = 0; ix < widthStuds; ix++) {
      for (let iz = 0; iz < depthStuds; iz++) {
        const studMesh = new THREE.Mesh(studGeo, material);
        studMesh.position.set(
          startX + ix * this.GRID_UNIT,
          h + this.STUD_HEIGHT / 2,
          startZ + iz * this.GRID_UNIT
        );
        studMesh.castShadow = !isGhost;
        studMesh.receiveShadow = !isGhost;
        group.add(studMesh);

        // Top embossed ring detail
        const rimMesh = new THREE.Mesh(studRimGeo, material);
        rimMesh.rotation.x = Math.PI / 2;
        rimMesh.position.set(
          startX + ix * this.GRID_UNIT,
          h + this.STUD_HEIGHT + 0.005,
          startZ + iz * this.GRID_UNIT
        );
        group.add(rimMesh);
      }
    }

    // Underside tubes (for 2x2 and larger)
    if (widthStuds >= 2 && depthStuds >= 2 && !isGhost) {
      const tubeRadius = 0.32;
      const tubeGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, h * 0.8, 12, 1, true);
      const tubeMat = material;
      for (let ix = 0; ix < widthStuds - 1; ix++) {
        for (let iz = 0; iz < depthStuds - 1; iz++) {
          const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
          tubeMesh.position.set(
            startX + (ix + 0.5) * this.GRID_UNIT,
            h * 0.4,
            startZ + (iz + 0.5) * this.GRID_UNIT
          );
          group.add(tubeMesh);
        }
      }
    }

    group.userData = {
      type: 'brick',
      widthStuds,
      depthStuds,
      colorHex,
      height: h
    };

    return group;
  }

  /**
   * Generates a 2x2 Smooth Flat Tile (no studs on top)
   */
  public static createFlatTile(
    widthStuds: number,
    depthStuds: number,
    colorHex: string,
    isGhost: boolean = false
  ): THREE.Group {
    const group = new THREE.Group();
    const material = isGhost ? this.getGhostMaterial(true) : this.getMaterial(colorHex, 0.12, 0.05);

    const w = widthStuds * this.GRID_UNIT - 0.03;
    const d = depthStuds * this.GRID_UNIT - 0.03;
    const h = 0.38;

    const tileGeo = new THREE.BoxGeometry(w, h, d);
    const tileMesh = new THREE.Mesh(tileGeo, material);
    tileMesh.position.y = h / 2;
    tileMesh.castShadow = !isGhost;
    tileMesh.receiveShadow = !isGhost;
    group.add(tileMesh);

    group.userData = { type: 'tile', widthStuds, depthStuds, height: h };
    return group;
  }

  /**
   * Generates a 4x4 Thin Baseplate Tile with studs
   */
  public static createPlate(
    widthStuds: number,
    depthStuds: number,
    colorHex: string,
    isGhost: boolean = false
  ): THREE.Group {
    const group = new THREE.Group();
    const material = isGhost ? this.getGhostMaterial(true) : this.getMaterial(colorHex);

    const w = widthStuds * this.GRID_UNIT - 0.02;
    const d = depthStuds * this.GRID_UNIT - 0.02;
    const h = 0.38; // Plate height is 1/3 of a full brick

    const plateGeo = new THREE.BoxGeometry(w, h, d);
    const plate = new THREE.Mesh(plateGeo, material);
    plate.position.y = h / 2;
    plate.castShadow = !isGhost;
    plate.receiveShadow = !isGhost;
    group.add(plate);

    // Studs on top face
    const { cylinder: studGeo } = this.getStudGeometry();
    const startX = -((widthStuds - 1) / 2) * this.GRID_UNIT;
    const startZ = -((depthStuds - 1) / 2) * this.GRID_UNIT;

    for (let ix = 0; ix < widthStuds; ix++) {
      for (let iz = 0; iz < depthStuds; iz++) {
        const stud = new THREE.Mesh(studGeo, material);
        stud.position.set(startX + ix * this.GRID_UNIT, h + this.STUD_HEIGHT / 2, startZ + iz * this.GRID_UNIT);
        group.add(stud);
      }
    }

    group.userData = { type: 'plate', widthStuds, depthStuds, height: h };
    return group;
  }

  /**
   * Generates a 2x2 or 2x4 roof slope brick
   */
  public static createSlopeBrick(
    widthStuds: number,
    depthStuds: number,
    colorHex: string,
    isGhost: boolean = false
  ): THREE.Group {
    const group = new THREE.Group();
    const material = isGhost ? this.getGhostMaterial(true) : this.getMaterial(colorHex);

    const w = widthStuds * this.GRID_UNIT;
    const d = depthStuds * this.GRID_UNIT;
    const h = this.BRICK_HEIGHT;

    const shape = new THREE.Shape();
    shape.moveTo(-d / 2, 0);
    shape.lineTo(d / 2, 0);
    shape.lineTo(d / 2, h * 0.3);
    shape.lineTo(-d / 4, h);
    shape.lineTo(-d / 2, h);
    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: w - 0.02,
      bevelEnabled: false
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.y = h / 2;
    mesh.rotation.y = Math.PI / 2;
    mesh.castShadow = !isGhost;
    mesh.receiveShadow = !isGhost;
    group.add(mesh);

    // Studs on the flat top ridge
    const { cylinder: studGeo } = this.getStudGeometry();
    const startX = -((widthStuds - 1) / 2) * this.GRID_UNIT;
    for (let ix = 0; ix < widthStuds; ix++) {
      const studMesh = new THREE.Mesh(studGeo, material);
      studMesh.position.set(
        startX + ix * this.GRID_UNIT,
        h + this.STUD_HEIGHT / 2,
        -d * 0.35
      );
      studMesh.castShadow = !isGhost;
      group.add(studMesh);
    }

    group.userData = { type: 'slope', widthStuds, depthStuds, height: h };
    return group;
  }

  /**
   * Generates a 1x4 Bridge Arch Piece
   */
  public static createArchBrick(colorHex: string, isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const material = isGhost ? this.getGhostMaterial(true) : this.getMaterial(colorHex);

    const w = 4.0 * this.GRID_UNIT - 0.02;
    const d = 1.0 * this.GRID_UNIT - 0.02;
    const h = this.BRICK_HEIGHT;

    // Solid top bar
    const topGeo = new THREE.BoxGeometry(w, 0.45, d);
    const topMesh = new THREE.Mesh(topGeo, material);
    topMesh.position.y = h - 0.225;
    group.add(topMesh);

    // Two side pillars
    const pillarGeo = new THREE.BoxGeometry(0.85, h - 0.45, d);
    const leftP = new THREE.Mesh(pillarGeo, material);
    leftP.position.set(-w / 2 + 0.425, (h - 0.45) / 2, 0);
    const rightP = new THREE.Mesh(pillarGeo, material);
    rightP.position.set(w / 2 - 0.425, (h - 0.45) / 2, 0);
    group.add(leftP, rightP);

    // Arch curve under top
    const archCurveGeo = new THREE.CylinderGeometry(1.2, 1.2, d, 16, 1, false, 0, Math.PI);
    const archMesh = new THREE.Mesh(archCurveGeo, material);
    archMesh.rotation.x = Math.PI / 2;
    archMesh.position.set(0, (h - 0.45), 0);
    archMesh.scale.set(0.95, 0.4, 1);
    group.add(archMesh);

    // Studs on top (4 studs)
    const { cylinder: studGeo } = this.getStudGeometry();
    for (let i = 0; i < 4; i++) {
      const stud = new THREE.Mesh(studGeo, material);
      stud.position.set(-1.5 + i * 1.0, h + this.STUD_HEIGHT / 2, 0);
      group.add(stud);
    }

    group.userData = { type: 'arch', widthStuds: 4, depthStuds: 1, height: h };
    return group;
  }

  /**
   * Generates a 1x2 Window with glowing glass
   */
  public static createWindow(colorHex: string, isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const frameMat = isGhost ? this.getGhostMaterial(true) : this.getMaterial(colorHex);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xBAE6FD,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
      metalness: 0.2,
      emissive: 0x38BDF8,
      emissiveIntensity: 0.3
    });

    const w = 2.0;
    const d = 1.0;
    const h = 1.5;

    // Window frame
    const frameGeo = new THREE.BoxGeometry(w, h, d);
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = h / 2;
    group.add(frame);

    // Glass cutout pane
    const glassGeo = new THREE.BoxGeometry(w * 0.75, h * 0.75, 0.1);
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, h / 2, 0);
    group.add(glass);

    // 2 top studs
    const { cylinder: studGeo } = this.getStudGeometry();
    [-0.5, 0.5].forEach((x) => {
      const stud = new THREE.Mesh(studGeo, frameMat);
      stud.position.set(x, h + this.STUD_HEIGHT / 2, 0);
      group.add(stud);
    });

    group.userData = { type: 'finestra', widthStuds: 2, depthStuds: 1, height: h };
    return group;
  }

  /**
   * Generates a 1x2 Door with door frame and golden handle
   */
  public static createDoor(colorHex: string, isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const frameMat = this.getMaterial('#F4F4F4'); // White door frame
    const doorMat = isGhost ? this.getGhostMaterial(true) : this.getMaterial(colorHex);
    const goldMat = this.getMaterial('#FAC80A', 0.2, 0.5);

    const w = 2.0;
    const d = 1.0;
    const h = 2.4;

    // Outer door frame
    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, d), frameMat);
    topFrame.position.y = h - 0.15;
    const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(0.3, h - 0.3, d), frameMat);
    leftFrame.position.set(-w / 2 + 0.15, (h - 0.3) / 2, 0);
    const rightFrame = leftFrame.clone();
    rightFrame.position.x = w / 2 - 0.15;
    group.add(topFrame, leftFrame, rightFrame);

    // Door panel inside
    const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(w - 0.6, h - 0.3, 0.3), doorMat);
    doorPanel.position.set(0, (h - 0.3) / 2, 0);
    doorPanel.castShadow = true;
    group.add(doorPanel);

    // Golden handle knob
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), goldMat);
    knob.position.set(0.38, 1.1, 0.2);
    group.add(knob);

    // Top studs
    const { cylinder: studGeo } = this.getStudGeometry();
    [-0.5, 0.5].forEach((x) => {
      const stud = new THREE.Mesh(studGeo, frameMat);
      stud.position.set(x, h + this.STUD_HEIGHT / 2, 0);
      group.add(stud);
    });

    group.userData = { type: 'porta', widthStuds: 2, depthStuds: 1, height: h };
    return group;
  }

  /**
   * Generates a 2x2 Round Cylinder Tower Brick
   */
  public static createRoundTower(colorHex: string, isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const material = isGhost ? this.getGhostMaterial(true) : this.getMaterial(colorHex);

    const radius = 0.95;
    const h = 1.5;
    const cylGeo = new THREE.CylinderGeometry(radius, radius, h, 20);
    const cyl = new THREE.Mesh(cylGeo, material);
    cyl.position.y = h / 2;
    cyl.castShadow = true;
    cyl.receiveShadow = true;
    group.add(cyl);

    // 4 studs on top
    const { cylinder: studGeo } = this.getStudGeometry();
    [-0.45, 0.45].forEach((x) => {
      [-0.45, 0.45].forEach((z) => {
        const stud = new THREE.Mesh(studGeo, material);
        stud.position.set(x, h + this.STUD_HEIGHT / 2, z);
        group.add(stud);
      });
    });

    group.userData = { type: 'torre2x2', widthStuds: 2, depthStuds: 2, height: h };
    return group;
  }

  /**
   * Generates a City Street Light / Signal Lamp
   */
  public static createStreetLight(): THREE.Group {
    const group = new THREE.Group();
    const blackMat = this.getMaterial('#1B1B1B', 0.3, 0.1);
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0xFEF08A,
      emissive: 0xFDE047,
      emissiveIntensity: 0.9,
      roughness: 0.1
    });

    // Base post
    const postGeo = new THREE.CylinderGeometry(0.1, 0.14, 2.4, 8);
    const post = new THREE.Mesh(postGeo, blackMat);
    post.position.y = 1.2;
    group.add(post);

    // Lamp head
    const headGeo = new THREE.ConeGeometry(0.35, 0.25, 8);
    const head = new THREE.Mesh(headGeo, blackMat);
    head.position.set(0.3, 2.4, 0);
    head.rotation.z = Math.PI;

    // Glowing bulb
    const bulbGeo = new THREE.SphereGeometry(0.18, 12, 10);
    const bulb = new THREE.Mesh(bulbGeo, glowMat);
    bulb.position.set(0.3, 2.25, 0);
    group.add(head, bulb);

    group.userData = { type: 'fanal', widthStuds: 1, depthStuds: 1, height: 2.5 };
    return group;
  }

  /**
   * Generates a Cargo Barrel with studs
   */
  public static createCargoBarrel(colorHex: string = '#6F4E37'): THREE.Group {
    const group = new THREE.Group();
    const woodMat = this.getMaterial(colorHex, 0.4, 0.1);
    const bandMat = this.getMaterial('#1B1B1B', 0.3, 0.4);

    const barrelGeo = new THREE.CylinderGeometry(0.38, 0.34, 1.0, 14);
    const barrel = new THREE.Mesh(barrelGeo, woodMat);
    barrel.position.y = 0.5;
    barrel.castShadow = true;
    group.add(barrel);

    // Top stud
    const { cylinder: studGeo } = this.getStudGeometry();
    const stud = new THREE.Mesh(studGeo, woodMat);
    stud.position.set(0, 1.0 + this.STUD_HEIGHT / 2, 0);
    group.add(stud);

    // Black metal hoops
    [-0.25, 0.25].forEach((yOff) => {
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.03, 6, 16), bandMat);
      hoop.rotation.x = Math.PI / 2;
      hoop.position.y = 0.5 + yOff;
      group.add(hoop);
    });

    group.userData = { type: 'barril', widthStuds: 1, depthStuds: 1, height: 1.1 };
    return group;
  }

  /**
   * Generates a Deciduous Apple Tree (round leafy treetop with red apples!)
   */
  public static createAppleTree(): THREE.Group {
    const group = new THREE.Group();
    const trunkMat = this.getMaterial('#5D4037', 0.6, 0.05);
    const leavesMat = this.getMaterial('#2E7D32', 0.3, 0.05);
    const appleMat = this.getMaterial('#D11A2A', 0.15, 0.05);

    // Trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 1.4, 8), trunkMat);
    trunk.position.y = 0.7;
    trunk.castShadow = true;
    group.add(trunk);

    // Round leafy crown (cluster of spheres)
    const crownCenter = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4, 1), leavesMat);
    crownCenter.position.y = 2.2;
    crownCenter.castShadow = true;
    group.add(crownCenter);

    // Red Apples dotted around crown
    const applePositions = [
      { x: 0.9, y: 2.1, z: 0.6 },
      { x: -0.8, y: 2.3, z: 0.7 },
      { x: 0.3, y: 2.5, z: -1.0 },
      { x: -0.7, y: 1.8, z: -0.8 },
      { x: 0.8, y: 1.9, z: -0.6 }
    ];

    applePositions.forEach((p) => {
      const apple = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), appleMat);
      apple.position.set(p.x, p.y, p.z);
      group.add(apple);
    });

    group.userData = { type: 'tree_apple', widthStuds: 3, depthStuds: 3, height: 3.2 };
    return group;
  }

  /**
   * Generates a Garden Shrub / Bush
   */
  public static createBush(): THREE.Group {
    const group = new THREE.Group();
    const leavesMat = this.getMaterial('#237841', 0.35, 0.05);
    const flowerMat = this.getMaterial('#FAC80A', 0.2, 0.05);

    const mainGeo = new THREE.DodecahedronGeometry(0.7, 1);
    const bush = new THREE.Mesh(mainGeo, leavesMat);
    bush.position.y = 0.55;
    bush.scale.set(1.4, 0.8, 1.2);
    bush.castShadow = true;
    group.add(bush);

    // Small flower dots on bush
    [
      { x: 0.4, y: 0.8, z: 0.3 },
      { x: -0.5, y: 0.75, z: -0.2 },
      { x: 0.1, y: 0.9, z: -0.4 }
    ].forEach((pos) => {
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), flowerMat);
      f.position.set(pos.x, pos.y, pos.z);
      group.add(f);
    });

    group.userData = { type: 'arbust', widthStuds: 2, depthStuds: 2, height: 1.1 };
    return group;
  }

  /**
   * Generates a miniature pine tree
   */
  public static createPineTree(colorHex: string = '#237841'): THREE.Group {
    const group = new THREE.Group();
    const trunkMat = this.getMaterial('#5D4037', 0.7, 0.0);
    const foliageMat = this.getMaterial(colorHex, 0.25, 0.02);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 1.2, 10), trunkMat);
    trunk.position.y = 0.6;
    trunk.castShadow = true;
    group.add(trunk);

    const layers = [
      { rBot: 1.4, rTop: 0.6, h: 0.9, y: 1.2 },
      { rBot: 1.1, rTop: 0.35, h: 0.85, y: 1.85 },
      { rBot: 0.75, rTop: 0.05, h: 0.8, y: 2.45 }
    ];

    layers.forEach((layer) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(layer.rBot, layer.h, 12), foliageMat);
      cone.position.y = layer.y;
      cone.castShadow = true;
      group.add(cone);
    });

    group.userData = { type: 'tree_pine', widthStuds: 2, depthStuds: 2, height: 3.0 };
    return group;
  }

  /**
   * Generates a flower
   */
  public static createFlower(colorHex: string = '#FAC80A'): THREE.Group {
    const group = new THREE.Group();
    const stemMat = this.getMaterial('#237841', 0.3, 0.05);
    const petalMat = this.getMaterial(colorHex, 0.2, 0.05);
    const centerMat = this.getMaterial('#FAC80A', 0.2, 0.05);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8), stemMat);
    stem.position.y = 0.25;
    group.add(stem);

    const petalGeo = new THREE.SphereGeometry(0.18, 10, 8);
    petalGeo.scale(1, 0.4, 1.4);
    for (let i = 0; i < 4; i++) {
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.set(Math.cos((i * Math.PI) / 2) * 0.22, 0.52, Math.sin((i * Math.PI) / 2) * 0.22);
      petal.rotation.y = (i * Math.PI) / 2;
      group.add(petal);
    }

    const center = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), centerMat);
    center.position.y = 0.54;
    group.add(center);

    group.userData = { type: 'flower', widthStuds: 1, depthStuds: 1, height: 0.65 };
    return group;
  }

  /**
   * Generates Antoni / Passenger Minifigure
   */
  public static createMinifigure(): THREE.Group {
    const group = new THREE.Group();
    const skinMat = this.getMaterial('#FAC80A', 0.15, 0.05);
    const uniformMat = this.getMaterial('#0055BF', 0.2, 0.05);
    const capMat = this.getMaterial('#D11A2A', 0.2, 0.05);
    const blackMat = this.getMaterial('#1B1B1B', 0.3, 0.1);

    // Legs
    const hips = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.25, 0.35), uniformMat);
    hips.position.y = 0.55;
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.45, 0.34), uniformMat);
    leftLeg.position.set(-0.16, 0.25, 0);
    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.45, 0.34), uniformMat);
    rightLeg.position.set(0.16, 0.25, 0);
    group.add(hips, leftLeg, rightLeg);

    // Torso
    const torsoGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.55, 4);
    torsoGeo.rotateY(Math.PI / 4);
    const torso = new THREE.Mesh(torsoGeo, uniformMat);
    torso.position.y = 0.95;
    torso.scale.set(1.1, 1, 0.7);
    group.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.35, 16), skinMat);
    head.position.y = 1.35;

    // Smiling face eyes
    const eyeMat = blackMat;
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), eyeMat);
    eyeL.position.set(-0.08, 1.38, 0.22);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.08;
    group.add(head, eyeL, eyeR);

    // Cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.16, 16), capMat);
    cap.position.y = 1.55;
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.18), blackMat);
    visor.position.set(0, 1.5, 0.18);
    visor.rotation.x = 0.2;
    group.add(cap, visor);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8);
    const handGeo = new THREE.TorusGeometry(0.08, 0.03, 6, 12, Math.PI * 1.5);
    [-1, 1].forEach((side) => {
      const arm = new THREE.Mesh(armGeo, uniformMat);
      arm.position.set(side * 0.42, 0.92, 0.05);
      arm.rotation.z = -side * 0.3;
      arm.rotation.x = 0.4;
      const hand = new THREE.Mesh(handGeo, skinMat);
      hand.position.set(side * 0.48, 0.72, 0.2);
      hand.rotation.y = side * Math.PI / 2;
      group.add(arm, hand);
    });

    group.userData = { type: 'minifigure', widthStuds: 1, depthStuds: 1, height: 1.8 };
    return group;
  }

  /**
   * Generates authentic Lego City Straight Track Piece (4 studs long)
   */
  public static createLegoCityStraightTrack(isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    // Lego City Dark Bluish Grey sleepers
    const sleeperMat = isGhost ? this.getGhostMaterial(true) : this.getMaterial('#475569', 0.4, 0.1);
    // Polished Silver steel rails
    const railMat = isGhost ? this.getGhostMaterial(true) : this.getMaterial('#CBD5E1', 0.15, 0.85);

    const length = 4.0;
    const gauge = 1.3;
    const sleeperWidth = 2.4;
    const sleeperH = 0.25;

    // 4 Lego City sleepers with molded stud connectors
    const numSleepers = 4;
    const sleeperGeo = new THREE.BoxGeometry(sleeperWidth, sleeperH, 0.5);
    const { cylinder: studGeo } = this.getStudGeometry();

    for (let i = 0; i < numSleepers; i++) {
      const zPos = -1.5 + i * 1.0;
      const sMesh = new THREE.Mesh(sleeperGeo, sleeperMat);
      sMesh.position.set(0, sleeperH / 2, zPos);
      sMesh.castShadow = !isGhost;
      sMesh.receiveShadow = !isGhost;
      group.add(sMesh);

      // 4 studs on each sleeper (2 on left edge, 2 on right edge)
      if (!isGhost) {
        [-0.95, 0.95].forEach((xPos) => {
          const st = new THREE.Mesh(studGeo, sleeperMat);
          st.scale.set(0.65, 0.65, 0.65);
          st.position.set(xPos, sleeperH + this.STUD_HEIGHT * 0.32, zPos);
          group.add(st);
        });
      }
    }

    // Two Silver Rails with authentic raised I-beam profile
    const railGeo = new THREE.BoxGeometry(0.12, 0.22, length);
    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(-gauge / 2, sleeperH + 0.11, 0);
    leftRail.castShadow = !isGhost;

    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(gauge / 2, sleeperH + 0.11, 0);
    rightRail.castShadow = !isGhost;

    group.add(leftRail, rightRail);

    // Track connecting clips on ends
    const clipMat = sleeperMat;
    const clipGeo = new THREE.BoxGeometry(0.4, 0.15, 0.2);
    const clip1 = new THREE.Mesh(clipGeo, clipMat);
    clip1.position.set(-0.6, 0.08, -length / 2);
    const clip2 = new THREE.Mesh(clipGeo, clipMat);
    clip2.position.set(0.6, 0.08, length / 2);
    group.add(clip1, clip2);

    group.userData = { type: 'track_straight', widthStuds: 4, depthStuds: 2, height: 0.47 };
    return group;
  }

  /**
   * Generates Lego City 45-degree Curved Track Piece
   */
  public static createLegoCityCurvedTrack(isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const sleeperMat = isGhost ? this.getGhostMaterial(true) : this.getMaterial('#475569', 0.4, 0.1);
    const railMat = isGhost ? this.getGhostMaterial(true) : this.getMaterial('#CBD5E1', 0.15, 0.85);

    const radius = 6.0;
    const gauge = 1.3;
    const angle = Math.PI / 4; // 45 degrees
    const numSleepers = 5;

    // Sleepers along the arc
    for (let i = 0; i < numSleepers; i++) {
      const a = (i / (numSleepers - 1)) * angle - angle / 2;
      const sMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.25, 0.5), sleeperMat);
      sMesh.position.set(Math.sin(a) * radius, 0.125, Math.cos(a) * radius - radius + 2.0);
      sMesh.rotation.y = -a;
      sMesh.castShadow = !isGhost;
      group.add(sMesh);
    }

    // Curved rails
    const rIn = radius - gauge / 2;
    const rOut = radius + gauge / 2;
    const railShape = new THREE.BoxGeometry(0.12, 0.22, 1.0);

    for (let i = 0; i < 8; i++) {
      const a = (i / 7) * angle - angle / 2;

      const rLeft = new THREE.Mesh(railShape, railMat);
      rLeft.position.set(Math.sin(a) * rIn, 0.36, Math.cos(a) * rIn - radius + 2.0);
      rLeft.rotation.y = -a;

      const rRight = new THREE.Mesh(railShape, railMat);
      rRight.position.set(Math.sin(a) * rOut, 0.36, Math.cos(a) * rOut - radius + 2.0);
      rRight.rotation.y = -a;

      group.add(rLeft, rRight);
    }

    group.userData = { type: 'track_curve', widthStuds: 4, depthStuds: 4, height: 0.47 };
    return group;
  }

  /**
   * Generates Level Crossing with road deck and striped barriers
   */
  public static createLevelCrossing(isGhost: boolean = false): THREE.Group {
    const group = this.createLegoCityStraightTrack(isGhost);
    const roadMat = this.getMaterial('#6F4E37', 0.5, 0.05); // Wood planks
    const redMat = this.getMaterial('#D11A2A', 0.2, 0.05);
    const whiteMat = this.getMaterial('#F4F4F4', 0.2, 0.05);

    // Wooden roadway crossing between rails
    const deckGeo = new THREE.BoxGeometry(1.15, 0.22, 2.5);
    const deck = new THREE.Mesh(deckGeo, roadMat);
    deck.position.set(0, 0.22, 0);
    deck.receiveShadow = true;
    group.add(deck);

    // Two Striped Crossing Barriers (left and right)
    [-1.6, 1.6].forEach((xSide) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 8), this.getMaterial('#1B1B1B'));
      post.position.set(xSide, 0.6, 0);
      group.add(post);

      // Red and white striped arm
      const arm = new THREE.Group();
      arm.position.set(xSide, 1.1, 0);
      for (let s = 0; s < 4; s++) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.08), s % 2 === 0 ? redMat : whiteMat);
        stripe.position.x = (xSide > 0 ? -1 : 1) * (0.2 + s * 0.3);
        arm.add(stripe);
      }
      group.add(arm);
    });

    group.userData = { type: 'track_crossing', widthStuds: 4, depthStuds: 4, height: 1.2 };
    return group;
  }

  /**
   * Generates Railway Buffer Stop (Topall de Via)
   */
  public static createBufferStop(isGhost: boolean = false): THREE.Group {
    const group = this.createLegoCityStraightTrack(isGhost);
    const redMat = this.getMaterial('#D11A2A', 0.2, 0.05);
    const blackMat = this.getMaterial('#1B1B1B', 0.3, 0.1);
    const yellowMat = this.getMaterial('#FAC80A', 0.2, 0.4);

    // A-frame bumper
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.4), blackMat);
    frame.position.set(0, 0.65, 1.2);
    group.add(frame);

    // Two Red Buffer Pads
    [-0.55, 0.55].forEach((x) => {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.15, 12), redMat);
      pad.rotation.x = Math.PI / 2;
      pad.position.set(x, 0.65, 1.4);
      group.add(pad);
    });

    // Yellow warning chevron plate
    const warning = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.04, 16), yellowMat);
    warning.rotation.x = Math.PI / 2;
    warning.position.set(0, 0.65, 1.42);
    group.add(warning);

    group.userData = { type: 'track_buffer', widthStuds: 2, depthStuds: 2, height: 1.0 };
    return group;
  }

  /**
   * Generates a complete 3D procedural Toy Brick Steam Locomotive
   */
  public static createLocomotiveGroup(): {
    root: THREE.Group;
    wheels: THREE.Mesh[];
    rods: THREE.Mesh[];
    chimneyTop: THREE.Vector3;
    headlight: THREE.SpotLight;
  } {
    const root = new THREE.Group();
    const wheels: THREE.Mesh[] = [];
    const rods: THREE.Mesh[] = [];

    const redMat = this.getMaterial('#D11A2A', 0.18, 0.05);     // Vermell
    const blackMat = this.getMaterial('#1B1B1B', 0.2, 0.1);     // Negre
    const goldMat = this.getMaterial('#FAC80A', 0.15, 0.6);     // Brass/Gold
    const greyMat = this.getMaterial('#8A9299', 0.3, 0.6);      // Steel Grey
    const blueMat = this.getMaterial('#0055BF', 0.18, 0.05);    // Blau Conductor

    // 1. Wheeled Base Chassis (Black plate)
    const chassisLength = 5.2;
    const chassisWidth = 2.0;
    const chassisHeight = 0.35;
    const chassisGeo = new THREE.BoxGeometry(chassisWidth, chassisHeight, chassisLength);
    const chassis = new THREE.Mesh(chassisGeo, blackMat);
    chassis.position.y = 0.65;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    root.add(chassis);

    // Front Cowcatcher (Lleva-obstacles) in Red
    const cowShape = new THREE.Shape();
    cowShape.moveTo(-0.9, -0.2);
    cowShape.lineTo(0.9, -0.2);
    cowShape.lineTo(0.65, 0.35);
    cowShape.lineTo(-0.65, 0.35);
    cowShape.closePath();
    const cowExtrude = new THREE.ExtrudeGeometry(cowShape, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04 });
    cowExtrude.center();
    const cowcatcher = new THREE.Mesh(cowExtrude, redMat);
    cowcatcher.position.set(0, 0.45, chassisLength / 2 + 0.22);
    cowcatcher.castShadow = true;
    root.add(cowcatcher);

    // 2. Wheels: 6 Large Flanged Train Wheels (3 per side)
    const wheelRadius = 0.52;
    const wheelThick = 0.18;
    const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThick, 20);
    const flangeGeo = new THREE.CylinderGeometry(wheelRadius * 1.15, wheelRadius * 1.15, 0.04, 20);

    const wheelPositionsZ = [-1.5, 0.0, 1.5];

    [-1, 1].forEach((side) => {
      const posX = side * (chassisWidth / 2 + wheelThick / 2);

      wheelPositionsZ.forEach((posZ) => {
        const wheelGroup = new THREE.Group();
        wheelGroup.position.set(posX, 0.52, posZ);

        const wheelMesh = new THREE.Mesh(wheelGeo, redMat);
        wheelMesh.rotation.z = Math.PI / 2;
        wheelMesh.castShadow = true;
        wheelGroup.add(wheelMesh);

        // Flange ring
        const flangeMesh = new THREE.Mesh(flangeGeo, redMat);
        flangeMesh.rotation.z = Math.PI / 2;
        flangeMesh.position.x = side * (wheelThick / 2);
        wheelGroup.add(flangeMesh);

        // Center hub & counterweight in Gold
        const hubGeo = new THREE.CylinderGeometry(0.18, 0.18, wheelThick + 0.05, 12);
        const hub = new THREE.Mesh(hubGeo, goldMat);
        hub.rotation.z = Math.PI / 2;
        wheelGroup.add(hub);

        root.add(wheelGroup);
        wheels.push(wheelGroup as unknown as THREE.Mesh);
      });

      // Side connecting rod (biela)
      const rodGeo = new THREE.BoxGeometry(0.08, 0.12, 3.2);
      const rod = new THREE.Mesh(rodGeo, greyMat);
      rod.position.set(side * (chassisWidth / 2 + wheelThick + 0.05), 0.35, 0);
      rod.castShadow = true;
      root.add(rod);
      rods.push(rod);
    });

    // 3. Cylindrical Steam Boiler (Caldera)
    const boilerRadius = 0.78;
    const boilerLength = 2.8;
    const boilerGeo = new THREE.CylinderGeometry(boilerRadius, boilerRadius, boilerLength, 24);
    const boiler = new THREE.Mesh(boilerGeo, blackMat);
    boiler.rotation.x = Math.PI / 2;
    boiler.position.set(0, 0.65 + chassisHeight / 2 + boilerRadius, 0.5);
    boiler.castShadow = true;
    boiler.receiveShadow = true;
    root.add(boiler);

    // Golden brass boiler bands
    [-0.8, 0.0, 0.8].forEach((zOff) => {
      const bandGeo = new THREE.TorusGeometry(boilerRadius + 0.02, 0.04, 8, 24);
      const band = new THREE.Mesh(bandGeo, goldMat);
      band.position.set(0, boiler.position.y, boiler.position.z + zOff);
      root.add(band);
    });

    // Boiler front dome
    const domeGeo = new THREE.SphereGeometry(boilerRadius, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(domeGeo, blackMat);
    dome.rotation.x = Math.PI / 2;
    dome.position.set(0, boiler.position.y, boiler.position.z + boilerLength / 2);
    root.add(dome);

    // Golden Steam Dome on top of boiler
    const steamDomeGeo = new THREE.CylinderGeometry(0.3, 0.38, 0.45, 16);
    const steamDome = new THREE.Mesh(steamDomeGeo, goldMat);
    steamDome.position.set(0, boiler.position.y + boilerRadius + 0.18, 0.2);
    steamDome.castShadow = true;
    root.add(steamDome);

    // Whistle on boiler dome
    const whistleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8);
    const whistle = new THREE.Mesh(whistleGeo, goldMat);
    whistle.position.set(0.18, boiler.position.y + boilerRadius + 0.4, 0.1);
    root.add(whistle);

    // 4. Smokestack (Xemeneia)
    const chimneyY = boiler.position.y + boilerRadius + 0.45;
    const chimneyZ = boiler.position.z + boilerLength / 2 - 0.4;
    const chimneyGeo = new THREE.CylinderGeometry(0.32, 0.22, 0.75, 16);
    const chimney = new THREE.Mesh(chimneyGeo, blackMat);
    chimney.position.set(0, chimneyY, chimneyZ);
    chimney.castShadow = true;

    // Golden rim atop chimney
    const rimGeo = new THREE.TorusGeometry(0.32, 0.05, 8, 18);
    const chimneyRim = new THREE.Mesh(rimGeo, goldMat);
    chimneyRim.rotation.x = Math.PI / 2;
    chimneyRim.position.set(0, chimneyY + 0.38, chimneyZ);
    root.add(chimney, chimneyRim);

    const chimneyTop = new THREE.Vector3(0, chimneyY + 0.45, chimneyZ);

    // 5. Driver Cabin (Cabina de conducció) in Blue
    const cabinWidth = 2.0;
    const cabinHeight = 1.7;
    const cabinLength = 1.8;
    const cabinZ = -1.5;

    const cabinWallGeo = new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinLength);
    const cabin = new THREE.Mesh(cabinWallGeo, blueMat);
    cabin.position.set(0, 0.65 + chassisHeight / 2 + cabinHeight / 2, cabinZ);
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    root.add(cabin);

    // Cabin Curved Roof in Red
    const roofGeo = new THREE.CylinderGeometry(1.2, 1.2, cabinLength + 0.25, 18, 1, false, 0, Math.PI);
    const roof = new THREE.Mesh(roofGeo, redMat);
    roof.rotation.z = Math.PI / 2;
    roof.rotation.y = Math.PI / 2;
    roof.position.set(0, cabin.position.y + cabinHeight / 2 + 0.05, cabinZ);
    roof.castShadow = true;
    root.add(roof);

    // Windows
    const winGeo = new THREE.BoxGeometry(0.04, 0.5, 0.65);
    const winMat = this.getMaterial('#FAC80A', 0.1, 0.1);
    const leftWin = new THREE.Mesh(winGeo, winMat);
    leftWin.position.set(-cabinWidth / 2 - 0.01, cabin.position.y + 0.2, cabinZ);
    const rightWin = leftWin.clone();
    rightWin.position.x = cabinWidth / 2 + 0.01;
    root.add(leftWin, rightWin);

    // Antoni inside cabin
    const driver = this.createMinifigure();
    driver.scale.set(0.75, 0.75, 0.75);
    driver.position.set(0, cabin.position.y - cabinHeight / 2 + 0.05, cabinZ + 0.1);
    root.add(driver);

    // 6. Brass Headlight Lantern with real Spotlight!
    const lanternGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.35, 16);
    const lantern = new THREE.Mesh(lanternGeo, goldMat);
    lantern.rotation.x = Math.PI / 2;
    lantern.position.set(0, boiler.position.y + 0.1, boiler.position.z + boilerLength / 2 + 0.2);
    root.add(lantern);

    const lensGeo = new THREE.CircleGeometry(0.22, 16);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0xfff0aa, side: THREE.DoubleSide });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(0, lantern.position.y, lantern.position.z + 0.18);
    root.add(lens);

    // Spotlight pointing ahead along Z+
    const spotLight = new THREE.SpotLight(0xffe57f, 3.5, 30, Math.PI / 6, 0.4, 1.2);
    spotLight.position.set(0, lantern.position.y, lantern.position.z + 0.2);
    spotLight.target.position.set(0, 0.5, lantern.position.z + 10);
    root.add(spotLight);
    root.add(spotLight.target);

    return {
      root,
      wheels,
      rods,
      chimneyTop,
      headlight: spotLight
    };
  }

  /**
   * Generates a scenic toy railway station platform
   */
  public static createStationPlatform(): THREE.Group {
    const group = new THREE.Group();
    const platMat = this.getMaterial('#8A9299', 0.4, 0.1);
    const woodMat = this.getMaterial('#6F4E37', 0.5, 0.05);
    const redMat = this.getMaterial('#D11A2A', 0.2, 0.05);
    const whiteMat = this.getMaterial('#F4F4F4', 0.2, 0.05);
    const goldMat = this.getMaterial('#FAC80A', 0.2, 0.4);

    const pWidth = 3.5;
    const pLength = 12.0;
    const pHeight = 0.6;
    const pGeo = new THREE.BoxGeometry(pWidth, pHeight, pLength);
    const platform = new THREE.Mesh(pGeo, platMat);
    platform.position.y = pHeight / 2;
    platform.castShadow = true;
    platform.receiveShadow = true;
    group.add(platform);

    const roofPillars = [-4.0, 0.0, 4.0];
    const pillarGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.5, 8);
    roofPillars.forEach((zPos) => {
      const pillar = new THREE.Mesh(pillarGeo, woodMat);
      pillar.position.set(-0.8, pHeight + 1.25, zPos);
      pillar.castShadow = true;
      group.add(pillar);
    });

    const roofGeo = new THREE.BoxGeometry(2.8, 0.2, 10.0);
    const roof = new THREE.Mesh(roofGeo, redMat);
    roof.position.set(-0.8, pHeight + 2.55, 0);
    roof.rotation.x = 0.05;
    roof.castShadow = true;
    group.add(roof);

    const signBoardGeo = new THREE.BoxGeometry(2.4, 0.6, 0.1);
    const signBoard = new THREE.Mesh(signBoardGeo, whiteMat);
    signBoard.position.set(-0.8, pHeight + 2.1, 0);
    signBoard.castShadow = true;
    group.add(signBoard);

    const clockGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 16);
    const clock = new THREE.Mesh(clockGeo, goldMat);
    clock.rotation.x = Math.PI / 2;
    clock.position.set(-0.8, pHeight + 2.7, 4.5);
    group.add(clock);

    const benchSeatGeo = new THREE.BoxGeometry(0.6, 0.1, 2.0);
    const benchSeat = new THREE.Mesh(benchSeatGeo, woodMat);
    benchSeat.position.set(-1.0, pHeight + 0.35, -2.0);
    benchSeat.castShadow = true;
    group.add(benchSeat);

    group.userData = { type: 'station' };
    return group;
  }
}
