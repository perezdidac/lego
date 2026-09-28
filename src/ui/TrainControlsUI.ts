import * as THREE from 'three';
import { TrainActor } from '../game/TrainActor';
import { TrackNetwork } from '../engine/TrackNetwork';
import type { CameraViewMode } from '../engine/SceneController';
import { soundSynth } from '../engine/SoundSynth';
import { voiceHandler } from '../engine/VoiceHandler';

export class TrainControlsUI {
  private container: HTMLElement;
  private trainActor: TrainActor;
  private trackNetwork: TrackNetwork;
  private onWhistle: () => void;
  private onCameraChange: (mode: CameraViewMode) => void;
  private onSwitchToBuild: () => void;

  private throttleSlider: HTMLInputElement | null = null;
  private speedGaugeValue: HTMLElement | null = null;
  private speedNeedle: HTMLElement | null = null;
  private whistleCord: HTMLElement | null = null;
  private directionToggleBtn: HTMLElement | null = null;
  private routeCustomText: HTMLElement | null = null;

  private isReverse: boolean = false;
  private currentCameraMode: CameraViewMode = 'chase';
  private currentRoute: 'circuit' | 'custom' = 'circuit';

  constructor(
    parent: HTMLElement,
    trainActor: TrainActor,
    trackNetwork: TrackNetwork,
    callbacks: {
      onWhistle: () => void;
      onCameraChange: (mode: CameraViewMode) => void;
      onSwitchToBuild: () => void;
    }
  ) {
    this.trainActor = trainActor;
    this.trackNetwork = trackNetwork;
    this.onWhistle = callbacks.onWhistle;
    this.onCameraChange = callbacks.onCameraChange;
    this.onSwitchToBuild = callbacks.onSwitchToBuild;

    this.container = document.createElement('div');
    this.container.className = 'train-controls-container';
    this.container.style.display = 'none';
    parent.appendChild(this.container);

    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="train-hud">
        <!-- Top bar: Camera view & Route Selector & Exit button -->
        <div class="train-hud-top">
          <!-- Camera View Mode Pills -->
          <div class="camera-mode-pills">
            <button class="hud-pill ${this.currentCameraMode === 'chase' ? 'active' : ''}" data-cam="chase" title="Càmera de Persecució">
              <span>🎥 Persecució</span>
            </button>
            <button class="hud-pill ${this.currentCameraMode === 'cab' ? 'active' : ''}" data-cam="cab" title="Càmera de la Cabina">
              <span>👨‍✈️ Cabina</span>
            </button>
            <button class="hud-pill ${this.currentCameraMode === 'orbit' ? 'active' : ''}" data-cam="orbit" title="Càmera Lliure">
              <span>🌐 Lliure</span>
            </button>
          </div>

          <!-- Route Selector: Circuit Principal vs Vies Noves Lego City -->
          <div class="route-mode-pills">
            <button class="hud-pill route-pill ${this.currentRoute === 'circuit' ? 'active' : ''}" id="btn-route-circuit" title="Circuit Principal del Bosc">
              <span>🛤️ Circuit Gran</span>
            </button>
            <button class="hud-pill route-pill ${this.currentRoute === 'custom' ? 'active' : ''}" id="btn-route-custom" title="Vies Construïdes Lego City">
              <span id="route-custom-text">⚡ Vies Noves</span>
            </button>
          </div>

          <button class="hud-pill bell-pill" id="btn-station-bell" title="Campana d'Estació">
            <span>🔔 Campana</span>
          </button>

          <button class="hud-pill hud-exit-btn" id="btn-back-to-build" title="Tornar a construir">
            <span>🧱 Mode Construcció</span>
          </button>
        </div>

        <!-- Center Whistle Pull Cord hanging from top -->
        <div class="whistle-chain-wrapper">
          <div class="whistle-cord" id="whistle-cord" title="Estira per fer sonar el xiulet!">
            <div class="cord-string"></div>
            <div class="cord-handle">
              <span class="whistle-icon">🎺</span>
              <span class="whistle-text">XIULET!</span>
            </div>
          </div>
        </div>

        <!-- Bottom Train Control Deck -->
        <div class="train-deck">
          <!-- Speedometer Dial -->
          <div class="speedometer-widget">
            <div class="speed-dial">
              <div class="speed-ticks">
                <span>0</span><span>20</span><span>40</span>
              </div>
              <div class="speed-needle" id="speed-needle"></div>
              <div class="speed-center-dot"></div>
            </div>
            <div class="speed-label">
              <span class="speed-val" id="speed-value">0</span> <small>km/h</small>
            </div>
          </div>

          <!-- Throttle Slider Control -->
          <div class="throttle-widget">
            <div class="throttle-header">
              <span class="throttle-title">⚡ PALANCA DE VELOCITAT</span>
              <button class="dir-toggle-btn" id="btn-dir-toggle">
                <span id="dir-label">⬆️ ENDAVANT</span>
              </button>
            </div>
            <div class="slider-wrapper">
              <span class="slider-min">0</span>
              <input type="range" id="throttle-range" class="throttle-range" min="0" max="100" value="0" />
              <span class="slider-max">MAX</span>
            </div>
          </div>

          <!-- Big Emergency Brake Button -->
          <div class="brake-widget">
            <button class="big-brake-btn" id="btn-emergency-brake">
              <span class="brake-icon">🛑</span>
              <span class="brake-text">FRE DE MÀ</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Whistle Pull Cord
    this.whistleCord = this.container.querySelector('#whistle-cord');
    if (this.whistleCord) {
      const triggerWhistle = () => {
        this.whistleCord?.classList.add('pulled');
        setTimeout(() => {
          this.whistleCord?.classList.remove('pulled');
        }, 400);
        this.trainActor.pullWhistle();
        this.onWhistle();
      };

      this.whistleCord.addEventListener('click', triggerWhistle);
      this.whistleCord.addEventListener('touchstart', (e) => {
        e.preventDefault();
        triggerWhistle();
      });
    }

    // Throttle range input
    this.throttleSlider = this.container.querySelector('#throttle-range') as HTMLInputElement;
    this.throttleSlider?.addEventListener('input', (e) => {
      const val = parseInt((e.target as HTMLInputElement).value, 10);
      const ratio = val / 100;
      const signedThrottle = this.isReverse ? -ratio : ratio;
      this.trainActor.setThrottle(signedThrottle);
      this.trainActor.applyBrake(false);
    });

    // Direction Toggle
    this.directionToggleBtn = this.container.querySelector('#btn-dir-toggle');
    this.directionToggleBtn?.addEventListener('click', () => {
      this.isReverse = !this.isReverse;
      soundSynth.playUIBeep(550);
      const dirLabel = this.container.querySelector('#dir-label')!;
      if (this.isReverse) {
        dirLabel.textContent = '⬇️ ENRERE';
        this.directionToggleBtn?.classList.add('reverse');
      } else {
        dirLabel.textContent = '⬆️ ENDAVANT';
        this.directionToggleBtn?.classList.remove('reverse');
      }

      // Re-apply current slider to new direction
      if (this.throttleSlider) {
        const val = parseInt(this.throttleSlider.value, 10) / 100;
        this.trainActor.setThrottle(this.isReverse ? -val : val);
      }
    });

    // Emergency Brake
    const brakeBtn = this.container.querySelector('#btn-emergency-brake');
    brakeBtn?.addEventListener('click', () => {
      if (this.throttleSlider) {
        this.throttleSlider.value = '0';
      }
      this.trainActor.setThrottle(0);
      this.trainActor.applyBrake(true);
      setTimeout(() => {
        this.trainActor.applyBrake(false);
      }, 1200);
    });

    // Camera Mode buttons
    const camBtns = this.container.querySelectorAll('.camera-mode-pills .hud-pill');
    camBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const cam = target.dataset.cam as CameraViewMode;
        if (cam) {
          soundSynth.playUIBeep(600);
          this.currentCameraMode = cam;
          camBtns.forEach(b => b.classList.remove('active'));
          target.classList.add('active');
          this.onCameraChange(cam);
        }
      });
    });

    // Route Switching: Circuit Principal
    const circuitBtn = this.container.querySelector('#btn-route-circuit');
    circuitBtn?.addEventListener('click', () => {
      soundSynth.playUIBeep(600);
      this.currentRoute = 'circuit';
      this.trackNetwork.setRoute('circuit');
      this.trainActor.snapToClosestTrackPoint(new THREE.Vector3(-12, 0.4, 0));
      voiceHandler.speak('De tornada al circuit principal!');
      this.updateRouteUI();
    });

    // Route Switching: Custom Lego City Tracks
    const customBtn = this.container.querySelector('#btn-route-custom');
    customBtn?.addEventListener('click', () => {
      const customTracks = this.trackNetwork.getCustomTracks();
      if (customTracks.length < 1) {
        soundSynth.playUIBeep(350);
        voiceHandler.speak('Posa vies al mode construcció per crear el teu circuit!');
        return;
      }

      const success = this.trackNetwork.setRoute('custom');
      if (success) {
        soundSynth.playUIBeep(680);
        this.currentRoute = 'custom';
        this.trainActor.snapToClosestTrackPoint(customTracks[0].position);
        voiceHandler.speak('Tren a les teves vies! Endavant maquinista!');
        this.updateRouteUI();
      }
    });

    // Back to Build
    const backBtn = this.container.querySelector('#btn-back-to-build');
    backBtn?.addEventListener('click', () => {
      soundSynth.playUIBeep(450);
      this.trainActor.setThrottle(0);
      this.onSwitchToBuild();
    });

    // Station Bell
    const bellBtn = this.container.querySelector('#btn-station-bell');
    bellBtn?.addEventListener('click', () => {
      soundSynth.playStationBell();
      voiceHandler.speak("Ding-dong! Campana d'estació!");
      bellBtn.classList.add('active');
      setTimeout(() => bellBtn.classList.remove('active'), 600);
    });

    this.speedGaugeValue = this.container.querySelector('#speed-value');
    this.speedNeedle = this.container.querySelector('#speed-needle');
    this.routeCustomText = this.container.querySelector('#route-custom-text');
  }

  private updateRouteUI(): void {
    const circuitBtn = this.container.querySelector('#btn-route-circuit');
    const customBtn = this.container.querySelector('#btn-route-custom');

    circuitBtn?.classList.toggle('active', this.currentRoute === 'circuit');
    customBtn?.classList.toggle('active', this.currentRoute === 'custom');
  }

  public update(): void {
    const rawSpeed = Math.abs(this.trainActor.speed);
    // Convert toy scale m/s to display km/h (0 to 45 km/h)
    const kmh = Math.round((rawSpeed / this.trainActor.maxSpeed) * 45);

    if (this.speedGaugeValue) {
      this.speedGaugeValue.textContent = kmh.toString();
    }

    if (this.speedNeedle) {
      // Angle: -90 deg (0) to +90 deg (45 kmh)
      const angle = -90 + (kmh / 45) * 180;
      this.speedNeedle.style.transform = `rotate(${angle}deg)`;
    }

    // Update custom tracks count badge
    if (this.routeCustomText) {
      const count = this.trackNetwork.getCustomTracks().length;
      this.routeCustomText.textContent = count > 0 ? `✨ Les Meves Vies (${count})` : '✨ Les Meves Vies';
    }
  }

  public setVisible(visible: boolean): void {
    this.container.style.display = visible ? 'block' : 'none';
    if (visible) {
      const customTracks = this.trackNetwork.getCustomTracks();
      if (customTracks.length > 0) {
        this.currentRoute = 'custom';
        this.trackNetwork.setRoute('custom');
        this.trainActor.snapToClosestTrackPoint(customTracks[0].position);
        this.updateRouteUI();
      }
    }
  }

  public resetThrottle(): void {
    if (this.throttleSlider) {
      this.throttleSlider.value = '0';
    }
    this.trainActor.setThrottle(0);
  }
}
