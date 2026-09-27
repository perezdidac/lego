import { CATALAN_COLORS } from '../data/catalanAudioCatalog';
import type { BrickShape } from '../engine/BrickFactory';
import { soundSynth } from '../engine/SoundSynth';

export class PaletteUI {
  private container: HTMLElement;
  private onColorSelect: (colorHex: string, colorKey: string) => void;
  private onShapeSelect: (shape: BrickShape) => void;
  private onRotate: () => void;
  private onUndo: () => void;
  private onDeleteToggle: (isDeleteMode: boolean) => void;
  private onSwitchToDrive: () => void;

  private selectedColorKey: string = 'groc';
  private selectedShape: BrickShape = '2x2';
  private isDeleteMode: boolean = false;

  constructor(
    parent: HTMLElement,
    callbacks: {
      onColorSelect: (colorHex: string, colorKey: string) => void;
      onShapeSelect: (shape: BrickShape) => void;
      onRotate: () => void;
      onUndo: () => void;
      onDeleteToggle: (isDeleteMode: boolean) => void;
      onSwitchToDrive: () => void;
    }
  ) {
    this.onColorSelect = callbacks.onColorSelect;
    this.onShapeSelect = callbacks.onShapeSelect;
    this.onRotate = callbacks.onRotate;
    this.onUndo = callbacks.onUndo;
    this.onDeleteToggle = callbacks.onDeleteToggle;
    this.onSwitchToDrive = callbacks.onSwitchToDrive;

    this.container = document.createElement('div');
    this.container.className = 'palette-container';
    parent.appendChild(this.container);

    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="palette-panel">
        <!-- Top row: Shapes & Scenery -->
        <div class="shape-selector" id="shape-selector">
          <button class="shape-btn ${this.selectedShape === '1x1' ? 'active' : ''}" data-shape="1x1" title="Bloc 1x1">
            <span class="shape-icon">🧱 1x1</span>
          </button>
          <button class="shape-btn ${this.selectedShape === '2x2' ? 'active' : ''}" data-shape="2x2" title="Bloc 2x2">
            <span class="shape-icon">🧱 2x2</span>
          </button>
          <button class="shape-btn ${this.selectedShape === '2x4' ? 'active' : ''}" data-shape="2x4" title="Bloc 2x4">
            <span class="shape-icon">🧱 2x4</span>
          </button>
          <button class="shape-btn ${this.selectedShape === '1x6' ? 'active' : ''}" data-shape="1x6" title="Bloc 1x6">
            <span class="shape-icon">🧱 1x6</span>
          </button>
          <button class="shape-btn ${this.selectedShape === 'slope2x2' ? 'active' : ''}" data-shape="slope2x2" title="Rampa">
            <span class="shape-icon">📐 Rampa</span>
          </button>
          <button class="shape-btn ${this.selectedShape === 'tree_pine' ? 'active' : ''}" data-shape="tree_pine" title="Arbre">
            <span class="shape-icon">🌲 Arbre</span>
          </button>
          <button class="shape-btn ${this.selectedShape === 'flower' ? 'active' : ''}" data-shape="flower" title="Flor">
            <span class="shape-icon">🌸 Flor</span>
          </button>
        </div>

        <!-- Middle row: Color palette with Catalan names -->
        <div class="color-palette" id="color-palette">
          ${Object.entries(CATALAN_COLORS).map(([key, info]) => `
            <button class="color-btn ${this.selectedColorKey === key ? 'active' : ''}" 
                    data-color-key="${key}" 
                    data-color-hex="${info.hex}"
                    style="background-color: ${info.hex};"
                    title="${info.name}">
              <span class="color-label">${info.name}</span>
            </button>
          `).join('')}
        </div>

        <!-- Bottom row: Tools & Mode Switching -->
        <div class="action-tools">
          <button class="action-btn tool-rotate" id="btn-rotate" title="Girar bloc">
            <span>🔄 Girar (R)</span>
          </button>
          <button class="action-btn tool-undo" id="btn-undo" title="Desfer última acció">
            <span>↩️ Desfer</span>
          </button>
          <button class="action-btn tool-delete ${this.isDeleteMode ? 'active' : ''}" id="btn-delete" title="Mode Esborrar">
            <span>🗑️ ${this.isDeleteMode ? 'Construir' : 'Esborrar'}</span>
          </button>
          <button class="action-btn tool-conductor" id="btn-switch-conductor" title="Entrar a la cabina del tren!">
            <span>🚂 Mode Conductor</span>
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Shape clicks
    const shapeBtns = this.container.querySelectorAll('.shape-btn');
    shapeBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const shape = target.dataset.shape as BrickShape;
        if (shape) {
          soundSynth.playUIBeep(520);
          this.selectedShape = shape;
          if (this.isDeleteMode) {
            this.isDeleteMode = false;
            this.onDeleteToggle(false);
          }
          this.updateActiveShapeUI();
          this.onShapeSelect(shape);
        }
      });
    });

    // Color clicks
    const colorBtns = this.container.querySelectorAll('.color-btn');
    colorBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const colorKey = target.dataset.colorKey!;
        const colorHex = target.dataset.colorHex!;
        soundSynth.playUIBeep(640);
        this.selectedColorKey = colorKey;
        this.updateActiveColorUI();
        this.onColorSelect(colorHex, colorKey);
      });
    });

    // Rotate
    const rotateBtn = this.container.querySelector('#btn-rotate');
    rotateBtn?.addEventListener('click', () => {
      soundSynth.playUIBeep(700);
      this.onRotate();
    });

    // Undo
    const undoBtn = this.container.querySelector('#btn-undo');
    undoBtn?.addEventListener('click', () => {
      this.onUndo();
    });

    // Delete toggle
    const deleteBtn = this.container.querySelector('#btn-delete');
    deleteBtn?.addEventListener('click', () => {
      this.isDeleteMode = !this.isDeleteMode;
      soundSynth.playUIBeep(this.isDeleteMode ? 380 : 580);
      deleteBtn.classList.toggle('active', this.isDeleteMode);
      deleteBtn.querySelector('span')!.textContent = this.isDeleteMode ? '🔨 Tornar' : '🗑️ Esborrar';
      this.onDeleteToggle(this.isDeleteMode);
    });

    // Switch to conductor mode
    const conductorBtn = this.container.querySelector('#btn-switch-conductor');
    conductorBtn?.addEventListener('click', () => {
      soundSynth.playWhistle(0.6);
      this.onSwitchToDrive();
    });
  }

  private updateActiveShapeUI(): void {
    const shapeBtns = this.container.querySelectorAll('.shape-btn');
    shapeBtns.forEach((btn) => {
      const b = btn as HTMLElement;
      btn.classList.toggle('active', b.dataset.shape === this.selectedShape);
    });
  }

  private updateActiveColorUI(): void {
    const colorBtns = this.container.querySelectorAll('.color-btn');
    colorBtns.forEach((btn) => {
      const b = btn as HTMLElement;
      btn.classList.toggle('active', b.dataset.colorKey === this.selectedColorKey);
    });
  }

  public selectColorByKey(colorKey: string): void {
    const info = CATALAN_COLORS[colorKey];
    if (info) {
      this.selectedColorKey = colorKey;
      this.updateActiveColorUI();
      this.onColorSelect(info.hex, colorKey);
    }
  }

  public setVisible(visible: boolean): void {
    this.container.style.display = visible ? 'block' : 'none';
  }
}
