import * as THREE from 'three';

export type BrickShape =
  | '1x1'
  | '1x2'
  | '2x2'
  | '2x3'
  | '2x4'
  | '1x4'
  | '1x6'
  | '1x8'
  | '2x6'
  | '2x8'
  | 'corner2x2'
  | 'cyl1x1'
  | 'cone1x1'
  | 'plate2x2'
  | 'plate4x4'
  | 'slope2x2'
  | 'slope2x4'
  | 'arch1x4'
  | 'finestra'
  | 'porta'
  | 'torre2x2'
  | 'teulada_con'
  | 'merlet'
  | 'tanca'
  | 'xemeneia'
  | 'fanal'
  | 'barril'
  | 'tree_pine'
  | 'tree_apple'
  | 'arbust'
  | 'flower'
  | 'minifigure'
  | 'senyal_tren'
  | 'hidrant'
  | 'banc'
  | 'rellotge'
  | 'senyera'
  | 'track_straight'
  | 'track_straight_long'
  | 'track_curve'
  | 'track_curve_right'
  | 'track_curve_left'
  | 'track_crossing'
  | 'track_buffer'
  | 'track_station';

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
  '1x4': { width: 4, depth: 1, heightUnits: 1, nameCatalan: 'Bloc 1x4', category: 'bloc', icon: '🧱 1x4' },
  '1x6': { width: 6, depth: 1, heightUnits: 1, nameCatalan: 'Bloc 1x6', category: 'bloc', icon: '🧱 1x6' },
  '1x8': { width: 8, depth: 1, heightUnits: 1, nameCatalan: 'Viga 1x8', category: 'bloc', icon: '🧱 1x8' },
  '2x6': { width: 6, depth: 2, heightUnits: 1, nameCatalan: 'Bloc 2x6', category: 'bloc', icon: '🧱 2x6' },
  '2x8': { width: 8, depth: 2, heightUnits: 1, nameCatalan: 'Viga 2x8', category: 'bloc', icon: '🧱 2x8' },
  'corner2x2': { width: 2, depth: 2, heightUnits: 1, nameCatalan: 'Bloc Cantonada', category: 'bloc', icon: '📐 Cantonada' },
  'cyl1x1': { width: 1, depth: 1, heightUnits: 1, nameCatalan: 'Cilindre 1x1', category: 'bloc', icon: '⚪ Cilindre' },
  'cone1x1': { width: 1, depth: 1, heightUnits: 1, nameCatalan: 'Con 1x1', category: 'bloc', icon: '🔺 Con' },

  // House & Architecture
  'plate2x2': { width: 2, depth: 2, heightUnits: 0.33, nameCatalan: 'Rajola Llisa 2x2', category: 'casa', icon: '▫️ Rajola' },
  'plate4x4': { width: 4, depth: 4, heightUnits: 0.33, nameCatalan: 'Placa 4x4', category: 'casa', icon: '⬜ Placa' },
  'slope2x2': { width: 2, depth: 2, heightUnits: 1, nameCatalan: 'Rampa 2x2', category: 'casa', icon: '📐 Rampa' },
  'slope2x4': { width: 4, depth: 2, heightUnits: 1, nameCatalan: 'Rampa Gran 2x4', category: 'casa', icon: '🏠 Sostre' },
  'arch1x4': { width: 4, depth: 1, heightUnits: 1, nameCatalan: 'Arc de Pont', category: 'casa', icon: '🌉 Arc' },
  'finestra': { width: 2, depth: 1, heightUnits: 2, nameCatalan: 'Finestra', category: 'casa', icon: '🪟 Finestra' },
  'porta': { width: 2, depth: 1, heightUnits: 4, nameCatalan: 'Porta de Casa', category: 'casa', icon: '🚪 Porta' },
  'torre2x2': { width: 2, depth: 2, heightUnits: 4, nameCatalan: 'Torre Rodona', category: 'casa', icon: '🏰 Torre' },
  'teulada_con': { width: 2, depth: 2, heightUnits: 2, nameCatalan: 'Teulada Cònica', category: 'casa', icon: '🏰 Teulada' },
  'merlet': { width: 4, depth: 1, heightUnits: 1, nameCatalan: 'Merlet de Castell', category: 'casa', icon: '🏯 Merlet' },
  'tanca': { width: 4, depth: 1, heightUnits: 1, nameCatalan: 'Tanca de Jardí', category: 'casa', icon: '🚧 Tanca' },
  'xemeneia': { width: 2, depth: 2, heightUnits: 2, nameCatalan: 'Xemeneia amb Fum', category: 'casa', icon: '💨 Xemeneia' },
  'fanal': { width: 1, depth: 1, heightUnits: 3, nameCatalan: 'Fanal de Carrer', category: 'casa', icon: '💡 Fanal' },
  'barril': { width: 1, depth: 1, heightUnits: 1, nameCatalan: 'Barril de Càrrega', category: 'casa', icon: '🛢️ Barril' },

  // Lego City Modular Tracks
  'track_straight': { width: 2, depth: 4, heightUnits: 0.33, nameCatalan: 'Via Recta (4)', category: 'vies', icon: '🛤️ Recta' },
  'track_straight_long': { width: 2, depth: 8, heightUnits: 0.33, nameCatalan: 'Via Llarga (8)', category: 'vies', icon: '🛤️ Llarga' },
  'track_curve_right': { width: 4, depth: 4, heightUnits: 0.33, nameCatalan: 'Corba Dreta 90°', category: 'vies', icon: '↪️ Corba Dreta' },
  'track_curve_left': { width: 4, depth: 4, heightUnits: 0.33, nameCatalan: 'Corba Esquerra 90°', category: 'vies', icon: '↩️ Corba Esq.' },
  'track_curve': { width: 4, depth: 4, heightUnits: 0.33, nameCatalan: 'Via Corba', category: 'vies', icon: '🔄 Corba' },
  'track_crossing': { width: 4, depth: 4, heightUnits: 0.33, nameCatalan: 'Cruïlla 4 Vies', category: 'vies', icon: '➕ Cruïlla' },
  'track_buffer': { width: 2, depth: 4, heightUnits: 1.0, nameCatalan: 'Topall de Via', category: 'vies', icon: '🛑 Topall' },
  'track_station': { width: 4, depth: 4, heightUnits: 2.0, nameCatalan: 'Andana d\'Estació', category: 'vies', icon: '🚉 Andana' },

  // Nature & Minifigures
  'tree_pine': { width: 2, depth: 2, heightUnits: 3, nameCatalan: 'Avet del Bosc', category: 'natura', icon: '🌲 Avet' },
  'tree_apple': { width: 3, depth: 3, heightUnits: 3, nameCatalan: 'Pomera Fruitera', category: 'natura', icon: '🌳 Pomera' },
  'arbust': { width: 2, depth: 2, heightUnits: 1, nameCatalan: 'Arbust Verd', category: 'natura', icon: '🌿 Arbust' },
  'flower': { width: 1, depth: 1, heightUnits: 1, nameCatalan: 'Flor Bonica', category: 'natura', icon: '🌸 Flor' },
  'minifigure': { width: 1, depth: 1, heightUnits: 2, nameCatalan: 'Passatger Minifigura', category: 'natura', icon: '🧑 Passatger' },
  'senyal_tren': { width: 1, depth: 1, heightUnits: 3, nameCatalan: 'Senyal de Pas a Nivell', category: 'natura', icon: '⚠️ Senyal' },
  'hidrant': { width: 1, depth: 1, heightUnits: 1, nameCatalan: 'Boca d\'Incendis', category: 'natura', icon: '🧯 Hidrant' },
  'banc': { width: 2, depth: 1, heightUnits: 1, nameCatalan: 'Banc de Fusta', category: 'natura', icon: '🪑 Banc' },
  'rellotge': { width: 1, depth: 1, heightUnits: 3, nameCatalan: 'Rellotge d\'Estació', category: 'natura', icon: '⏰ Rellotge' },
  'senyera': { width: 1, depth: 1, heightUnits: 4, nameCatalan: 'Pal amb Senyera', category: 'natura', icon: '🚩 Senyera' }
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
    const h = this.BRICK_HEIGHT; // Exact 1 brick = 1.2 units

    const topBarH = 0.36;
    const pillarH = h - topBarH;
    const pillarW = 1.0;

    // Solid top bar
    const topGeo = new THREE.BoxGeometry(w, topBarH, d);
    const topMesh = new THREE.Mesh(topGeo, material);
    topMesh.position.set(0, h - topBarH / 2, 0);
    topMesh.castShadow = !isGhost;
    topMesh.receiveShadow = !isGhost;
    group.add(topMesh);

    // Left pillar (1 stud wide)
    const pillarGeo = new THREE.BoxGeometry(pillarW, pillarH, d);
    const leftP = new THREE.Mesh(pillarGeo, material);
    leftP.position.set(-w / 2 + pillarW / 2, pillarH / 2, 0);
    leftP.castShadow = !isGhost;
    leftP.receiveShadow = !isGhost;

    // Right pillar (1 stud wide)
    const rightP = new THREE.Mesh(pillarGeo, material);
    rightP.position.set(w / 2 - pillarW / 2, pillarH / 2, 0);
    rightP.castShadow = !isGhost;
    rightP.receiveShadow = !isGhost;
    group.add(leftP, rightP);

    // Clean curved arch span between pillars (opening x: -1 to +1, y: 0 to pillarH)
    const archRadius = Math.min(1.0, pillarH);
    const archShape = new THREE.Shape();
    archShape.moveTo(-1.0, 0);
    archShape.lineTo(-1.0, pillarH);
    archShape.lineTo(1.0, pillarH);
    archShape.lineTo(1.0, 0);
    archShape.absarc(0, 0, archRadius, 0, Math.PI, false);
    archShape.closePath();

    const archGeo = new THREE.ExtrudeGeometry(archShape, { depth: d, bevelEnabled: false });
    const archMesh = new THREE.Mesh(archGeo, material);
    archMesh.position.set(0, 0, -d / 2);
    archMesh.castShadow = !isGhost;
    archMesh.receiveShadow = !isGhost;
    group.add(archMesh);

    // Studs on top (4 studs at exact positions)
    const { cylinder: studGeo } = this.getStudGeometry();
    for (let i = 0; i < 4; i++) {
      const stud = new THREE.Mesh(studGeo, material);
      stud.position.set(-1.5 + i * 1.0, h + this.STUD_HEIGHT / 2, 0);
      stud.castShadow = !isGhost;
      group.add(stud);
    }

    group.userData = { type: 'arch', widthStuds: 4, depthStuds: 1, height: h };
    return group;
  }

  /**
   * Generates a 2x1 Window (exactly 2 bricks high = 2.4 units)
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

    const w = 2.0 * this.GRID_UNIT - 0.02;
    const d = 1.0 * this.GRID_UNIT - 0.02;
    const h = 2 * this.BRICK_HEIGHT; // Exactly 2 bricks high = 2.4 units!

    // Window frame
    const frameBorder = 0.24;
    const railGeo = new THREE.BoxGeometry(w, frameBorder, d);
    const bottomRail = new THREE.Mesh(railGeo, frameMat);
    bottomRail.position.set(0, frameBorder / 2, 0);
    const topRail = new THREE.Mesh(railGeo, frameMat);
    topRail.position.set(0, h - frameBorder / 2, 0);

    const stileGeo = new THREE.BoxGeometry(frameBorder, h - frameBorder * 2, d);
    const leftStile = new THREE.Mesh(stileGeo, frameMat);
    leftStile.position.set(-w / 2 + frameBorder / 2, h / 2, 0);
    const rightStile = new THREE.Mesh(stileGeo, frameMat);
    rightStile.position.set(w / 2 - frameBorder / 2, h / 2, 0);

    group.add(bottomRail, topRail, leftStile, rightStile);

    // Glass cutout pane
    const glassGeo = new THREE.BoxGeometry(w - frameBorder * 2, h - frameBorder * 2, 0.12);
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, h / 2, 0);
    group.add(glass);

    // Cross mullion bar
    const hMullion = new THREE.Mesh(new THREE.BoxGeometry(w - frameBorder * 2, 0.08, 0.14), frameMat);
    hMullion.position.set(0, h / 2, 0);
    const vMullion = new THREE.Mesh(new THREE.BoxGeometry(0.08, h - frameBorder * 2, 0.14), frameMat);
    vMullion.position.set(0, h / 2, 0);
    group.add(hMullion, vMullion);

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
   * Generates a 2x1 Door (exactly 4 bricks high = 4.8 units, authentic Lego door frame)
   */
  public static createDoor(colorHex: string, isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const frameMat = this.getMaterial('#F4F4F4'); // White door frame
    const doorMat = isGhost ? this.getGhostMaterial(true) : this.getMaterial(colorHex);
    const goldMat = this.getMaterial('#FAC80A', 0.2, 0.5);

    const w = 2.0 * this.GRID_UNIT - 0.02;
    const d = 1.0 * this.GRID_UNIT - 0.02;
    const h = 4 * this.BRICK_HEIGHT; // Exactly 4 bricks high = 4.8 units!

    const frameThick = 0.28;
    const topFrameH = 0.36;

    // Outer door frame top lintel
    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(w, topFrameH, d), frameMat);
    topFrame.position.y = h - topFrameH / 2;
    topFrame.castShadow = !isGhost;
    topFrame.receiveShadow = !isGhost;

    // Left and right frame uprights
    const postH = h - topFrameH;
    const postGeo = new THREE.BoxGeometry(frameThick, postH, d);
    const leftFrame = new THREE.Mesh(postGeo, frameMat);
    leftFrame.position.set(-w / 2 + frameThick / 2, postH / 2, 0);
    leftFrame.castShadow = !isGhost;

    const rightFrame = new THREE.Mesh(postGeo, frameMat);
    rightFrame.position.set(w / 2 - frameThick / 2, postH / 2, 0);
    rightFrame.castShadow = !isGhost;

    // Threshold bottom step
    const thresholdGeo = new THREE.BoxGeometry(w, 0.12, d);
    const threshold = new THREE.Mesh(thresholdGeo, frameMat);
    threshold.position.y = 0.06;

    group.add(topFrame, leftFrame, rightFrame, threshold);

    // Recessed door panel inside
    const doorW = w - frameThick * 2;
    const doorH = postH - 0.12;
    const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, 0.32), doorMat);
    doorPanel.position.set(0, 0.12 + doorH / 2, 0);
    doorPanel.castShadow = true;
    group.add(doorPanel);

    // Golden handle knob (placed comfortably at y = 2.1)
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), goldMat);
    knob.position.set(doorW / 2 - 0.22, 2.1, 0.20);
    group.add(knob);

    // Top studs (2 studs at exact height h + STUD_HEIGHT / 2)
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
   * Generates a 2x2 Round Cylinder Tower Brick (exactly 4 bricks high = 4.8 units, Lego Pillar 2x2x4)
   */
  public static createRoundTower(colorHex: string, isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const material = isGhost ? this.getGhostMaterial(true) : this.getMaterial(colorHex);

    const radius = 0.95;
    const h = 4 * this.BRICK_HEIGHT; // Exactly 4 bricks high = 4.8 units!
    const cylGeo = new THREE.CylinderGeometry(radius, radius, h, 24);
    const cyl = new THREE.Mesh(cylGeo, material);
    cyl.position.y = h / 2;
    cyl.castShadow = true;
    cyl.receiveShadow = true;
    group.add(cyl);

    // Fluted decorative rings along the tower body at brick levels 1, 2, 3
    const ringMat = material;
    [1, 2, 3].forEach((lvl) => {
      const ringGeo = new THREE.TorusGeometry(radius + 0.02, 0.035, 8, 24);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = lvl * this.BRICK_HEIGHT;
      group.add(ring);
    });

    // 4 studs on top at y = h + STUD_HEIGHT / 2
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
   * Generates a City Street Light / Signal Lamp (3 bricks high = 3.6 units)
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

    const h = 3 * this.BRICK_HEIGHT; // Exactly 3 bricks high = 3.6 units!

    // Base post
    const postGeo = new THREE.CylinderGeometry(0.1, 0.14, h, 8);
    const post = new THREE.Mesh(postGeo, blackMat);
    post.position.y = h / 2;
    group.add(post);

    // Lamp head
    const headGeo = new THREE.ConeGeometry(0.35, 0.25, 8);
    const head = new THREE.Mesh(headGeo, blackMat);
    head.position.set(0.3, h, 0);
    head.rotation.z = Math.PI;

    // Glowing bulb
    const bulbGeo = new THREE.SphereGeometry(0.18, 12, 10);
    const bulb = new THREE.Mesh(bulbGeo, glowMat);
    bulb.position.set(0.3, h - 0.15, 0);
    group.add(head, bulb);

    group.userData = { type: 'fanal', widthStuds: 1, depthStuds: 1, height: h };
    return group;
  }

  /**
   * Generates a Cargo Barrel with studs (exactly 1 brick high = 1.2 units)
   */
  public static createCargoBarrel(colorHex: string = '#6F4E37'): THREE.Group {
    const group = new THREE.Group();
    const woodMat = this.getMaterial(colorHex, 0.4, 0.1);
    const bandMat = this.getMaterial('#1B1B1B', 0.3, 0.4);

    const h = this.BRICK_HEIGHT; // Exactly 1 brick high = 1.2 units!
    const barrelGeo = new THREE.CylinderGeometry(0.42, 0.38, h, 16);
    const barrel = new THREE.Mesh(barrelGeo, woodMat);
    barrel.position.y = h / 2;
    barrel.castShadow = true;
    group.add(barrel);

    // Top stud
    const { cylinder: studGeo } = this.getStudGeometry();
    const stud = new THREE.Mesh(studGeo, woodMat);
    stud.position.set(0, h + this.STUD_HEIGHT / 2, 0);
    group.add(stud);

    // Black metal hoops
    [h * 0.25, h * 0.75].forEach((yPos) => {
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.41, 0.03, 6, 16), bandMat);
      hoop.rotation.x = Math.PI / 2;
      hoop.position.y = yPos;
      group.add(hoop);
    });

    group.userData = { type: 'barril', widthStuds: 1, depthStuds: 1, height: h };
    return group;
  }

  /**
   * Generates a Deciduous Apple Tree (round leafy treetop with red apples, 3 bricks high = 3.6 units)
   */
  public static createAppleTree(): THREE.Group {
    const group = new THREE.Group();
    const trunkMat = this.getMaterial('#5D4037', 0.6, 0.05);
    const leavesMat = this.getMaterial('#2E7D32', 0.3, 0.05);
    const appleMat = this.getMaterial('#D11A2A', 0.15, 0.05);

    const h = 3 * this.BRICK_HEIGHT; // Exactly 3 bricks high = 3.6 units!
    const trunkH = 1.5;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, trunkH, 8), trunkMat);
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    group.add(trunk);

    // Round leafy crown
    const crownCenter = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3, 1), leavesMat);
    crownCenter.position.y = 2.3;
    crownCenter.castShadow = true;
    group.add(crownCenter);

    // Red Apples dotted around crown
    const applePositions = [
      { x: 0.9, y: 2.2, z: 0.6 },
      { x: -0.8, y: 2.4, z: 0.7 },
      { x: 0.3, y: 2.6, z: -0.9 },
      { x: -0.7, y: 1.9, z: -0.7 },
      { x: 0.8, y: 2.0, z: -0.6 }
    ];

    applePositions.forEach((p) => {
      const apple = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), appleMat);
      apple.position.set(p.x, p.y, p.z);
      group.add(apple);
    });

    group.userData = { type: 'tree_apple', widthStuds: 3, depthStuds: 3, height: h };
    return group;
  }

  /**
   * Generates a Garden Shrub / Bush (1 brick high = 1.2 units)
   */
  public static createBush(): THREE.Group {
    const group = new THREE.Group();
    const leavesMat = this.getMaterial('#237841', 0.35, 0.05);
    const flowerMat = this.getMaterial('#FAC80A', 0.2, 0.05);

    const h = this.BRICK_HEIGHT;
    const mainGeo = new THREE.DodecahedronGeometry(0.65, 1);
    const bush = new THREE.Mesh(mainGeo, leavesMat);
    bush.position.y = h / 2;
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

    group.userData = { type: 'arbust', widthStuds: 2, depthStuds: 2, height: h };
    return group;
  }

  /**
   * Generates a miniature pine tree (3 bricks high = 3.6 units)
   */
  public static createPineTree(colorHex: string = '#237841'): THREE.Group {
    const group = new THREE.Group();
    const trunkMat = this.getMaterial('#5D4037', 0.7, 0.0);
    const foliageMat = this.getMaterial(colorHex, 0.25, 0.02);

    const h = 3 * this.BRICK_HEIGHT; // Exactly 3 bricks high = 3.6 units!
    const trunkH = 1.4;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, trunkH, 10), trunkMat);
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    group.add(trunk);

    const layers = [
      { rBot: 1.4, rTop: 0.6, h: 1.0, y: 1.3 },
      { rBot: 1.1, rTop: 0.35, h: 0.95, y: 2.1 },
      { rBot: 0.75, rTop: 0.05, h: 0.9, y: 2.9 }
    ];

    layers.forEach((layer) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(layer.rBot, layer.h, 12), foliageMat);
      cone.position.y = layer.y;
      cone.castShadow = true;
      group.add(cone);
    });

    group.userData = { type: 'tree_pine', widthStuds: 2, depthStuds: 2, height: h };
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
   * Generates authentic Lego City Straight Track Piece (4 or 8 studs long)
   */
  public static createLegoCityStraightTrack(isGhost: boolean = false, length: number = 4.0): THREE.Group {
    const group = new THREE.Group();
    const sleeperMat = isGhost ? this.getGhostMaterial(true) : this.getMaterial('#475569', 0.4, 0.1);
    const railMat = isGhost ? this.getGhostMaterial(true) : this.getMaterial('#CBD5E1', 0.15, 0.85);

    const gauge = 1.3;
    const sleeperWidth = 2.4;
    const sleeperH = 0.25;

    const numSleepers = Math.round(length);
    const sleeperGeo = new THREE.BoxGeometry(sleeperWidth, sleeperH, 0.5);
    const { cylinder: studGeo } = this.getStudGeometry();

    const startZ = -((length - 1) / 2);
    for (let i = 0; i < numSleepers; i++) {
      const zPos = startZ + i * 1.0;
      const sMesh = new THREE.Mesh(sleeperGeo, sleeperMat);
      sMesh.position.set(0, sleeperH / 2, zPos);
      sMesh.castShadow = !isGhost;
      sMesh.receiveShadow = !isGhost;
      group.add(sMesh);

      // Studs on sleeper ends
      if (!isGhost) {
        [-0.95, 0.95].forEach((xPos) => {
          const st = new THREE.Mesh(studGeo, sleeperMat);
          st.scale.set(0.65, 0.65, 0.65);
          st.position.set(xPos, sleeperH + this.STUD_HEIGHT * 0.32, zPos);
          group.add(st);
        });
      }
    }

    // Two Silver Rails with authentic raised I-beam profile along Z axis
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

    group.userData = {
      type: length > 4 ? 'track_straight_long' : 'track_straight',
      widthStuds: 2,
      depthStuds: length,
      height: 0.47
    };
    return group;
  }

  /**
   * Generates Lego City 90-degree Curved Track Piece (connects South port to East/West port)
   */
  public static createLegoCityCurvedTrack(isGhost: boolean = false, isLeft: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const sleeperMat = isGhost ? this.getGhostMaterial(true) : this.getMaterial('#475569', 0.4, 0.1);
    const railMat = isGhost ? this.getGhostMaterial(true) : this.getMaterial('#CBD5E1', 0.15, 0.85);

    const R = 2.0; // Radius connecting (0, -2) to (2, 0)
    const gauge = 1.3;
    const numSleepers = 5;
    const sSign = isLeft ? -1 : 1;

    // Center of curvature: (2*sSign, -2)
    const cx = 2.0 * sSign;
    const cz = -2.0;

    // Sleepers along the 90 degree arc
    for (let i = 0; i < numSleepers; i++) {
      const phi = (i / (numSleepers - 1)) * (Math.PI / 2);
      const x = cx - sSign * R * Math.cos(phi);
      const z = cz + R * Math.sin(phi);

      const sMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.25, 0.5), sleeperMat);
      sMesh.position.set(x, 0.125, z);
      sMesh.rotation.y = sSign * phi;
      sMesh.castShadow = !isGhost;
      group.add(sMesh);
    }

    // Smooth dual curved rails using CatmullRom tube
    const steps = 14;
    const leftPoints: THREE.Vector3[] = [];
    const rightPoints: THREE.Vector3[] = [];

    const rIn = R - gauge / 2;
    const rOut = R + gauge / 2;

    for (let i = 0; i <= steps; i++) {
      const phi = (i / steps) * (Math.PI / 2);
      const xIn = cx - sSign * (isLeft ? rOut : rIn) * Math.cos(phi);
      const zIn = cz + (isLeft ? rOut : rIn) * Math.sin(phi);
      leftPoints.push(new THREE.Vector3(xIn, 0.36, zIn));

      const xOut = cx - sSign * (isLeft ? rIn : rOut) * Math.cos(phi);
      const zOut = cz + (isLeft ? rIn : rOut) * Math.sin(phi);
      rightPoints.push(new THREE.Vector3(xOut, 0.36, zOut));
    }

    const leftCurve = new THREE.CatmullRomCurve3(leftPoints);
    const rightCurve = new THREE.CatmullRomCurve3(rightPoints);

    const railGeoL = new THREE.TubeGeometry(leftCurve, 16, 0.065, 6, false);
    const railGeoR = new THREE.TubeGeometry(rightCurve, 16, 0.065, 6, false);

    const railMeshL = new THREE.Mesh(railGeoL, railMat);
    const railMeshR = new THREE.Mesh(railGeoR, railMat);
    railMeshL.castShadow = !isGhost;
    railMeshR.castShadow = !isGhost;

    group.add(railMeshL, railMeshR);

    group.userData = {
      type: isLeft ? 'track_curve_left' : 'track_curve_right',
      widthStuds: 4,
      depthStuds: 4,
      height: 0.47
    };
    return group;
  }

  /**
   * Generates Level Crossing with road deck and striped barriers
   */
  public static createLevelCrossing(isGhost: boolean = false): THREE.Group {
    const group = this.createLegoCityStraightTrack(isGhost, 4.0);
    const roadMat = this.getMaterial('#6F4E37', 0.5, 0.05); // Wood planks
    const redMat = this.getMaterial('#D11A2A', 0.2, 0.05);
    const whiteMat = this.getMaterial('#F4F4F4', 0.2, 0.05);

    // Cross-track running East-West (length 4)
    const sleeperMat = isGhost ? this.getGhostMaterial(true) : this.getMaterial('#475569', 0.4, 0.1);
    const railMat = isGhost ? this.getGhostMaterial(true) : this.getMaterial('#CBD5E1', 0.15, 0.85);

    [-1.5, 1.5].forEach((xPos) => {
      const sMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 2.4), sleeperMat);
      sMesh.position.set(xPos, 0.125, 0);
      group.add(sMesh);
    });

    const crossRailL = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.22, 0.12), railMat);
    crossRailL.position.set(0, 0.36, -0.65);
    const crossRailR = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.22, 0.12), railMat);
    crossRailR.position.set(0, 0.36, 0.65);
    group.add(crossRailL, crossRailR);

    // Wooden roadway crossing deck in center
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
    const group = this.createLegoCityStraightTrack(isGhost, 4.0);
    const redMat = this.getMaterial('#D11A2A', 0.2, 0.05);
    const blackMat = this.getMaterial('#1B1B1B', 0.3, 0.1);
    const yellowMat = this.getMaterial('#FAC80A', 0.2, 0.4);

    // Heavy duty A-frame bumper at z = 1.0
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.4), blackMat);
    frame.position.set(0, 0.65, 1.0);
    group.add(frame);

    // Two Red Buffer Pads
    [-0.55, 0.55].forEach((x) => {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.15, 12), redMat);
      pad.rotation.x = Math.PI / 2;
      pad.position.set(x, 0.65, 1.2);
      group.add(pad);
    });

    // Yellow warning chevron plate
    const warning = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.04, 16), yellowMat);
    warning.rotation.x = Math.PI / 2;
    warning.position.set(0, 0.65, 1.22);
    group.add(warning);

    group.userData = { type: 'track_buffer', widthStuds: 2, depthStuds: 4, height: 1.0 };
    return group;
  }

  /**
   * Generates Train Station Platform Track (Andana d'Estació)
   */
  public static createStationTrack(isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    // Straight track along X = -1.0
    const track = this.createLegoCityStraightTrack(isGhost, 4.0);
    track.position.set(-1.0, 0, 0);
    group.add(track);

    // Station platform on X in [0.0, 2.0]
    const stoneMat = this.getMaterial('#8A9299', 0.4, 0.1);
    const tileMat = this.getMaterial('#FAC80A', 0.2, 0.05);
    const woodMat = this.getMaterial('#6F4E37', 0.5, 0.05);
    const blueMat = this.getMaterial('#0055BF', 0.2, 0.05);

    const platformGeo = new THREE.BoxGeometry(2.0, 0.7, 4.0);
    const platform = new THREE.Mesh(platformGeo, stoneMat);
    platform.position.set(1.0, 0.35, 0);
    platform.castShadow = true;
    platform.receiveShadow = true;
    group.add(platform);

    // Yellow safety edge strip
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 4.0), tileMat);
    edge.position.set(0.1, 0.72, 0);
    group.add(edge);

    // Wooden passenger bench
    const bench = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 1.2), woodMat);
    bench.position.set(1.2, 0.88, -0.8);
    bench.castShadow = true;
    group.add(bench);

    // Canopy roof with blue support pillars
    [-1.2, 1.2].forEach((z) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8), blueMat);
      pillar.position.set(1.2, 1.6, z);
      pillar.castShadow = true;
      group.add(pillar);
    });

    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 3.6), blueMat);
    roof.position.set(1.2, 2.5, 0);
    roof.castShadow = true;
    group.add(roof);

    group.userData = { type: 'track_station', widthStuds: 4, depthStuds: 4, height: 2.5 };
    return group;
  }

  /**
   * Generates an L-shaped Corner Brick 2x2
   */
  public static createCornerBrick(colorHex: string, isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const material = isGhost ? this.getGhostMaterial(true) : this.getMaterial(colorHex);
    const h = this.BRICK_HEIGHT;

    // Body: arm 1 (2x1) along X, arm 2 (1x1) along Z
    const part1 = new THREE.Mesh(new THREE.BoxGeometry(1.98, h, 0.98), material);
    part1.position.set(0, h / 2, 0.5);
    part1.castShadow = !isGhost;
    const part2 = new THREE.Mesh(new THREE.BoxGeometry(0.98, h, 0.98), material);
    part2.position.set(-0.5, h / 2, -0.5);
    part2.castShadow = !isGhost;
    group.add(part1, part2);

    // 3 studs on top
    const { cylinder: studGeo } = this.getStudGeometry();
    [
      { x: -0.5, z: 0.5 },
      { x: 0.5, z: 0.5 },
      { x: -0.5, z: -0.5 }
    ].forEach((p) => {
      const stud = new THREE.Mesh(studGeo, material);
      stud.position.set(p.x, h + this.STUD_HEIGHT / 2, p.z);
      stud.castShadow = !isGhost;
      group.add(stud);
    });

    group.userData = { type: 'corner2x2', widthStuds: 2, depthStuds: 2, height: h };
    return group;
  }

  /**
   * Generates a Round Cylinder Brick 1x1
   */
  public static createCylinderBrick(colorHex: string, isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const material = isGhost ? this.getGhostMaterial(true) : this.getMaterial(colorHex);
    const h = this.BRICK_HEIGHT;

    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, h, 18), material);
    cyl.position.y = h / 2;
    cyl.castShadow = !isGhost;
    group.add(cyl);

    const { cylinder: studGeo } = this.getStudGeometry();
    const stud = new THREE.Mesh(studGeo, material);
    stud.position.set(0, h + this.STUD_HEIGHT / 2, 0);
    stud.castShadow = !isGhost;
    group.add(stud);

    group.userData = { type: 'cyl1x1', widthStuds: 1, depthStuds: 1, height: h };
    return group;
  }

  /**
   * Generates a 1x1 Cone Stud
   */
  public static createConeStud(colorHex: string, isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const material = isGhost ? this.getGhostMaterial(true) : this.getMaterial(colorHex);
    const h = this.BRICK_HEIGHT;

    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.48, h, 16), material);
    cone.position.y = h / 2;
    cone.castShadow = !isGhost;
    group.add(cone);

    const { cylinder: studGeo } = this.getStudGeometry();
    const stud = new THREE.Mesh(studGeo, material);
    stud.scale.set(0.7, 0.7, 0.7);
    stud.position.set(0, h + this.STUD_HEIGHT * 0.35, 0);
    group.add(stud);

    group.userData = { type: 'cone1x1', widthStuds: 1, depthStuds: 1, height: h };
    return group;
  }

  /**
   * Generates a 2x2 Conical Castle Turret Roof (fits on top of the round tower!)
   */
  public static createConicalTurretRoof(colorHex: string, isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const material = isGhost ? this.getGhostMaterial(true) : this.getMaterial(colorHex);
    const goldMat = this.getMaterial('#FAC80A', 0.15, 0.5);
    const h = 2 * this.BRICK_HEIGHT; // 2.4 units high

    // Flared cone roof
    const coneGeo = new THREE.ConeGeometry(1.05, h, 24);
    const cone = new THREE.Mesh(coneGeo, material);
    cone.position.y = h / 2;
    cone.castShadow = !isGhost;
    group.add(cone);

    // Eaves rim at bottom
    const eaveGeo = new THREE.TorusGeometry(1.04, 0.05, 8, 24);
    const eave = new THREE.Mesh(eaveGeo, material);
    eave.rotation.x = Math.PI / 2;
    eave.position.y = 0.05;
    group.add(eave);

    // Golden spire ball on top
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), goldMat);
    finial.position.set(0, h + 0.12, 0);
    group.add(finial);

    group.userData = { type: 'teulada_con', widthStuds: 2, depthStuds: 2, height: h };
    return group;
  }

  /**
   * Generates a 1x4 Castle Battlement Crenellation Wall
   */
  public static createCastleWallCrenellation(colorHex: string, isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const material = isGhost ? this.getGhostMaterial(true) : this.getMaterial(colorHex);
    const h = this.BRICK_HEIGHT;

    // Base wall 1x4 of height 0.6
    const baseWall = new THREE.Mesh(new THREE.BoxGeometry(3.96, 0.6, 0.96), material);
    baseWall.position.y = 0.3;
    baseWall.castShadow = !isGhost;
    group.add(baseWall);

    // 3 raised crenel teeth
    const crenelWidth = 0.8;
    const crenelH = h - 0.6;
    [-1.4, 0.0, 1.4].forEach((x) => {
      const crenel = new THREE.Mesh(new THREE.BoxGeometry(crenelWidth, crenelH, 0.96), material);
      crenel.position.set(x, 0.6 + crenelH / 2, 0);
      crenel.castShadow = !isGhost;
      group.add(crenel);
    });

    // Top studs
    const { cylinder: studGeo } = this.getStudGeometry();
    [-1.4, 0.0, 1.4].forEach((x) => {
      const stud = new THREE.Mesh(studGeo, material);
      stud.position.set(x, h + this.STUD_HEIGHT / 2, 0);
      stud.castShadow = !isGhost;
      group.add(stud);
    });

    group.userData = { type: 'merlet', widthStuds: 4, depthStuds: 1, height: h };
    return group;
  }

  /**
   * Generates a 1x4 Garden Picket Fence
   */
  public static createGardenFence(colorHex: string = '#F4F4F4', isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const fenceMat = isGhost ? this.getGhostMaterial(true) : this.getMaterial(colorHex, 0.25, 0.05);
    const h = this.BRICK_HEIGHT;

    // Horizontal rails (top and bottom)
    const bottomRail = new THREE.Mesh(new THREE.BoxGeometry(3.96, 0.12, 0.18), fenceMat);
    bottomRail.position.set(0, 0.25, 0);
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(3.96, 0.12, 0.18), fenceMat);
    topRail.position.set(0, h * 0.75, 0);
    group.add(bottomRail, topRail);

    // 4 vertical pickets with pointed tips
    const picketGeo = new THREE.BoxGeometry(0.3, h * 0.85, 0.12);
    [-1.5, -0.5, 0.5, 1.5].forEach((x) => {
      const picket = new THREE.Mesh(picketGeo, fenceMat);
      picket.position.set(x, h * 0.85 / 2, 0);
      picket.castShadow = !isGhost;
      group.add(picket);

      // Pointed tip
      const tipGeo = new THREE.ConeGeometry(0.18, 0.2, 4);
      tipGeo.rotateY(Math.PI / 4);
      const tip = new THREE.Mesh(tipGeo, fenceMat);
      tip.position.set(x, h * 0.85 + 0.1, 0);
      group.add(tip);
    });

    group.userData = { type: 'tanca', widthStuds: 4, depthStuds: 1, height: h };
    return group;
  }

  /**
   * Generates a 2x2 Chimney with White Smoke
   */
  public static createChimneyWithSmoke(colorHex: string = '#D11A2A', isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const brickMat = isGhost ? this.getGhostMaterial(true) : this.getMaterial(colorHex, 0.4, 0.05);
    const darkLipMat = this.getMaterial('#1B1B1B', 0.3, 0.1);
    const smokeMat = this.getMaterial('#FFFFFF', 0.9, 0.0);
    const h = 2 * this.BRICK_HEIGHT;

    // Chimney stack body
    const bodyGeo = new THREE.BoxGeometry(1.96, h, 1.96);
    const body = new THREE.Mesh(bodyGeo, brickMat);
    body.position.y = h / 2;
    body.castShadow = !isGhost;
    group.add(body);

    // Top corbel lip
    const lipGeo = new THREE.BoxGeometry(2.1, 0.2, 2.1);
    const lip = new THREE.Mesh(lipGeo, darkLipMat);
    lip.position.y = h - 0.1;
    group.add(lip);

    // Fluffy cloud puffs of smoke rising from chimney
    if (!isGhost) {
      const puff1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 1), smokeMat);
      puff1.position.set(0.1, h + 0.4, -0.1);
      const puff2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 1), smokeMat);
      puff2.position.set(-0.15, h + 0.9, 0.1);
      const puff3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65, 1), smokeMat);
      puff3.position.set(0.2, h + 1.5, 0.05);
      group.add(puff1, puff2, puff3);
    }

    group.userData = { type: 'xemeneia', widthStuds: 2, depthStuds: 2, height: h };
    return group;
  }

  /**
   * Generates a Railway Crossing X-Sign
   */
  public static createRailwayCrossingSign(_isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const postMat = this.getMaterial('#1B1B1B', 0.3, 0.2);
    const whiteMat = this.getMaterial('#F4F4F4', 0.2, 0.05);
    const redMat = this.getMaterial('#D11A2A', 0.2, 0.05);
    const h = 3 * this.BRICK_HEIGHT;

    // Post
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, h, 8), postMat);
    post.position.y = h / 2;
    post.castShadow = true;
    group.add(post);

    // Crossbuck arms (two white cross blades with red stripes)
    const armGeo = new THREE.BoxGeometry(1.6, 0.25, 0.06);
    const arm1 = new THREE.Mesh(armGeo, whiteMat);
    arm1.position.set(0, h * 0.85, 0.1);
    arm1.rotation.z = Math.PI / 4;

    const arm2 = new THREE.Mesh(armGeo, whiteMat);
    arm2.position.set(0, h * 0.85, 0.11);
    arm2.rotation.z = -Math.PI / 4;

    // Red tips on crossbuck
    [-0.6, 0.6].forEach((xOff) => {
      const tip1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.26, 0.07), redMat);
      tip1.position.set(xOff, 0, 0);
      arm1.add(tip1);
      const tip2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.26, 0.07), redMat);
      tip2.position.set(xOff, 0, 0);
      arm2.add(tip2);
    });

    group.add(arm1, arm2);

    group.userData = { type: 'senyal_tren', widthStuds: 1, depthStuds: 1, height: h };
    return group;
  }

  /**
   * Generates a Red City Fire Hydrant
   */
  public static createFireHydrant(_isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const redMat = this.getMaterial('#D11A2A', 0.2, 0.05);
    const silverMat = this.getMaterial('#CBD5E1', 0.2, 0.8);
    const h = this.BRICK_HEIGHT;

    // Main barrel
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, h * 0.8, 12), redMat);
    body.position.y = h * 0.4;
    body.castShadow = true;
    group.add(body);

    // Dome cap
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2), redMat);
    dome.position.y = h * 0.8;
    group.add(dome);

    // Top nut
    const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 6), silverMat);
    nut.position.y = h * 0.8 + 0.25;
    group.add(nut);

    // Two side nozzle valves
    [-0.26, 0.26].forEach((x) => {
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 8), silverMat);
      nozzle.rotation.z = Math.PI / 2;
      nozzle.position.set(x, h * 0.5, 0);
      group.add(nozzle);
    });

    group.userData = { type: 'hidrant', widthStuds: 1, depthStuds: 1, height: h };
    return group;
  }

  /**
   * Generates a Wooden Park Bench
   */
  public static createParkBench(_isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const woodMat = this.getMaterial('#8D6E63', 0.45, 0.05);
    const ironMat = this.getMaterial('#1B1B1B', 0.3, 0.3);
    const h = this.BRICK_HEIGHT;

    // Two iron side legs
    [-0.8, 0.8].forEach((x) => {
      const legGeo = new THREE.BoxGeometry(0.12, h * 0.7, 0.6);
      const leg = new THREE.Mesh(legGeo, ironMat);
      leg.position.set(x, h * 0.35, 0);
      leg.castShadow = true;
      group.add(leg);
    });

    // Seat slats
    for (let i = 0; i < 3; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 0.16), woodMat);
      slat.position.set(0, h * 0.45, -0.2 + i * 0.2);
      slat.castShadow = true;
      group.add(slat);
    }

    // Backrest slats
    for (let i = 0; i < 2; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.14, 0.08), woodMat);
      slat.position.set(0, h * 0.65 + i * 0.18, 0.26);
      slat.castShadow = true;
      group.add(slat);
    }

    group.userData = { type: 'banc', widthStuds: 2, depthStuds: 1, height: h };
    return group;
  }

  /**
   * Generates a Victorian Station Clock
   */
  public static createStationClock(_isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const ironMat = this.getMaterial('#1B1B1B', 0.25, 0.3);
    const whiteMat = this.getMaterial('#F4F4F4', 0.2, 0.05);
    const goldMat = this.getMaterial('#FAC80A', 0.15, 0.6);
    const h = 3 * this.BRICK_HEIGHT;

    // Pillar
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, h * 0.75, 10), ironMat);
    post.position.y = h * 0.375;
    post.castShadow = true;
    group.add(post);

    // Clock head drum
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 18), ironMat);
    drum.rotation.x = Math.PI / 2;
    drum.position.y = h * 0.85;
    drum.castShadow = true;
    group.add(drum);

    // Front & back white dials
    [-0.16, 0.16].forEach((z) => {
      const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.02, 18), whiteMat);
      dial.rotation.x = Math.PI / 2;
      dial.position.set(0, h * 0.85, z);
      group.add(dial);

      // Clock hands pointing to 3 o'clock!
      const hand1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.03), ironMat);
      hand1.position.set(0, h * 0.85 + 0.1, z + (z > 0 ? 0.015 : -0.015));
      const hand2 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.03), ironMat);
      hand2.position.set(0.08, h * 0.85, z + (z > 0 ? 0.015 : -0.015));
      group.add(hand1, hand2);
    });

    // Golden ball top finial
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), goldMat);
    finial.position.set(0, h * 0.85 + 0.55, 0);
    group.add(finial);

    group.userData = { type: 'rellotge', widthStuds: 1, depthStuds: 1, height: h };
    return group;
  }

  /**
   * Generates a Flagpole with Waving Catalan Senyera Flag
   */
  public static createFlagpoleSenyera(_isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const poleMat = this.getMaterial('#F4F4F4', 0.2, 0.1);
    const goldMat = this.getMaterial('#FAC80A', 0.15, 0.6);
    const redMat = this.getMaterial('#D11A2A', 0.2, 0.05);
    const yellowMat = this.getMaterial('#FAC80A', 0.2, 0.05);
    const h = 4 * this.BRICK_HEIGHT; // 4.8 units tall

    // Tall flagpole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, h, 10), poleMat);
    pole.position.y = h / 2;
    pole.castShadow = true;
    group.add(pole);

    // Gold finial on top
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), goldMat);
    finial.position.y = h + 0.08;
    group.add(finial);

    // Catalan Senyera (4 red stripes alternating on yellow)
    const flagGroup = new THREE.Group();
    flagGroup.position.set(0.06, h - 0.2, 0);

    const flagWidth = 1.4;
    const stripeH = 0.18; // 9 stripes total (5 yellow, 4 red)
    for (let s = 0; s < 9; s++) {
      const isRed = s % 2 === 1;
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(flagWidth, stripeH, 0.03),
        isRed ? redMat : yellowMat
      );
      stripe.position.set(flagWidth / 2, -s * stripeH, 0);
      flagGroup.add(stripe);
    }
    group.add(flagGroup);

    group.userData = { type: 'senyera', widthStuds: 1, depthStuds: 1, height: h };
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
