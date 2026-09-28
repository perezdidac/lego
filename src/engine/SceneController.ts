import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type CameraViewMode = 'orbit' | 'chase' | 'cab' | 'top';

export class SceneController {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public controls: OrbitControls;

  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private clouds: THREE.Group = new THREE.Group();

  // Camera transition state
  public viewMode: CameraViewMode = 'orbit';
  private targetCameraPos: THREE.Vector3 = new THREE.Vector3();
  private targetLookAt: THREE.Vector3 = new THREE.Vector3();
  private currentLookAt: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  constructor(container: HTMLElement) {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#BEE3F8'); // Soft sunny pastel sky
    this.scene.fog = new THREE.FogExp2('#BEE3F8', 0.009); // Clear sunny horizon for larger world

    // 2. Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(46, aspect, 0.2, 250);
    this.camera.position.set(20, 26, 24); // 3/4 isometric view displaying whole landscape!

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls (Ergonomics for 5yo child)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.target.set(0, 1, 0);

    // Critical constraint: restrict polar angle so child CANNOT flip upside down!
    this.controls.minPolarAngle = THREE.MathUtils.degToRad(18); // ~18 deg
    this.controls.maxPolarAngle = THREE.MathUtils.degToRad(78); // ~78 deg

    // Distance bounds (allows zooming out to admire full 56x56 baseplate!)
    this.controls.minDistance = 6;
    this.controls.maxDistance = 80;

    // 5. Lighting
    // Directional Sunlight with soft shadow cascade
    this.dirLight = new THREE.DirectionalLight('#FFF9E6', 2.2);
    this.dirLight.position.set(28, 42, 26);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 5;
    this.dirLight.shadow.camera.far = 110;
    this.dirLight.shadow.camera.left = -36;
    this.dirLight.shadow.camera.right = 36;
    this.dirLight.shadow.camera.top = 36;
    this.dirLight.shadow.camera.bottom = -36;
    this.dirLight.shadow.bias = -0.0006;
    this.scene.add(this.dirLight);

    // Hemisphere Ambient Bounce Light (Sky + Toy Grass bounce)
    this.hemiLight = new THREE.HemisphereLight('#E0F2FE', '#4ADE80', 1.1);
    this.scene.add(this.hemiLight);

    const ambient = new THREE.AmbientLight('#FFFFFF', 0.5);
    this.scene.add(ambient);

    // 6. Sky & Toy Clouds
    this.buildSkyAndClouds();

    // 7. Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private buildSkyAndClouds(): void {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.9,
      metalness: 0.0
    });

    const cloudPuffGeo = new THREE.SphereGeometry(1.5, 8, 8);

    // Procedural fluffy cloud clusters
    const cloudPositions = [
      { x: -30, y: 28, z: -35, puffs: 4 },
      { x: 25, y: 32, z: -40, puffs: 5 },
      { x: -20, y: 30, z: 30, puffs: 4 },
      { x: 35, y: 26, z: 25, puffs: 5 },
      { x: 0, y: 35, z: -45, puffs: 6 }
    ];

    cloudPositions.forEach((cp) => {
      const cluster = new THREE.Group();
      cluster.position.set(cp.x, cp.y, cp.z);

      for (let i = 0; i < cp.puffs; i++) {
        const puff = new THREE.Mesh(cloudPuffGeo, cloudMat);
        puff.position.set(
          (Math.random() - 0.5) * 4.0,
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 3.0
        );
        const s = 1.0 + Math.random() * 0.9;
        puff.scale.set(s * 1.3, s * 0.8, s);
        cluster.add(puff);
      }
      this.clouds.add(cluster);
    });

    this.scene.add(this.clouds);
  }

  public setViewMode(mode: CameraViewMode): void {
    this.viewMode = mode;
    if (mode === 'orbit') {
      this.controls.enabled = true;
    } else {
      this.controls.enabled = false;
    }
  }

  public updateCameraForTrain(
    trainRoot: THREE.Group,
    trainSpeed: number,
    dt: number
  ): void {
    if (this.viewMode === 'orbit') {
      this.controls.update();
      return;
    }

    const trainPos = trainRoot.position;
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(trainRoot.quaternion).normalize();
    const up = new THREE.Vector3(0, 1, 0);

    if (this.viewMode === 'chase') {
      // Third person chase camera behind the entire train (loco + tender + coach)
      const chaseDist = 15.0 + (Math.abs(trainSpeed) / 12) * 2.5;
      const chaseHeight = 5.8;

      this.targetCameraPos.copy(trainPos)
        .addScaledVector(forward, -chaseDist)
        .addScaledVector(up, chaseHeight);

      this.targetLookAt.copy(trainPos).addScaledVector(forward, 2.0).addScaledVector(up, 1.8);

      // Smooth lerp
      const lerpFactor = Math.min(1.0, dt * 5.0);
      this.camera.position.lerp(this.targetCameraPos, lerpFactor);
      this.currentLookAt.lerp(this.targetLookAt, lerpFactor);
      this.camera.lookAt(this.currentLookAt);

    } else if (this.viewMode === 'cab') {
      // Driver Cab View looking through front windshield over the boiler
      const cabOffset = new THREE.Vector3(0, 2.4, -1.2).applyQuaternion(trainRoot.quaternion);
      this.targetCameraPos.copy(trainPos).add(cabOffset);
      this.targetLookAt.copy(trainPos).addScaledVector(forward, 15.0).addScaledVector(up, 1.6);

      const lerpFactor = Math.min(1.0, dt * 10.0);
      this.camera.position.lerp(this.targetCameraPos, lerpFactor);
      this.currentLookAt.lerp(this.targetLookAt, lerpFactor);
      this.camera.lookAt(this.currentLookAt);
    } else if (this.viewMode === 'top') {
      // High isometric / top view
      this.targetCameraPos.copy(trainPos).add(new THREE.Vector3(0, 24, 8));
      this.targetLookAt.copy(trainPos);

      const lerpFactor = Math.min(1.0, dt * 4.0);
      this.camera.position.lerp(this.targetCameraPos, lerpFactor);
      this.currentLookAt.lerp(this.targetLookAt, lerpFactor);
      this.camera.lookAt(this.currentLookAt);
    }
  }

  public update(dt: number): void {
    // Slowly drift clouds across the toy sky
    this.clouds.children.forEach((cluster) => {
      cluster.position.x += dt * 0.4;
      if (cluster.position.x > 50) {
        cluster.position.x = -50;
      }
    });

    if (this.viewMode === 'orbit') {
      this.controls.update();
    }
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  public resetOrbitTarget(target: THREE.Vector3 = new THREE.Vector3(0, 1, 0)): void {
    this.controls.target.copy(target);
    this.camera.position.set(target.x, target.y + 18, target.z + 24);
    this.controls.update();
  }
}
