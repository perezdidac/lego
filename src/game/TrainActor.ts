import * as THREE from 'three';
import { BrickFactory } from '../engine/BrickFactory';
import { TrackNetwork } from '../engine/TrackNetwork';
import { soundSynth } from '../engine/SoundSynth';

interface SmokeParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  initialScale: number;
}

export class TrainActor {
  public root: THREE.Group;
  private trackNetwork: TrackNetwork;
  private wheels: THREE.Mesh[] = [];
  private rods: THREE.Mesh[] = [];
  private chimneyLocalPos: THREE.Vector3;
  private headlight: THREE.SpotLight;

  // Tender & passenger carriage
  private tenderGroup: THREE.Group = new THREE.Group();
  private coachGroup: THREE.Group = new THREE.Group();
  private tenderWheels: THREE.Mesh[] = [];
  private coachWheels: THREE.Mesh[] = [];

  // Physics state
  public distance: number = 0; // meters along track
  public speed: number = 0;    // current speed in m/s
  public throttle: number = 0; // -1 to 1
  public isBraking: boolean = false;
  public maxSpeed: number = 11.0; // ~40 km/h in toy scale
  private acceleration: number = 4.0;
  private brakeDecel: number = 9.0;
  private friction: number = 1.2;

  // Whistle state
  public isWhistling: boolean = false;
  private whistleTimer: number = 0;

  // Smoke system
  private smokeParticles: SmokeParticle[] = [];
  private smokeMaterial: THREE.MeshStandardMaterial;
  private smokeGeometry: THREE.SphereGeometry;
  private smokeTimer: number = 0;

  // Wheel math
  private wheelRadius: number = 0.52;
  private totalWheelRotation: number = 0;

  constructor(trackNetwork: TrackNetwork, scene: THREE.Scene) {
    this.trackNetwork = trackNetwork;
    this.root = new THREE.Group();

    // 1. Build Locomotive
    const locoData = BrickFactory.createLocomotiveGroup();
    this.root.add(locoData.root);
    this.wheels = locoData.wheels;
    this.rods = locoData.rods;
    this.chimneyLocalPos = locoData.chimneyTop;
    this.headlight = locoData.headlight;

    // 2. Build Coal Tender Carriage
    this.buildTenderCar();

    // 3. Build Passenger Carriage
    this.buildPassengerCoach();

    // 4. Smoke Particle Setup
    this.smokeGeometry = new THREE.SphereGeometry(0.25, 8, 8);
    this.smokeMaterial = new THREE.MeshStandardMaterial({
      color: 0xF5F5F5,
      transparent: true,
      opacity: 0.6,
      roughness: 0.9,
      metalness: 0.0
    });

    scene.add(this.root);
    scene.add(this.tenderGroup);
    scene.add(this.coachGroup);

    // Initial position on track (start in front of station)
    this.distance = 4.0;
    this.updatePositionOnTrack();
  }

  private buildTenderCar(): void {
    const chassisGeo = new THREE.BoxGeometry(1.9, 0.3, 3.2);
    const blackMat = BrickFactory.getMaterial('#1B1B1B', 0.25, 0.1);
    const redMat = BrickFactory.getMaterial('#D11A2A', 0.2, 0.05);
    const chassis = new THREE.Mesh(chassisGeo, blackMat);
    chassis.position.set(0, 0.65, 0);
    chassis.castShadow = true;
    this.tenderGroup.add(chassis);

    // Coal bin walls
    const wallGeo = new THREE.BoxGeometry(1.8, 0.9, 2.9);
    const walls = new THREE.Mesh(wallGeo, redMat);
    walls.position.set(0, 1.25, 0);
    walls.castShadow = true;
    this.tenderGroup.add(walls);

    // Lumpy black coal inside
    const coalGeo = new THREE.DodecahedronGeometry(0.75, 1);
    const coalMat = BrickFactory.getMaterial('#111111', 0.8, 0.0);
    const coal = new THREE.Mesh(coalGeo, coalMat);
    coal.position.set(0, 1.8, 0);
    coal.scale.set(1.1, 0.5, 1.8);
    this.tenderGroup.add(coal);

    // Tender wheels (4 wheels) centered around local origin
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.15, 16);
    [-1.0, 1.0].forEach((side) => {
      [-0.9, 0.9].forEach((zPos) => {
        const wGroup = new THREE.Group();
        wGroup.position.set(side * 1.0, 0.38, zPos);
        const wMesh = new THREE.Mesh(wheelGeo, blackMat);
        wMesh.rotation.z = Math.PI / 2;
        wMesh.castShadow = true;
        wGroup.add(wMesh);
        this.tenderGroup.add(wGroup);
        this.tenderWheels.push(wGroup as unknown as THREE.Mesh);
      });
    });

    // Hitch link pointing forward (+Z toward loco)
    const hitchGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8);
    const hitchFront = new THREE.Mesh(hitchGeo, blackMat);
    hitchFront.rotation.x = Math.PI / 2;
    hitchFront.position.set(0, 0.65, 1.8);
    this.tenderGroup.add(hitchFront);

    // Hitch link pointing rear (-Z toward coach)
    const hitchRear = new THREE.Mesh(hitchGeo, blackMat);
    hitchRear.rotation.x = Math.PI / 2;
    hitchRear.position.set(0, 0.65, -1.8);
    this.tenderGroup.add(hitchRear);
  }

  private buildPassengerCoach(): void {
    const chassisGeo = new THREE.BoxGeometry(1.9, 0.3, 4.4);
    const blackMat = BrickFactory.getMaterial('#1B1B1B', 0.25, 0.1);
    const greenMat = BrickFactory.getMaterial('#237841', 0.2, 0.05); // Verd joguina
    const yellowMat = BrickFactory.getMaterial('#FAC80A', 0.2, 0.05);
    const whiteMat = BrickFactory.getMaterial('#F4F4F4', 0.2, 0.05);

    const chassis = new THREE.Mesh(chassisGeo, blackMat);
    chassis.position.set(0, 0.65, 0);
    chassis.castShadow = true;
    this.coachGroup.add(chassis);

    // Cabin body
    const bodyGeo = new THREE.BoxGeometry(1.9, 1.5, 4.2);
    const body = new THREE.Mesh(bodyGeo, greenMat);
    body.position.set(0, 1.55, 0);
    body.castShadow = true;
    this.coachGroup.add(body);

    // Yellow windows on sides
    [-0.98, 0.98].forEach((xPos) => {
      [-1.3, 0.0, 1.3].forEach((zPos) => {
        const winGeo = new THREE.BoxGeometry(0.05, 0.5, 0.7);
        const win = new THREE.Mesh(winGeo, yellowMat);
        win.position.set(xPos, 1.7, zPos);
        this.coachGroup.add(win);
      });
    });

    // White Roof
    const roofGeo = new THREE.BoxGeometry(2.1, 0.25, 4.5);
    const roof = new THREE.Mesh(roofGeo, whiteMat);
    roof.position.set(0, 2.4, 0);
    roof.castShadow = true;
    this.coachGroup.add(roof);

    // Coach wheels (4 wheels) centered around local origin
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.15, 16);
    [-1.0, 1.0].forEach((side) => {
      [-1.5, 1.5].forEach((zPos) => {
        const wGroup = new THREE.Group();
        wGroup.position.set(side * 1.0, 0.38, zPos);
        const wMesh = new THREE.Mesh(wheelGeo, blackMat);
        wMesh.rotation.z = Math.PI / 2;
        wMesh.castShadow = true;
        wGroup.add(wMesh);
        this.coachGroup.add(wGroup);
        this.coachWheels.push(wGroup as unknown as THREE.Mesh);
      });
    });

    // Hitch link pointing forward (+Z toward tender)
    const hitchGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8);
    const hitch = new THREE.Mesh(hitchGeo, blackMat);
    hitch.rotation.x = Math.PI / 2;
    hitch.position.set(0, 0.65, 2.4);
    this.coachGroup.add(hitch);
  }

  public setThrottle(val: number): void {
    this.throttle = THREE.MathUtils.clamp(val, -1.0, 1.0);
  }

  public applyBrake(active: boolean): void {
    if (active && !this.isBraking && Math.abs(this.speed) > 1.0) {
      soundSynth.playBrake();
    }
    this.isBraking = active;
  }

  public pullWhistle(): void {
    soundSynth.playWhistle();
    this.isWhistling = true;
    this.whistleTimer = 1.3;
    // Spawn extra thick white steam puff bursts!
    for (let i = 0; i < 6; i++) {
      this.spawnSmokeParticle(true);
    }
  }

  public update(dt: number): void {
    const clampedDt = Math.min(dt, 0.1);

    // 1. Train Physics & Throttle solver
    const targetSpeed = this.throttle * this.maxSpeed;

    if (this.isBraking) {
      if (this.speed > 0) {
        this.speed = Math.max(0, this.speed - this.brakeDecel * clampedDt);
      } else if (this.speed < 0) {
        this.speed = Math.min(0, this.speed + this.brakeDecel * clampedDt);
      }
    } else {
      if (Math.abs(targetSpeed) > 0.01) {
        const diff = targetSpeed - this.speed;
        this.speed += Math.sign(diff) * Math.min(Math.abs(diff), this.acceleration * clampedDt);
      } else {
        // Friction roll down
        if (Math.abs(this.speed) > 0.01) {
          const decel = this.friction * clampedDt;
          if (this.speed > 0) this.speed = Math.max(0, this.speed - decel);
          else this.speed = Math.min(0, this.speed + decel);
        } else {
          this.speed = 0;
        }
      }
    }

    // Check track bounds and bridge passage constraint:
    const nextDistance = this.distance + this.speed * clampedDt;
    const isCustom = this.trackNetwork.getActiveRoute() === 'custom';
    const isLoop = isCustom ? this.trackNetwork.getIsCustomLoop() : true;
    const totalLen = this.trackNetwork.getTotalLength();

    if (isCustom && !isLoop) {
      // Linear non-looping track: bounce back gently at track buffer ends!
      if (nextDistance >= totalLen - 0.6 && this.speed > 0) {
        this.distance = Math.max(0.2, totalLen - 0.6);
        this.speed = -this.speed * 0.35;
        this.throttle = 0;
        soundSynth.playBrake();
      } else if (nextDistance <= 0.6 && this.speed < 0) {
        this.distance = Math.min(totalLen - 0.2, 0.6);
        this.speed = -this.speed * 0.35;
        this.throttle = 0;
        soundSynth.playBrake();
      } else {
        this.distance = nextDistance;
      }
    } else if (!this.trackNetwork.canTrainPassAt(nextDistance) && !this.trackNetwork.isBridgeComplete()) {
      if (this.speed > 0) {
        this.speed = 0;
        this.throttle = 0;
        soundSynth.playBrake();
      }
    } else {
      this.distance = nextDistance;
    }

    // 2. Audio Chuff synchronization
    soundSynth.updateTrainSpeed(Math.abs(this.speed) / this.maxSpeed);

    // 3. Wheel and Rod rotation
    const deltaRot = (this.speed * clampedDt) / this.wheelRadius;
    this.totalWheelRotation += deltaRot;

    this.wheels.forEach((w) => {
      w.rotation.x = this.totalWheelRotation;
    });
    this.tenderWheels.forEach((w) => {
      w.rotation.x = this.totalWheelRotation * (this.wheelRadius / 0.38);
    });
    this.coachWheels.forEach((w) => {
      w.rotation.x = this.totalWheelRotation * (this.wheelRadius / 0.38);
    });

    // Connecting side rods move in eccentric circular offset
    const rodEccentricity = 0.22;
    const rodOffY = Math.sin(this.totalWheelRotation) * rodEccentricity;
    const rodOffZ = Math.cos(this.totalWheelRotation) * rodEccentricity;
    this.rods.forEach((rod) => {
      rod.position.y = 0.35 + rodOffY;
      rod.position.z = rodOffZ;
    });

    // 4. Update 3D position along track spline
    this.updatePositionOnTrack();

    // 5. Whistle timer
    if (this.isWhistling) {
      this.whistleTimer -= clampedDt;
      if (this.whistleTimer <= 0) {
        this.isWhistling = false;
      }
    }

    // 6. Smoke Particle Spawning & Update
    this.updateSmokeParticles(clampedDt);
  }

  public updatePositionOnTrack(): void {
    // 1. Locomotive with bogie wheelbase 3.0
    const locoTransform = this.trackNetwork.getTransformAtDistance(this.distance, 3.0);
    this.root.position.copy(locoTransform.position);
    this.root.quaternion.copy(locoTransform.quaternion);

    // Smooth chassis sway based on speed
    const swayAngle = Math.sin(this.totalWheelRotation * 1.5) * (Math.abs(this.speed) / this.maxSpeed) * 0.03;
    this.root.rotateZ(swayAngle);

    // 2. Coal Tender Carriage (centered at distance - 4.4, bogie wheelbase 1.8)
    const tenderTransform = this.trackNetwork.getTransformAtDistance(this.distance - 4.4, 1.8);
    this.tenderGroup.position.copy(tenderTransform.position);
    this.tenderGroup.quaternion.copy(tenderTransform.quaternion);
    this.tenderGroup.rotateZ(-swayAngle * 0.7);

    // 3. Passenger Coach Carriage (centered at distance - 8.6, bogie wheelbase 3.2)
    const coachTransform = this.trackNetwork.getTransformAtDistance(this.distance - 8.6, 3.2);
    this.coachGroup.position.copy(coachTransform.position);
    this.coachGroup.quaternion.copy(coachTransform.quaternion);
    this.coachGroup.rotateZ(swayAngle * 0.5);
  }

  public snapToClosestTrackPoint(worldPos: THREE.Vector3): void {
    const len = this.trackNetwork.getTotalLength();
    let bestDist = 0;
    let minDistanceSq = Infinity;
    const samples = 120;
    for (let i = 0; i < samples; i++) {
      const d = (i / samples) * len;
      const pt = this.trackNetwork.getTransformAtDistance(d).position;
      const distSq = pt.distanceToSquared(worldPos);
      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        bestDist = d;
      }
    }
    this.distance = bestDist;
    this.speed = 0;
    this.throttle = 0;
    this.updatePositionOnTrack();
  }

  private updateSmokeParticles(dt: number): void {
    // Spawn rate scales with speed & whistling
    const speedRatio = Math.abs(this.speed) / this.maxSpeed;
    const interval = this.isWhistling ? 0.03 : Math.max(0.06, 0.4 - speedRatio * 0.32);

    this.smokeTimer += dt;
    if (this.smokeTimer >= interval) {
      this.smokeTimer = 0;
      this.spawnSmokeParticle(this.isWhistling);
    }

    // Update existing particles
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const p = this.smokeParticles[i];
      p.life += dt;

      if (p.life >= p.maxLife) {
        this.root.parent?.remove(p.mesh);
        p.mesh.geometry.dispose();
        this.smokeParticles.splice(i, 1);
        continue;
      }

      // Position update
      p.mesh.position.addScaledVector(p.velocity, dt);

      // Expansion
      const progress = p.life / p.maxLife;
      const currentScale = p.initialScale * (1.0 + progress * 2.8);
      p.mesh.scale.setScalar(currentScale);

      // Fade out
      const mat = p.mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = (1.0 - progress) * 0.55;
    }
  }

  private spawnSmokeParticle(isWhistle: boolean): void {
    if (!this.root.parent) return;

    // Chimney top world position
    const chimneyWorld = this.chimneyLocalPos.clone().applyMatrix4(this.root.matrixWorld);

    const mat = this.smokeMaterial.clone();
    const mesh = new THREE.Mesh(this.smokeGeometry, mat);
    mesh.position.copy(chimneyWorld);

    // Initial scale
    const initialScale = isWhistle ? 1.2 : 0.6 + Math.random() * 0.3;
    mesh.scale.setScalar(initialScale);

    // Velocity: upwards + slight drag backwards from train travel
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.root.quaternion).normalize();
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.4,
      1.8 + Math.random() * 0.8,
      (Math.random() - 0.5) * 0.4
    );

    // Train backward draft
    velocity.addScaledVector(forward, -this.speed * 0.55);

    this.root.parent.add(mesh);

    this.smokeParticles.push({
      mesh,
      velocity,
      life: 0,
      maxLife: 1.1 + Math.random() * 0.5,
      initialScale
    });
  }

  public getHeadlight(): THREE.SpotLight {
    return this.headlight;
  }
}
