import * as THREE from 'three';

export type BrickShape = '1x1' | '2x2' | '2x4' | '1x6' | 'slope2x2' | 'track_straight' | 'tree_pine' | 'flower';

export interface BrickDefinition {
  width: number; // in studs along X
  depth: number; // in studs along Z
  heightUnits: number; // standard height = 1 (1.2 units)
  nameCatalan: string;
}

export const BRICK_DEFS: Record<string, BrickDefinition> = {
  '1x1': { width: 1, depth: 1, heightUnits: 1, nameCatalan: 'Bloc 1x1' },
  '2x2': { width: 2, depth: 2, heightUnits: 1, nameCatalan: 'Bloc 2x2' },
  '2x4': { width: 4, depth: 2, heightUnits: 1, nameCatalan: 'Bloc 2x4' },
  '1x6': { width: 6, depth: 1, heightUnits: 1, nameCatalan: 'Bloc 1x6' },
  'slope2x2': { width: 2, depth: 2, heightUnits: 1, nameCatalan: 'Rampa 2x2' },
  'track_straight': { width: 4, depth: 2, heightUnits: 0.35, nameCatalan: 'Via Recta' },
  'tree_pine': { width: 2, depth: 2, heightUnits: 3, nameCatalan: 'Arbre del Bosc' },
  'flower': { width: 1, depth: 1, heightUnits: 0.8, nameCatalan: 'Flor Bonica' }
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
        envMapIntensity: 1.2
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
          emissiveIntensity: 0.4
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
          emissiveIntensity: 0.5
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
    // Use BoxGeometry with bevel margin
    const boxMargin = 0.02; // Small gap between adjacent bricks for realistic seams!
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

    // Attach metadata
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
   * Generates a 2x2 roof slope brick
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

    // Build triangular prism extrusion
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

    group.userData = {
      type: 'slope',
      widthStuds,
      depthStuds,
      colorHex,
      height: h
    };

    return group;
  }

  /**
   * Generates a straight track piece with sleepers and steel rails
   */
  public static createTrackStraight(
    lengthUnits: number = 4.0,
    isGhost: boolean = false
  ): THREE.Group {
    const group = new THREE.Group();
    const sleeperMat = isGhost ? this.getGhostMaterial(true) : this.getMaterial('#6F4E37', 0.6, 0.05); // Wood brown
    const railMat = isGhost ? this.getGhostMaterial(true) : this.getMaterial('#B0BEC5', 0.2, 0.85);   // Polished steel

    const trackGauge = 1.3; // Distance between rail centers
    const sleeperCount = Math.floor(lengthUnits / 0.8);
    const sleeperWidth = 2.2;
    const sleeperHeight = 0.25;
    const sleeperDepth = 0.45;

    // Sleepers (wooden/plastic ties)
    const sleeperGeo = new THREE.BoxGeometry(sleeperWidth, sleeperHeight, sleeperDepth);
    const startZ = -((lengthUnits - 0.8) / 2);

    for (let i = 0; i < sleeperCount; i++) {
      const sMesh = new THREE.Mesh(sleeperGeo, sleeperMat);
      sMesh.position.set(0, sleeperHeight / 2, startZ + i * 0.8);
      sMesh.castShadow = !isGhost;
      sMesh.receiveShadow = !isGhost;
      group.add(sMesh);

      // Add two small studs on outer ends of each sleeper
      if (!isGhost) {
        const { cylinder: studGeo } = this.getStudGeometry();
        const stud1 = new THREE.Mesh(studGeo, sleeperMat);
        stud1.scale.set(0.65, 0.65, 0.65);
        stud1.position.set(-sleeperWidth * 0.42, sleeperHeight + this.STUD_HEIGHT * 0.32, startZ + i * 0.8);
        const stud2 = stud1.clone();
        stud2.position.x = sleeperWidth * 0.42;
        group.add(stud1, stud2);
      }
    }

    // Steel rails: Left and Right
    const railGeo = new THREE.BoxGeometry(0.12, 0.22, lengthUnits);
    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(-trackGauge / 2, sleeperHeight + 0.11, 0);
    leftRail.castShadow = !isGhost;
    leftRail.receiveShadow = !isGhost;

    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(trackGauge / 2, sleeperHeight + 0.11, 0);
    rightRail.castShadow = !isGhost;
    rightRail.receiveShadow = !isGhost;

    group.add(leftRail, rightRail);

    group.userData = {
      type: 'track_straight',
      length: lengthUnits,
      gauge: trackGauge,
      height: sleeperHeight + 0.22
    };

    return group;
  }

  /**
   * Generates a miniature pine tree made of green stepped cones on a brown trunk
   */
  public static createPineTree(colorHex: string = '#237841'): THREE.Group {
    const group = new THREE.Group();
    const trunkMat = this.getMaterial('#5D4037', 0.7, 0.0);
    const foliageMat = this.getMaterial(colorHex, 0.25, 0.02);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.22, 0.28, 1.2, 10);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.6;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    // Foliage layers
    const layers = [
      { rBot: 1.4, rTop: 0.6, h: 0.9, y: 1.2 },
      { rBot: 1.1, rTop: 0.35, h: 0.85, y: 1.85 },
      { rBot: 0.75, rTop: 0.05, h: 0.8, y: 2.45 }
    ];

    layers.forEach((layer) => {
      const coneGeo = new THREE.ConeGeometry(layer.rBot, layer.h, 12);
      const cone = new THREE.Mesh(coneGeo, foliageMat);
      cone.position.y = layer.y;
      cone.castShadow = true;
      cone.receiveShadow = true;
      group.add(cone);
    });

    // Top stud
    const { cylinder: studGeo } = this.getStudGeometry();
    const topStud = new THREE.Mesh(studGeo, foliageMat);
    topStud.scale.set(0.6, 0.6, 0.6);
    topStud.position.y = 2.9;
    group.add(topStud);

    group.userData = { type: 'tree_pine', height: 3.0 };
    return group;
  }

  /**
   * Generates a miniature toy flower
   */
  public static createFlower(colorHex: string = '#FAC80A'): THREE.Group {
    const group = new THREE.Group();
    const stemMat = this.getMaterial('#237841', 0.3, 0.05);
    const petalMat = this.getMaterial(colorHex, 0.2, 0.05);
    const centerMat = this.getMaterial('#FAC80A', 0.2, 0.05);

    // Stem
    const stemGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.25;
    stem.castShadow = true;
    group.add(stem);

    // Petals (4 small disc petals)
    const petalGeo = new THREE.SphereGeometry(0.18, 10, 8);
    petalGeo.scale(1, 0.4, 1.4);
    for (let i = 0; i < 4; i++) {
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.set(
        Math.cos((i * Math.PI) / 2) * 0.22,
        0.52,
        Math.sin((i * Math.PI) / 2) * 0.22
      );
      petal.rotation.y = (i * Math.PI) / 2;
      group.add(petal);
    }

    // Flower center
    const centerGeo = new THREE.SphereGeometry(0.14, 12, 10);
    const center = new THREE.Mesh(centerGeo, centerMat);
    center.position.y = 0.54;
    group.add(center);

    group.userData = { type: 'flower', height: 0.65 };
    return group;
  }

  /**
   * Generates Antoni the Minifigure train driver!
   */
  public static createMinifigure(): THREE.Group {
    const group = new THREE.Group();
    const skinMat = this.getMaterial('#FAC80A', 0.15, 0.05); // Classic toy yellow
    const uniformMat = this.getMaterial('#0055BF', 0.2, 0.05); // Blue overalls
    const capMat = this.getMaterial('#D11A2A', 0.2, 0.05);    // Red conductor cap
    const blackMat = this.getMaterial('#1B1B1B', 0.3, 0.1);

    // Legs & Hips
    const hipsGeo = new THREE.BoxGeometry(0.65, 0.25, 0.35);
    const hips = new THREE.Mesh(hipsGeo, uniformMat);
    hips.position.y = 0.55;
    group.add(hips);

    const legGeo = new THREE.BoxGeometry(0.28, 0.45, 0.34);
    const leftLeg = new THREE.Mesh(legGeo, uniformMat);
    leftLeg.position.set(-0.16, 0.25, 0);
    const rightLeg = new THREE.Mesh(legGeo, uniformMat);
    rightLeg.position.set(0.16, 0.25, 0);
    group.add(leftLeg, rightLeg);

    // Torso (trapezoid wedge)
    const torsoGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.55, 4);
    torsoGeo.rotateY(Math.PI / 4);
    const torso = new THREE.Mesh(torsoGeo, uniformMat);
    torso.position.y = 0.95;
    torso.scale.set(1.1, 1, 0.7);
    group.add(torso);

    // Head
    const headGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.35, 16);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.35;
    group.add(head);

    // Conductor Cap
    const capGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.16, 16);
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 1.55;

    const visorGeo = new THREE.BoxGeometry(0.32, 0.04, 0.18);
    const visor = new THREE.Mesh(visorGeo, blackMat);
    visor.position.set(0, 1.5, 0.18);
    visor.rotation.x = 0.2;
    group.add(cap, visor);

    // Arms & Hands
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

    group.castShadow = true;
    group.userData = { type: 'minifigure', name: 'Antoni' };
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
        wheels.push(wheelMesh);
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

    // 5. Driver Cabin (Cabina de conducció) in Blue or Red
    const cabinWidth = 2.0;
    const cabinHeight = 1.7;
    const cabinLength = 1.8;
    const cabinZ = -1.5;

    // Walls
    const cabinWallGeo = new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinLength);
    const cabin = new THREE.Mesh(cabinWallGeo, blueMat);
    cabin.position.set(0, 0.65 + chassisHeight / 2 + cabinHeight / 2, cabinZ);
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    root.add(cabin);

    // Cabin Curved Roof (Sostre vermell)
    const roofGeo = new THREE.CylinderGeometry(1.2, 1.2, cabinLength + 0.25, 18, 1, false, 0, Math.PI);
    const roof = new THREE.Mesh(roofGeo, redMat);
    roof.rotation.z = Math.PI / 2;
    roof.rotation.y = Math.PI / 2;
    roof.position.set(0, cabin.position.y + cabinHeight / 2 + 0.05, cabinZ);
    roof.castShadow = true;
    root.add(roof);

    // Windows (yellow glowing glass / white)
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

    // 6. Brass Headlight Lantern (Far davanter) with real Spotlight!
    const lanternGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.35, 16);
    const lantern = new THREE.Mesh(lanternGeo, goldMat);
    lantern.rotation.x = Math.PI / 2;
    lantern.position.set(0, boiler.position.y + 0.1, boiler.position.z + boilerLength / 2 + 0.2);
    root.add(lantern);

    const lensGeo = new THREE.CircleGeometry(0.22, 16);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0xfff0aa });
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

    // Platform base
    const pWidth = 3.5;
    const pLength = 12.0;
    const pHeight = 0.6;
    const pGeo = new THREE.BoxGeometry(pWidth, pHeight, pLength);
    const platform = new THREE.Mesh(pGeo, platMat);
    platform.position.y = pHeight / 2;
    platform.castShadow = true;
    platform.receiveShadow = true;
    group.add(platform);

    // Platform awning / shelter roof
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

    // Station Signboard: "ESTACIÓ DEL BOSC"
    const signBoardGeo = new THREE.BoxGeometry(2.4, 0.6, 0.1);
    const signBoard = new THREE.Mesh(signBoardGeo, whiteMat);
    signBoard.position.set(-0.8, pHeight + 2.1, 0);
    signBoard.castShadow = true;
    group.add(signBoard);

    // Station Clock
    const clockGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 16);
    const clock = new THREE.Mesh(clockGeo, goldMat);
    clock.rotation.x = Math.PI / 2;
    clock.position.set(-0.8, pHeight + 2.7, 4.5);
    group.add(clock);

    // Platform Bench
    const benchSeatGeo = new THREE.BoxGeometry(0.6, 0.1, 2.0);
    const benchSeat = new THREE.Mesh(benchSeatGeo, woodMat);
    benchSeat.position.set(-1.0, pHeight + 0.35, -2.0);
    benchSeat.castShadow = true;
    group.add(benchSeat);

    group.userData = { type: 'station' };
    return group;
  }
}
