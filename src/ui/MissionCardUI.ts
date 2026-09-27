import { MissionManager, type MissionId, type MissionState } from '../game/MissionManager';
import { voiceHandler } from '../engine/VoiceHandler';
import { soundSynth } from '../engine/SoundSynth';
import { CATALAN_MISSIONS } from '../data/catalanAudioCatalog';

export class MissionCardUI {
  private container: HTMLElement;
  private missionManager: MissionManager;
  private onMissionSelect: (id: MissionId) => void;

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
    }
  ) {
    this.missionManager = missionManager;
    this.onMissionSelect = callbacks.onMissionSelect;

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
          <!-- Mission Selector Tabs -->
          <div class="mission-pills">
            <button class="m-pill active" data-mission="bridge_repair" title="Missió 1: El Pont">
              <span>🌉 Pont</span>
            </button>
            <button class="m-pill" data-mission="whistle_and_drive" title="Missió 2: Conduir">
              <span>🚂 Tren</span>
            </button>
            <button class="m-pill" data-mission="flower_station" title="Missió 3: L'Estació">
              <span>🌸 Estació</span>
            </button>
            <button class="m-pill" data-mission="free_build" title="Mode Lliure">
              <span>🎨 Lliure</span>
            </button>
          </div>

          <div class="system-buttons">
            <button class="round-btn mic-btn" id="btn-toggle-mic" title="Micròfon: Digues 'Xiulet' o 'Endavant'!">
              <span class="mic-icon">🎙️</span>
              <span class="mic-pulse"></span>
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
            <span class="task-pill ${state.flowersPlaced >= 2 ? 'done' : ''}">
              ${state.flowersPlaced >= 2 ? '✅' : '⚪'} Flors plantades: ${Math.min(2, state.flowersPlaced)}/2
            </span>
            <span class="task-pill ${state.treesPlaced >= 1 ? 'done' : ''}">
              ${state.treesPlaced >= 1 ? '✅' : '⚪'} Arbre plantat: ${Math.min(1, state.treesPlaced)}/1
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
            <span>Construeix el que vulguis, posa vies i trens, o entra a conduir!</span>
          </div>
        </div>
      `;
    }
  }
}
