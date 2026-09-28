import confetti from 'canvas-confetti';
import { CATALAN_MISSIONS, CATALAN_COLORS } from '../data/catalanAudioCatalog';
import { voiceHandler, type SpeechCommand } from '../engine/VoiceHandler';
import { soundSynth } from '../engine/SoundSynth';
import { TrackNetwork } from '../engine/TrackNetwork';
import { TrainActor } from './TrainActor';

export type MissionId =
  | 'bridge_repair'
  | 'whistle_and_drive'
  | 'flower_station'
  | 'cozy_cottage'
  | 'lay_tracks'
  | 'town_festival'
  | 'free_build';

export interface MissionState {
  currentMissionId: MissionId;
  bridgeBlocksPlaced: number;
  hasWhistled: boolean;
  hasDrivenAcrossBridge: boolean;
  flowersPlaced: number;
  treesPlaced: number;
  // Mission 4: Cottage
  doorsPlaced: number;
  windowsPlaced: number;
  roofsPlaced: number;
  // Mission 5: Tracks
  tracksPlaced: number;
  // Mission 6: Town
  passengersPlaced: number;
  lampsPlaced: number;
  isMissionCompleted: boolean;
}

export class MissionManager {
  private trackNetwork: TrackNetwork;
  private trainActor: TrainActor;
  private state: MissionState = {
    currentMissionId: 'bridge_repair',
    bridgeBlocksPlaced: 0,
    hasWhistled: false,
    hasDrivenAcrossBridge: false,
    flowersPlaced: 0,
    treesPlaced: 0,
    doorsPlaced: 0,
    windowsPlaced: 0,
    roofsPlaced: 0,
    tracksPlaced: 0,
    passengersPlaced: 0,
    lampsPlaced: 0,
    isMissionCompleted: false
  };

  private onStateChangeCallbacks: ((state: MissionState) => void)[] = [];
  private onCategorySuggestCallback?: (cat: 'bloc' | 'casa' | 'vies' | 'natura') => void;

  constructor(trackNetwork: TrackNetwork, trainActor: TrainActor) {
    this.trackNetwork = trackNetwork;
    this.trainActor = trainActor;

    this.setupVoiceListener();
  }

  public setOnCategorySuggest(cb: (cat: 'bloc' | 'casa' | 'vies' | 'natura') => void): void {
    this.onCategorySuggestCallback = cb;
  }

  public onStateChange(cb: (state: MissionState) => void): () => void {
    this.onStateChangeCallbacks.push(cb);
    cb(this.state);
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter(c => c !== cb);
    };
  }

  private notifyStateChange(): void {
    this.onStateChangeCallbacks.forEach(cb => cb({ ...this.state }));
  }

  public startMission(missionId: MissionId): void {
    this.state.currentMissionId = missionId;
    this.state.isMissionCompleted = false;

    if (missionId === 'bridge_repair') {
      this.state.bridgeBlocksPlaced = 0;
      voiceHandler.speak(CATALAN_MISSIONS.mission1.introPrompt, true);
      this.onCategorySuggestCallback?.('bloc');
    } else if (missionId === 'whistle_and_drive') {
      this.state.hasWhistled = false;
      this.state.hasDrivenAcrossBridge = false;
      voiceHandler.speak(CATALAN_MISSIONS.mission2.introPrompt, true);
    } else if (missionId === 'flower_station') {
      this.state.flowersPlaced = 0;
      this.state.treesPlaced = 0;
      voiceHandler.speak(CATALAN_MISSIONS.mission3.introPrompt, true);
      this.onCategorySuggestCallback?.('natura');
    } else if (missionId === 'cozy_cottage') {
      this.state.doorsPlaced = 0;
      this.state.windowsPlaced = 0;
      this.state.roofsPlaced = 0;
      voiceHandler.speak(CATALAN_MISSIONS.mission4.introPrompt, true);
      this.onCategorySuggestCallback?.('casa');
    } else if (missionId === 'lay_tracks') {
      this.state.tracksPlaced = 0;
      voiceHandler.speak(CATALAN_MISSIONS.mission5.introPrompt, true);
      this.onCategorySuggestCallback?.('vies');
    } else if (missionId === 'town_festival') {
      this.state.passengersPlaced = 0;
      this.state.lampsPlaced = 0;
      voiceHandler.speak(CATALAN_MISSIONS.mission6.introPrompt, true);
      this.onCategorySuggestCallback?.('natura');
    } else if (missionId === 'free_build') {
      voiceHandler.speak('Mode Construcció Lliure! Pots crear el teu propi món de joguina i conduir el tren!', true);
    }

    this.notifyStateChange();
  }

  /**
   * Called when player picks a color
   */
  public handleColorSelected(colorKey: string): void {
    const colorInfo = CATALAN_COLORS[colorKey];
    if (colorInfo) {
      voiceHandler.speak(colorInfo.phrase);
    }
  }

  /**
   * Called when a block is placed into a bridge slot
   */
  public handleBridgeSlotFilled(_slotIndex: number): void {
    this.state.bridgeBlocksPlaced++;
    this.notifyStateChange();

    if (this.state.bridgeBlocksPlaced === 1) {
      voiceHandler.speak(CATALAN_MISSIONS.mission1.step1Prompt);
    } else if (this.state.bridgeBlocksPlaced === 2) {
      voiceHandler.speak(CATALAN_MISSIONS.mission1.step2Prompt);
    } else if (this.state.bridgeBlocksPlaced >= 3) {
      this.completeMission('bridge_repair', CATALAN_MISSIONS.mission1.completedPrompt, 'whistle_and_drive');
    }
  }

  /**
   * Called when whistle is triggered
   */
  public handleWhistleTriggered(): void {
    if (this.state.currentMissionId === 'whistle_and_drive' && !this.state.hasWhistled) {
      this.state.hasWhistled = true;
      this.notifyStateChange();
      voiceHandler.speak(CATALAN_MISSIONS.mission2.whistleDonePrompt);
    }
  }

  /**
   * Called during train update loop to check narrative triggers
   */
  public update(trainDistance: number, trainSpeed: number): void {
    if (this.state.currentMissionId === 'whistle_and_drive' && this.state.hasWhistled && !this.state.hasDrivenAcrossBridge) {
      const totalLen = this.trackNetwork.getTotalLength();
      const bridgeStart = totalLen * 0.28;
      const bridgeEnd = totalLen * 0.42;

      const normDist = trainDistance % totalLen;
      if (normDist >= bridgeStart && normDist <= bridgeEnd && Math.abs(trainSpeed) > 1.5) {
        this.state.hasDrivenAcrossBridge = true;
        this.completeMission('whistle_and_drive', CATALAN_MISSIONS.mission2.completedPrompt, 'flower_station');
      }
    }
  }

  /**
   * Called whenever ANY piece is placed in GridSystem
   */
  public handlePiecePlaced(shape: string): void {
    // 1. Mission 3: Flower Station
    if (shape === 'flower') {
      this.state.flowersPlaced++;
    } else if (shape === 'tree_pine' || shape === 'tree_apple') {
      this.state.treesPlaced++;
    }

    if (this.state.currentMissionId === 'flower_station' && !this.state.isMissionCompleted) {
      this.notifyStateChange();
      if (this.state.flowersPlaced >= 2 && this.state.treesPlaced >= 1) {
        this.completeMission('flower_station', CATALAN_MISSIONS.mission3.completedPrompt, 'cozy_cottage');
        return;
      }
    }

    // 2. Mission 4: Cozy Cottage
    if (shape === 'porta') {
      this.state.doorsPlaced++;
      if (this.state.currentMissionId === 'cozy_cottage') {
        voiceHandler.speak(CATALAN_MISSIONS.mission4.doorDonePrompt);
      }
    } else if (shape === 'finestra') {
      this.state.windowsPlaced++;
      if (this.state.currentMissionId === 'cozy_cottage') {
        voiceHandler.speak(CATALAN_MISSIONS.mission4.windowDonePrompt);
      }
    } else if (shape === 'slope2x2' || shape === 'slope2x4') {
      this.state.roofsPlaced++;
      if (this.state.currentMissionId === 'cozy_cottage') {
        voiceHandler.speak(CATALAN_MISSIONS.mission4.roofDonePrompt);
      }
    }

    if (this.state.currentMissionId === 'cozy_cottage' && !this.state.isMissionCompleted) {
      this.notifyStateChange();
      if (this.state.doorsPlaced >= 1 && this.state.windowsPlaced >= 1 && this.state.roofsPlaced >= 1) {
        this.completeMission('cozy_cottage', CATALAN_MISSIONS.mission4.completedPrompt, 'lay_tracks');
        return;
      }
    }

    // 3. Mission 5: Lay Tracks
    if (shape.startsWith('track_')) {
      this.state.tracksPlaced++;
      if (this.state.currentMissionId === 'lay_tracks') {
        if (this.state.tracksPlaced === 1) {
          voiceHandler.speak(CATALAN_MISSIONS.mission5.step1Prompt);
        } else if (this.state.tracksPlaced === 2) {
          voiceHandler.speak(CATALAN_MISSIONS.mission5.step2Prompt);
        }
      }
    }

    if (this.state.currentMissionId === 'lay_tracks' && !this.state.isMissionCompleted) {
      this.notifyStateChange();
      if (this.state.tracksPlaced >= 3) {
        this.completeMission('lay_tracks', CATALAN_MISSIONS.mission5.completedPrompt, 'town_festival');
        return;
      }
    }

    // 4. Mission 6: Town Festival
    if (shape === 'minifigure') {
      this.state.passengersPlaced++;
      if (this.state.currentMissionId === 'town_festival') {
        voiceHandler.speak(CATALAN_MISSIONS.mission6.passengerPrompt);
      }
    } else if (shape === 'fanal') {
      this.state.lampsPlaced++;
      if (this.state.currentMissionId === 'town_festival') {
        voiceHandler.speak(CATALAN_MISSIONS.mission6.lampPrompt);
      }
    }

    if (this.state.currentMissionId === 'town_festival' && !this.state.isMissionCompleted) {
      this.notifyStateChange();
      if (this.state.passengersPlaced >= 2 && this.state.lampsPlaced >= 1) {
        this.completeMission('town_festival', CATALAN_MISSIONS.mission6.completedPrompt, 'free_build');
        return;
      }
    }

    this.notifyStateChange();
  }

  // Backwards compatibility alias
  public handleSceneryPlaced(type: 'flower' | 'tree_pine'): void {
    this.handlePiecePlaced(type);
  }

  private completeMission(missionId: MissionId, praisePrompt: string, nextMissionId?: MissionId): void {
    this.state.isMissionCompleted = true;
    soundSynth.playFanfare();
    this.launchConfetti();

    voiceHandler.speak(praisePrompt, true);
    this.notifyStateChange();

    if (nextMissionId) {
      setTimeout(() => {
        if (this.state.currentMissionId === missionId && this.state.isMissionCompleted) {
          this.startMission(nextMissionId);
        }
      }, 5000);
    }
  }

  private setupVoiceListener(): void {
    voiceHandler.onCommand((command: SpeechCommand) => {
      if (command === 'whistle') {
        this.trainActor.pullWhistle();
        this.handleWhistleTriggered();
      } else if (command === 'forward') {
        this.trainActor.setThrottle(0.75);
        this.trainActor.applyBrake(false);
      } else if (command === 'stop') {
        this.trainActor.setThrottle(0);
        this.trainActor.applyBrake(true);
      } else if (command === 'reverse') {
        this.trainActor.setThrottle(-0.5);
        this.trainActor.applyBrake(false);
      }
    });
  }

  private launchConfetti(): void {
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  }

  public getState(): MissionState {
    return this.state;
  }
}
