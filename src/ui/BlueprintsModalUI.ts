import { BLUEPRINTS, type BlueprintDefinition } from '../data/blueprints';
import { soundSynth } from '../engine/SoundSynth';
import { voiceHandler } from '../engine/VoiceHandler';

export class BlueprintsModalUI {
  private container: HTMLElement;
  private modalOverlay: HTMLElement | null = null;
  private onSelectBlueprint: (blueprint: BlueprintDefinition) => void;
  private onClearWorld: () => void;

  constructor(
    parent: HTMLElement,
    callbacks: {
      onSelectBlueprint: (blueprint: BlueprintDefinition) => void;
      onClearWorld: () => void;
    }
  ) {
    this.onSelectBlueprint = callbacks.onSelectBlueprint;
    this.onClearWorld = callbacks.onClearWorld;

    this.container = document.createElement('div');
    this.container.className = 'blueprints-modal-container';
    parent.appendChild(this.container);

    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="blueprint-modal-overlay hidden" id="blueprint-modal-overlay">
        <div class="blueprint-modal-card">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-icon">📐</span>
              <h2>Tria una Maqueta de Joguina</h2>
            </div>
            <button class="modal-close-btn" id="btn-modal-close" title="Tancar">✖</button>
          </div>

          <p class="modal-subtitle">
            Carrega un poblat màgic, una granja amb animals o un circuit de trens automàtic!
          </p>

          <div class="blueprint-grid">
            ${BLUEPRINTS.map(bp => `
              <div class="blueprint-card" data-bpid="${bp.id}">
                <div class="bp-icon-badge">${bp.icon}</div>
                <div class="bp-info">
                  <h3>${bp.title}</h3>
                  <p>${bp.description}</p>
                </div>
                <button class="bp-load-btn">
                  <span>Construir! ✨</span>
                </button>
              </div>
            `).join('')}

            <!-- Clear Canvas Card -->
            <div class="blueprint-card danger-card" id="card-clear-canvas">
              <div class="bp-icon-badge">🧹</div>
              <div class="bp-info">
                <h3>Neteja el Tauler</h3>
                <p>Retira tots els blocs per començar un món completament nou des de zero.</p>
              </div>
              <button class="bp-load-btn clear-btn">
                <span>Comença de Nou</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.modalOverlay = this.container.querySelector('#blueprint-modal-overlay');
    this.bindEvents();
  }

  private bindEvents(): void {
    if (!this.modalOverlay) return;

    // Close button
    const closeBtn = this.modalOverlay.querySelector('#btn-modal-close');
    closeBtn?.addEventListener('click', () => this.close());

    // Click outside backdrop to close
    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) {
        this.close();
      }
    });

    // Blueprint select cards
    const cards = this.modalOverlay.querySelectorAll('.blueprint-card[data-bpid]');
    cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const bpId = target.dataset.bpid;
        const bp = BLUEPRINTS.find(b => b.id === bpId);
        if (bp) {
          soundSynth.playUIBeep(660);
          this.onSelectBlueprint(bp);
          voiceHandler.speak(`Molt bé! Hem construït: ${bp.title}!`);
          this.close();
        }
      });
    });

    // Clear canvas card
    const clearCard = this.modalOverlay.querySelector('#card-clear-canvas');
    clearCard?.addEventListener('click', () => {
      soundSynth.playBrickRemove();
      this.onClearWorld();
      voiceHandler.speak('Tauler net i buit! Tot a punt per crear noves aventures!');
      this.close();
    });
  }

  public open(): void {
    if (this.modalOverlay) {
      this.modalOverlay.classList.remove('hidden');
      soundSynth.playUIBeep(520);
      voiceHandler.speak('Tria una maqueta per construir!');
    }
  }

  public close(): void {
    if (this.modalOverlay) {
      this.modalOverlay.classList.add('hidden');
    }
  }
}
