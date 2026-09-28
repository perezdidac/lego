import * as THREE from 'three';
import { SceneController, type CameraViewMode } from '../engine/SceneController';
import { GridSystem } from '../engine/GridSystem';
import { TrackNetwork } from '../engine/TrackNetwork';
import { TrainActor } from './TrainActor';
import { MissionManager, type MissionId } from './MissionManager';
import { PaletteUI } from '../ui/PaletteUI';
import { TrainControlsUI } from '../ui/TrainControlsUI';
import { MissionCardUI } from '../ui/MissionCardUI';
import { voiceHandler } from '../engine/VoiceHandler';

export type GameMode = 'BUILD' | 'DRIVE';

export class GameManager {
  public readonly container: HTMLElement;
  private sceneController: SceneController;
  private trackNetwork: TrackNetwork;
  private trainActor: TrainActor;
  private gridSystem: GridSystem;
  private missionManager: MissionManager;

  // UI
  private paletteUI: PaletteUI;
  private trainControlsUI: TrainControlsUI;
  public readonly missionCardUI: MissionCardUI;

  private currentMode: GameMode = 'BUILD';
  private isDeleteMode: boolean = false;

  // Pointer / Touch tracking
  private pointerNDC: THREE.Vector2 = new THREE.Vector2(-999, -999);
  private pointerDownPos: { x: number; y: number } = { x: 0, y: 0 };
  private isPointerDown: boolean = false;
  private isDragging: boolean = false;
  private dragThreshold: number = 8; // pixels

  // Clock
  private clock: THREE.Clock = new THREE.Clock();

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene & Camera Engine
    this.sceneController = new SceneController(container);

    // 2. Track Network
    this.trackNetwork = new TrackNetwork(this.sceneController.scene);

    // 3. Train Actor
    this.trainActor = new TrainActor(this.trackNetwork, this.sceneController.scene);

    // 4. Grid Snapping System
    this.gridSystem = new GridSystem(this.sceneController.scene, this.sceneController.camera);
    this.gridSystem.setTrackNetwork(this.trackNetwork);

    // 5. Narrative Mission Manager
    this.missionManager = new MissionManager(this.trackNetwork, this.trainActor);

    // Hook grid bridge slot placement into MissionManager & TrackNetwork
    this.gridSystem.setBridgeCallback((slotIndex: number, brickGroup: THREE.Group) => {
      this.trackNetwork.fillBridgeSlot(slotIndex, brickGroup);
      this.missionManager.handleBridgeSlotFilled(slotIndex);
    });

    // 6. UI Components
    const uiLayer = document.createElement('div');
    uiLayer.className = 'game-ui-layer';
    container.appendChild(uiLayer);

    // Top Mission Card & Catalan Narrator Header (sits at top of screen)
    this.missionCardUI = new MissionCardUI(uiLayer, this.missionManager, {
      onMissionSelect: (id: MissionId) => {
        this.missionManager.startMission(id);
      },
      onToolSuggest: (shape) => {
        this.paletteUI.selectShape(shape);
        this.gridSystem.setToolShape(shape);
      }
    });

    // Bottom Building Palette UI (sits at bottom of screen)
    this.paletteUI = new PaletteUI(uiLayer, {
      onColorSelect: (colorHex: string, colorKey: string) => {
        this.gridSystem.setToolColor(colorHex);
        this.missionManager.handleColorSelected(colorKey);
      },
      onShapeSelect: (shape) => {
        this.gridSystem.setToolShape(shape);
      },
      onRotate: () => {
        this.gridSystem.rotateTool();
      },
      onUndo: () => {
        this.gridSystem.undoLastBrick();
      },
      onDeleteToggle: (isDelete) => {
        this.isDeleteMode = isDelete;
        this.gridSystem.setGhostVisible(!isDelete);
      },
      onSwitchToDrive: () => {
        this.setMode('DRIVE');
      }
    });

    // Suggest palette category when mission changes
    this.missionManager.setOnCategorySuggest((cat) => {
      this.paletteUI.setCategory(cat);
    });

    // Conductor HUD Controls UI
    this.trainControlsUI = new TrainControlsUI(uiLayer, this.trainActor, this.trackNetwork, {
      onWhistle: () => {
        this.missionManager.handleWhistleTriggered();
      },
      onCameraChange: (camMode: CameraViewMode) => {
        this.sceneController.setViewMode(camMode);
      },
      onSwitchToBuild: () => {
        this.setMode('BUILD');
      }
    });

    // 7. Input Handlers
    this.setupInputHandlers();

    // 8. Start with Mission 1
    this.missionManager.startMission('bridge_repair');

    // 9. Start Game Loop
    this.tick = this.tick.bind(this);
    requestAnimationFrame(this.tick);
  }

  public setMode(mode: GameMode): void {
    this.currentMode = mode;

    if (mode === 'BUILD') {
      this.paletteUI.setVisible(true);
      this.trainControlsUI.setVisible(false);
      this.gridSystem.setGhostVisible(!this.isDeleteMode);
      this.sceneController.setViewMode('orbit');
    } else {
      // DRIVE MODE
      this.paletteUI.setVisible(false);
      this.trainControlsUI.setVisible(true);
      this.trainControlsUI.resetThrottle();
      this.gridSystem.setGhostVisible(false);
      this.sceneController.setViewMode('chase');

      voiceHandler.speak('Pujat a la màquina de vapor! Toca la palanca per accelerar i fes sonar el xiulet!');
    }
  }

  private setupInputHandlers(): void {
    const dom = this.sceneController.renderer.domElement;

    // Pointer move
    const onPointerMove = (e: MouseEvent | Touch) => {
      this.pointerNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointerNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (this.isPointerDown) {
        const dx = e.clientX - this.pointerDownPos.x;
        const dy = e.clientY - this.pointerDownPos.y;
        if (Math.hypot(dx, dy) > this.dragThreshold) {
          this.isDragging = true;
        }
      }

      if (this.currentMode === 'BUILD' && !this.isDeleteMode && !this.isDragging) {
        this.gridSystem.updatePointerPosition(this.pointerNDC);
      }
    };

    dom.addEventListener('mousemove', (e) => onPointerMove(e));
    dom.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        onPointerMove(e.touches[0]);
      }
    }, { passive: true });

    // Pointer down
    const onPointerDown = (clientX: number, clientY: number) => {
      this.isPointerDown = true;
      this.isDragging = false;
      this.pointerDownPos = { x: clientX, y: clientY };
    };

    dom.addEventListener('mousedown', (e) => onPointerDown(e.clientX, e.clientY));
    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Pointer up
    const onPointerUp = (clientX: number, clientY: number) => {
      if (this.isPointerDown && !this.isDragging) {
        // Crisp single tap / click
        this.pointerNDC.x = (clientX / window.innerWidth) * 2 - 1;
        this.pointerNDC.y = -(clientY / window.innerHeight) * 2 + 1;

        if (this.currentMode === 'BUILD') {
          if (this.isDeleteMode) {
            this.gridSystem.deleteBrickUnderPointer(this.pointerNDC);
          } else {
            this.gridSystem.updatePointerPosition(this.pointerNDC);
            const placed = this.gridSystem.placeCurrentBrick();
            if (placed) {
              this.missionManager.handlePiecePlaced(placed.shape);
            }
          }
        }
      }

      this.isPointerDown = false;
      this.isDragging = false;
    };

    dom.addEventListener('mouseup', (e) => onPointerUp(e.clientX, e.clientY));
    dom.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0) {
        onPointerUp(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'r' || e.key === 'R') {
        this.gridSystem.rotateTool();
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        this.gridSystem.undoLastBrick();
      } else if (e.key === ' ') {
        // Spacebar blows whistle in Conductor Mode!
        if (this.currentMode === 'DRIVE') {
          this.trainActor.pullWhistle();
          this.missionManager.handleWhistleTriggered();
        }
      }
    });
  }

  private tick(): void {
    requestAnimationFrame(this.tick);

    const dt = this.clock.getDelta();

    // 1. Update Train
    this.trainActor.update(dt);

    // 2. Update Scene & Camera
    this.sceneController.update(dt);
    if (this.currentMode === 'DRIVE') {
      this.sceneController.updateCameraForTrain(
        this.trainActor.root,
        this.trainActor.speed,
        dt
      );
      this.trainControlsUI.update();
    }

    // 3. Update Grid animations
    this.gridSystem.update(dt);

    // 4. Update Mission Manager triggers
    this.missionManager.update(this.trainActor.distance, this.trainActor.speed);

    // 5. Render Three.js Scene
    this.sceneController.render();
  }
}
