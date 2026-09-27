import confetti from 'canvas-confetti';
import { CATALAN_MISSIONS, CATALAN_COLORS } from '../data/catalanAudioCatalog';
import { voiceHandler, type SpeechCommand } from '../engine/VoiceHandler';
import { soundSynth } from '../engine/SoundSynth';
import { TrackNetwork } from '../engine/TrackNetwork';
import { TrainActor } from './TrainActor';

export type MissionId = 'bridge_repair' | 'whistle_and_drive' | 'flower_station' | 'free_build';

export interface MissionState {
  currentMissionId: MissionId;
  bridgeBlocksPlaced: number;
  hasWhistled: boolean;
  hasDrivenAcrossBridge: boolean;
  flowersPlaced: number;
  treesPlaced: number;
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
    isMissionCompleted: false
  };

  private onStateChangeCallbacks: ((state: MissionState) => void)[] = [];

  constructor(trackNetwork: TrackNetwork, trainActor: TrainActor) {
    this.trackNetwork = trackNetwork;
    this.trainActor = trainActor;

    this.setupVoiceListener();
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
    } else if (missionId === 'whistle_and_drive') {
      this.state.hasWhistled = false;
      this.state.hasDrivenAcrossBridge = false;
      voiceHandler.speak(CATALAN_MISSIONS.mission2.introPrompt, true);
    } else if (missionId === 'flower_station') {
      this.state.flowersPlaced = 0;
      this.state.treesPlaced = 0;
      voiceHandler.speak(CATALAN_MISSIONS.mission3.introPrompt, true);
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
    if (this.state.currentMissionId !== 'bridge_repair' && !this.trackNetwork.isBridgeComplete()) {
      // Still counts even if in free mode!
    }

    this.state.bridgeBlocksPlaced++;
    this.notifyStateChange();

    if (this.state.bridgeBlocksPlaced === 1) {
      voiceHandler.speak(CATALAN_MISSIONS.mission1.step1Prompt);
    } else if (this.state.bridgeBlocksPlaced === 2) {
      voiceHandler.speak(CATALAN_MISSIONS.mission1.step2Prompt);
    } else if (this.state.bridgeBlocksPlaced >= 3) {
      this.completeBridgeMission();
    }
  }

  private completeBridgeMission(): void {
    this.state.isMissionCompleted = true;
    soundSynth.playFanfare();
    this.launchConfetti();

    voiceHandler.speak(CATALAN_MISSIONS.mission1.completedPrompt, true);
    this.notifyStateChange();

    // Auto prompt to Mission 2 after 4 seconds
    setTimeout(() => {
      if (this.state.currentMissionId === 'bridge_repair') {
        this.startMission('whistle_and_drive');
      }
    }, 4500);
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
      // Check if train is crossing bridge (Z = 15, bridge distance is around u ~ 0.33)
      const totalLen = this.trackNetwork.getTotalLength();
      const bridgeStart = totalLen * 0.28;
      const bridgeEnd = totalLen * 0.42;

      const normDist = trainDistance % totalLen;
      if (normDist >= bridgeStart && normDist <= bridgeEnd && Math.abs(trainSpeed) > 1.5) {
        this.state.hasDrivenAcrossBridge = true;
        this.state.isMissionCompleted = true;
        soundSynth.playFanfare();
        this.launchConfetti();
        voiceHandler.speak(CATALAN_MISSIONS.mission2.completedPrompt, true);
        this.notifyStateChange();
      }
    }
  }

  /**
   * Called when tree or flower is placed
   */
  public handleSceneryPlaced(type: 'flower' | 'tree_pine'): void {
    if (this.state.currentMissionId === 'flower_station') {
      if (type === 'flower') this.state.flowersPlaced++;
      if (type === 'tree_pine') this.state.treesPlaced++;

      this.notifyStateChange();

      if (this.state.flowersPlaced >= 2 && this.state.treesPlaced >= 1 && !this.state.isMissionCompleted) {
        this.state.isMissionCompleted = true;
        soundSynth.playFanfare();
        this.launchConfetti();
        voiceHandler.speak(CATALAN_MISSIONS.mission3.completedPrompt, true);
        this.notifyStateChange();
      }
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
        particleCount: 70,
        spread: 65,
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
      }, 300);
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  }

  public getState(): MissionState {
    return this.state;
  }
}
