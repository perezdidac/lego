import { CATALAN_COLORS } from '../data/catalanAudioCatalog';
import { BRICK_DEFS, type BrickShape } from '../engine/BrickFactory';
import { soundSynth } from '../engine/SoundSynth';
import { voiceHandler } from '../engine/VoiceHandler';

export type BrickCategory = 'bloc' | 'casa' | 'vies' | 'natura';

export const CATEGORIES: { id: BrickCategory; label: string; icon: string }[] = [
  { id: 'bloc', label: 'Blocs', icon: '🧱' },
  { id: 'casa', label: 'Casa', icon: '🏠' },
  { id: 'vies', label: 'Vies Lego City', icon: '🛤️' },
  { id: 'natura', label: 'Natura', icon: '🌳' }
];

export class PaletteUI {
  private container: HTMLElement;
  private onColorSelect: (colorHex: string, colorKey: string) => void;
  private onShapeSelect: (shape: BrickShape) => void;
  private onRotate: () => void;
  private onUndo: () => void;
  private onDeleteToggle: (isDeleteMode: boolean) => void;
  private onSwitchToDrive: () => void;

  private currentCategory: BrickCategory = 'bloc';
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
        <!-- Top: Category Tabs -->
        <div class="category-tabs" id="category-tabs">
          ${CATEGORIES.map(cat => `
            <button class="cat-tab ${this.currentCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
              <span class="cat-icon">${cat.icon}</span>
              <span class="cat-label">${cat.label}</span>
            </button>
          `).join('')}
        </div>

        <!-- Shapes Selector for Current Category -->
        <div class="shape-selector" id="shape-selector"></div>

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
          <button class="action-btn tool-rotate" id="btn-rotate" title="Girar bloc (R)">
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

    this.renderShapes();
    this.bindEvents();
  }

  private renderShapes(): void {
    const shapeSelector = this.container.querySelector('#shape-selector');
    if (!shapeSelector) return;

    // Filter shapes by current category
    const entries = Object.entries(BRICK_DEFS).filter(
      ([, def]) => def.category === this.currentCategory
    ) as [BrickShape, (typeof BRICK_DEFS)[BrickShape]][];

    shapeSelector.innerHTML = entries.map(([shape, def]) => `
      <button class="shape-btn ${this.selectedShape === shape ? 'active' : ''}" 
              data-shape="${shape}" 
              title="${def.nameCatalan}">
        <span class="shape-icon">${def.icon}</span>
      </button>
    `).join('');

    // Bind shape clicks
    const shapeBtns = shapeSelector.querySelectorAll('.shape-btn');
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

          // Voice announcement in Catalan
          const def = BRICK_DEFS[shape];
          if (def) {
            voiceHandler.speak(def.nameCatalan);
          }
        }
      });
    });
  }

  private bindEvents(): void {
    // Category tabs
    const catTabs = this.container.querySelectorAll('.cat-tab');
    catTabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const cat = target.dataset.cat as BrickCategory;
        if (cat && cat !== this.currentCategory) {
          this.currentCategory = cat;
          soundSynth.playUIBeep(480);

          catTabs.forEach(t => t.classList.remove('active'));
          target.classList.add('active');

          this.renderShapes();

          // Auto-select first shape in category if current shape is not in category
          const shapesInCat = (Object.keys(BRICK_DEFS) as BrickShape[]).filter(
            k => BRICK_DEFS[k].category === cat
          );

          if (!shapesInCat.includes(this.selectedShape) && shapesInCat.length > 0) {
            this.selectedShape = shapesInCat[0];
            this.updateActiveShapeUI();
            this.onShapeSelect(this.selectedShape);
          }
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

  public setCategory(cat: BrickCategory): void {
    if (this.currentCategory !== cat) {
      this.currentCategory = cat;
      const catTabs = this.container.querySelectorAll('.cat-tab');
      catTabs.forEach((t) => {
        const el = t as HTMLElement;
        el.classList.toggle('active', el.dataset.cat === cat);
      });
      this.renderShapes();
    }
  }

  public selectShape(shape: BrickShape): void {
    const def = BRICK_DEFS[shape];
    if (def) {
      this.setCategory(def.category);
      this.selectedShape = shape;
      this.updateActiveShapeUI();
      this.onShapeSelect(shape);
      voiceHandler.speak(def.nameCatalan);
    }
  }
}
