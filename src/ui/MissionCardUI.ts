import { MissionManager, type MissionId, type MissionState } from '../game/MissionManager';
import { voiceHandler } from '../engine/VoiceHandler';
import { soundSynth } from '../engine/SoundSynth';
import { CATALAN_MISSIONS } from '../data/catalanAudioCatalog';
import type { BrickShape } from '../engine/BrickFactory';

export class MissionCardUI {
  private container: HTMLElement;
  private missionManager: MissionManager;
  private onMissionSelect: (id: MissionId) => void;
  private onToolSuggest?: (shape: BrickShape) => void;
  private onTimeOfDayToggle?: () => 'day' | 'sunset' | 'night';
  private onBlueprintsToggle?: () => void;
  private onWordBookToggle?: () => void;

  private narratorBubbleText: HTMLElement | null = null;
  private narratorAvatar: HTMLElement | null = null;
  private micButton: HTMLElement | null = null;
  private soundButton: HTMLElement | null = null;
  private missionContent: HTMLElement | null = null;

  constructor(
    parent: HTMLElement,
    missionManager: MissionManager,
    callbacks: {
      onMissionSelect: (id: MissionId) => void;
      onToolSuggest?: (shape: BrickShape) => void;
      onTimeOfDayToggle?: () => 'day' | 'sunset' | 'night';
      onBlueprintsToggle?: () => void;
      onWordBookToggle?: () => void;
    }
  ) {
    this.missionManager = missionManager;
    this.onMissionSelect = callbacks.onMissionSelect;
    this.onToolSuggest = callbacks.onToolSuggest;
    this.onTimeOfDayToggle = callbacks.onTimeOfDayToggle;
    this.onBlueprintsToggle = callbacks.onBlueprintsToggle;
    this.onWordBookToggle = callbacks.onWordBookToggle;

    this.container = document.createElement('div');
    this.container.className = 'mission-header-container';
    parent.appendChild(this.container);

    this.render();
    this.bindEvents();
    this.listenToVoiceState();
    this.listenToMissionState();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="mission-header-bar">
        <!-- Antoni Avatar & Speech Bubble -->
        <div class="narrator-card" id="narrator-card">
          <div class="antoni-avatar" id="antoni-avatar" title="L'Antoni el Maquinista">
            <div class="avatar-cap"></div>
            <div class="avatar-face">
              <div class="avatar-eye left"></div>
              <div class="avatar-eye right"></div>
              <div class="avatar-mouth" id="avatar-mouth"></div>
            </div>
          </div>
          <div class="speech-bubble">
            <span class="narrator-name">L'Antoni diu:</span>
            <div class="speech-text" id="speech-text">
              Benvingut a BlockStory Català! Tria una missió o comença a construir!
            </div>
          </div>
        </div>

        <!-- Center Mission Info & Steps -->
        <div class="mission-details-card" id="mission-details">
          <!-- Dynamically populated -->
        </div>

        <!-- Right Controls: Missions menu, Mic & Sound -->
        <div class="header-action-group">
          <!-- Mission Selector Tabs (6 guided levels + Free Build) -->
          <div class="mission-pills">
            <button class="m-pill active" data-mission="bridge_repair" title="Missió 1: El Pont">
              <span>🌉 1. Pont</span>
            </button>
            <button class="m-pill" data-mission="whistle_and_drive" title="Missió 2: Conduir">
              <span>🚂 2. Tren</span>
            </button>
            <button class="m-pill" data-mission="flower_station" title="Missió 3: Flors">
              <span>🌸 3. Flors</span>
            </button>
            <button class="m-pill" data-mission="cozy_cottage" title="Missió 4: La Caseta">
              <span>🏠 4. Casa</span>
            </button>
            <button class="m-pill" data-mission="lay_tracks" title="Missió 5: Vies Lego">
              <span>🛤️ 5. Vies</span>
            </button>
            <button class="m-pill" data-mission="town_festival" title="Missió 6: Viatgers">
              <span>🧑 6. Gent</span>
            </button>
            <button class="m-pill" data-mission="farm_animals" title="Missió 7: Granja">
              <span>🐄 7. Granja</span>
            </button>
            <button class="m-pill" data-mission="free_build" title="Mode Lliure">
              <span>🎨 Lliure</span>
            </button>
          </div>

          <div class="system-buttons">
            <button class="round-btn time-btn" id="btn-toggle-time" title="Canvia l'hora del dia: Dia / Posta / Nit">
              <span id="time-icon">☀️</span>
            </button>
            <button class="round-btn blueprint-btn" id="btn-blueprints" title="Carrega Maquetes i Poblats">
              <span>📐</span>
            </button>
            <button class="round-btn mic-btn" id="btn-toggle-mic" title="Micròfon: Digues 'Xiulet' o 'Endavant'!">
              <span class="mic-icon">🎙️</span>
              <span class="mic-pulse"></span>
            </button>
            <button class="round-btn words-btn" id="btn-words-book" title="⭐ L'Àlbum de les Paraules Catalanes">
              <span>⭐</span>
            </button>
            <button class="round-btn sound-btn" id="btn-toggle-sound" title="Activa / Silencia el so">
              <span class="sound-icon">🔊</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.narratorBubbleText = this.container.querySelector('#speech-text');
    this.narratorAvatar = this.container.querySelector('#antoni-avatar');
    this.micButton = this.container.querySelector('#btn-toggle-mic');
    this.soundButton = this.container.querySelector('#btn-toggle-sound');
    this.missionContent = this.container.querySelector('#mission-details');
  }

  private bindEvents(): void {
    // Time of day toggle
    const timeBtn = this.container.querySelector('#btn-toggle-time');
    const timeIcon = this.container.querySelector('#time-icon');
    timeBtn?.addEventListener('click', () => {
      if (this.onTimeOfDayToggle) {
        soundSynth.playUIBeep(580);
        const newTime = this.onTimeOfDayToggle();
        if (timeIcon) {
          timeIcon.textContent = newTime === 'day' ? '☀️' :
                                newTime === 'sunset' ? '🌅' : '🌙';
        }
      }
    });

    // Blueprints modal
    const bpBtn = this.container.querySelector('#btn-blueprints');
    bpBtn?.addEventListener('click', () => {
      soundSynth.playUIBeep(640);
      if (this.onBlueprintsToggle) {
        this.onBlueprintsToggle();
      }
    });

    // Word Book modal
    const wordsBtn = this.container.querySelector('#btn-words-book');
    wordsBtn?.addEventListener('click', () => {
      soundSynth.playUIBeep(720);
      if (this.onWordBookToggle) {
        this.onWordBookToggle();
      }
    });

    // Mission Pills
    const pills = this.container.querySelectorAll('.mission-pills .m-pill');
    pills.forEach((pill) => {
      pill.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const missionId = target.dataset.mission as MissionId;
        if (missionId) {
          soundSynth.playUIBeep(650);
          pills.forEach(p => p.classList.remove('active'));
          target.classList.add('active');
          this.onMissionSelect(missionId);
        }
      });
    });

    // Mic Toggle
    this.micButton?.addEventListener('click', () => {
      const isListening = voiceHandler.toggleListening();
      soundSynth.playUIBeep(isListening ? 750 : 350);
      this.updateMicUI(isListening);
    });

    // Sound Mute Toggle
    this.soundButton?.addEventListener('click', () => {
      const isMuted = !soundSynth.getMuted();
      soundSynth.setMuted(isMuted);
      const icon = this.soundButton?.querySelector('.sound-icon');
      if (icon) {
        icon.textContent = isMuted ? '🔇' : '🔊';
      }
    });

    // Clicking Antoni speaks the current mission intro again
    this.narratorAvatar?.addEventListener('click', () => {
      soundSynth.playUIBeep(800);
      this.missionManager.startMission(this.missionManager.getState().currentMissionId);
    });
  }

  private listenToVoiceState(): void {
    voiceHandler.onSpeakState((isSpeaking, text) => {
      if (this.narratorAvatar) {
        this.narratorAvatar.classList.toggle('speaking', isSpeaking);
      }
      if (this.narratorBubbleText && text) {
        this.narratorBubbleText.textContent = text;
        this.narratorBubbleText.parentElement?.classList.add('pop-animation');
        setTimeout(() => {
          this.narratorBubbleText?.parentElement?.classList.remove('pop-animation');
        }, 300);
      }
    });

    voiceHandler.onListenState((isListening, lastHeard) => {
      this.updateMicUI(isListening);
      if (lastHeard && this.narratorBubbleText && !voiceHandler.getIsSpeaking()) {
        this.narratorBubbleText.textContent = lastHeard;
      }
    });
  }

  private updateMicUI(isListening: boolean): void {
    if (this.micButton) {
      this.micButton.classList.toggle('active', isListening);
    }
  }

  private listenToMissionState(): void {
    this.missionManager.onStateChange((state: MissionState) => {
      this.updateMissionUI(state);
    });
  }

  private updateMissionUI(state: MissionState): void {
    if (!this.missionContent) return;

    // Update active pill
    const pills = this.container.querySelectorAll('.mission-pills .m-pill');
    pills.forEach((p) => {
      const b = p as HTMLElement;
      b.classList.toggle('active', b.dataset.mission === state.currentMissionId);
    });

    if (state.currentMissionId === 'bridge_repair') {
      const count = Math.min(3, state.bridgeBlocksPlaced);
      this.missionContent.innerHTML = `
        <div class="mission-info">
          <div class="mission-title-row">
            <span class="m-badge">🌉</span>
            <span class="m-title">${CATALAN_MISSIONS.mission1.title}</span>
            ${state.isMissionCompleted ? '<span class="m-done-badge">COMPLETADA! ⭐</span>' : ''}
          </div>
          <div class="bridge-progress-dots">
            <span class="dot-label">Blocs grocs al pont:</span>
            <span class="slot-dot ${count >= 1 ? 'filled' : ''}">🟡</span>
            <span class="slot-dot ${count >= 2 ? 'filled' : ''}">🟡</span>
            <span class="slot-dot ${count >= 3 ? 'filled' : ''}">🟡</span>
            <span class="slot-count">(${count}/3)</span>
          </div>
        </div>
      `;
    } else if (state.currentMissionId === 'whistle_and_drive') {
      this.missionContent.innerHTML = `
        <div class="mission-info">
          <div class="mission-title-row">
            <span class="m-badge">🚂</span>
            <span class="m-title">${CATALAN_MISSIONS.mission2.title}</span>
            ${state.isMissionCompleted ? '<span class="m-done-badge">COMPLETADA! ⭐</span>' : ''}
          </div>
          <div class="task-checklist">
            <span class="task-pill ${state.hasWhistled ? 'done' : ''}">
              ${state.hasWhistled ? '✅' : '⚪'} 1. Fes sonar el xiulet ("Xiulet!")
            </span>
            <span class="task-pill ${state.hasDrivenAcrossBridge ? 'done' : ''}">
              ${state.hasDrivenAcrossBridge ? '✅' : '⚪'} 2. Condueix pel pont ("Endavant!")
            </span>
          </div>
        </div>
      `;
    } else if (state.currentMissionId === 'flower_station') {
      this.missionContent.innerHTML = `
        <div class="mission-info">
          <div class="mission-title-row">
            <span class="m-badge">🌸</span>
            <span class="m-title">${CATALAN_MISSIONS.mission3.title}</span>
            ${state.isMissionCompleted ? '<span class="m-done-badge">COMPLETADA! ⭐</span>' : ''}
          </div>
          <div class="task-checklist">
            <span class="task-pill interactive-task ${state.flowersPlaced >= 2 ? 'done' : ''}" data-tool="flower">
              ${state.flowersPlaced >= 2 ? '✅' : '🌸'} Flors: ${Math.min(2, state.flowersPlaced)}/2
            </span>
            <span class="task-pill interactive-task ${state.treesPlaced >= 1 ? 'done' : ''}" data-tool="tree_pine">
              ${state.treesPlaced >= 1 ? '✅' : '🌲'} Arbre: ${Math.min(1, state.treesPlaced)}/1
            </span>
          </div>
        </div>
      `;
    } else if (state.currentMissionId === 'cozy_cottage') {
      const doorDone = state.doorsPlaced >= 1;
      const winDone = state.windowsPlaced >= 1;
      const roofDone = state.roofsPlaced >= 1;
      this.missionContent.innerHTML = `
        <div class="mission-info">
          <div class="mission-title-row">
            <span class="m-badge">🏠</span>
            <span class="m-title">${CATALAN_MISSIONS.mission4.title}</span>
            ${state.isMissionCompleted ? '<span class="m-done-badge">COMPLETADA! ⭐</span>' : ''}
          </div>
          <div class="task-checklist">
            <span class="task-pill interactive-task ${doorDone ? 'done' : ''}" data-tool="porta">
              ${doorDone ? '✅' : '🚪'} Porta: ${doorDone ? 1 : 0}/1
            </span>
            <span class="task-pill interactive-task ${winDone ? 'done' : ''}" data-tool="finestra">
              ${winDone ? '✅' : '🪟'} Finestra: ${winDone ? 1 : 0}/1
            </span>
            <span class="task-pill interactive-task ${roofDone ? 'done' : ''}" data-tool="slope2x2">
              ${roofDone ? '✅' : '📐'} Teulada: ${roofDone ? 1 : 0}/1
            </span>
          </div>
        </div>
      `;
    } else if (state.currentMissionId === 'lay_tracks') {
      const count = Math.min(3, state.tracksPlaced);
      this.missionContent.innerHTML = `
        <div class="mission-info">
          <div class="mission-title-row">
            <span class="m-badge">🛤️</span>
            <span class="m-title">${CATALAN_MISSIONS.mission5.title}</span>
            ${state.isMissionCompleted ? '<span class="m-done-badge">COMPLETADA! ⭐</span>' : ''}
          </div>
          <div class="task-checklist">
            <span class="task-pill interactive-task ${count >= 3 ? 'done' : ''}" data-tool="track_straight">
              ${count >= 3 ? '✅' : '🛤️'} Vies Lego City: ${count}/3
            </span>
          </div>
        </div>
      `;
    } else if (state.currentMissionId === 'town_festival') {
      const passDone = state.passengersPlaced >= 2;
      const lampDone = state.lampsPlaced >= 1;
      this.missionContent.innerHTML = `
        <div class="mission-info">
          <div class="mission-title-row">
            <span class="m-badge">🧑</span>
            <span class="m-title">${CATALAN_MISSIONS.mission6.title}</span>
            ${state.isMissionCompleted ? '<span class="m-done-badge">COMPLETADA! ⭐</span>' : ''}
          </div>
          <div class="task-checklist">
            <span class="task-pill interactive-task ${passDone ? 'done' : ''}" data-tool="minifigure">
              ${passDone ? '✅' : '🧑'} Passatgers: ${Math.min(2, state.passengersPlaced)}/2
            </span>
            <span class="task-pill interactive-task ${lampDone ? 'done' : ''}" data-tool="fanal">
              ${lampDone ? '✅' : '💡'} Fanal: ${lampDone ? 1 : 0}/1
            </span>
          </div>
        </div>
      `;
    } else if (state.currentMissionId === 'farm_animals') {
      const cowDone = state.cowsPlaced >= 1;
      const sheepDone = state.sheepsPlaced >= 1;
      const duckDone = state.ducksPlaced >= 1;
      this.missionContent.innerHTML = `
        <div class="mission-info">
          <div class="mission-title-row">
            <span class="m-badge">🐄</span>
            <span class="m-title">${CATALAN_MISSIONS.mission7.title}</span>
            ${state.isMissionCompleted ? '<span class="m-done-badge">COMPLETADA! ⭐</span>' : ''}
          </div>
          <div class="task-checklist">
            <span class="task-pill interactive-task ${cowDone ? 'done' : ''}" data-tool="vaca">
              ${cowDone ? '✅' : '🐄'} Vaca: ${cowDone ? 1 : 0}/1
            </span>
            <span class="task-pill interactive-task ${sheepDone ? 'done' : ''}" data-tool="ovella">
              ${sheepDone ? '✅' : '🐑'} Ovella: ${sheepDone ? 1 : 0}/1
            </span>
            <span class="task-pill interactive-task ${duckDone ? 'done' : ''}" data-tool="anec">
              ${duckDone ? '✅' : '🦆'} Ànec: ${duckDone ? 1 : 0}/1
            </span>
          </div>
        </div>
      `;
    } else {
      this.missionContent.innerHTML = `
        <div class="mission-info">
          <div class="mission-title-row">
            <span class="m-badge">🎨</span>
            <span class="m-title">Mode Construcció Lliure</span>
          </div>
          <div class="free-mode-hint">
            <span>Construeix lliurement amb 25 peces de joguina, posa vies i condueix el tren!</span>
          </div>
        </div>
      `;
    }

    // Bind interactive task clicks (e.g. clicking a task selects that tool!)
    const taskPills = this.missionContent.querySelectorAll('.interactive-task');
    taskPills.forEach((tp) => {
      tp.addEventListener('click', (e) => {
        const el = e.currentTarget as HTMLElement;
        const tool = el.dataset.tool as BrickShape;
        if (tool && this.onToolSuggest) {
          soundSynth.playUIBeep(580);
          this.onToolSuggest(tool);
        }
      });
    });
  }
}
