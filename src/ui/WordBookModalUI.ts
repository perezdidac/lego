import { CATALAN_DICTIONARY, type CatalanWordCard } from '../data/catalanAudioCatalog';
import { voiceHandler } from '../engine/VoiceHandler';
import { soundSynth } from '../engine/SoundSynth';

export class WordBookModalUI {
  private container: HTMLElement;
  private modalOverlay: HTMLElement | null = null;
  private unlockedWords: Set<string> = new Set();
  private onWordPlay?: (card: CatalanWordCard) => void;

  constructor(parent: HTMLElement, onWordPlay?: (card: CatalanWordCard) => void) {
    this.onWordPlay = onWordPlay;
    this.loadUnlockedFromStorage();

    this.container = document.createElement('div');
    this.container.className = 'wordbook-modal-container';
    parent.appendChild(this.container);

    this.render();
  }

  private loadUnlockedFromStorage(): void {
    // Unlock core starter words by default
    const starters = ['tren', 'via', 'pont', 'estacio'];
    try {
      const saved = localStorage.getItem('blockstory_catala_unlocked_words');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) {
          arr.forEach((id: string) => this.unlockedWords.add(id));
        }
      }
    } catch {
      // ignore
    }
    starters.forEach(s => this.unlockedWords.add(s));
  }

  private saveUnlockedToStorage(): void {
    try {
      localStorage.setItem('blockstory_catala_unlocked_words', JSON.stringify(Array.from(this.unlockedWords)));
    } catch {
      // ignore
    }
  }

  public unlockWord(idOrShape: string): boolean {
    const card = CATALAN_DICTIONARY.find(c => c.id === idOrShape || c.shapeMatch.includes(idOrShape));
    if (!card) return false;

    if (!this.unlockedWords.has(card.id)) {
      this.unlockedWords.add(card.id);
      this.saveUnlockedToStorage();
      soundSynth.playMagicRainbow();
      this.updateProgressBadge();
      return true; // Newly unlocked!
    }
    return false;
  }

  public getUnlockedCount(): { unlocked: number; total: number } {
    return {
      unlocked: this.unlockedWords.size,
      total: CATALAN_DICTIONARY.length
    };
  }

  public open(): void {
    if (!this.modalOverlay) return;
    this.renderCards();
    this.modalOverlay.classList.remove('hidden');
    soundSynth.playUIBeep(650);
    voiceHandler.speak("Benvingut a l'Àlbum de les Paraules! Toca una targeta per escoltar com es diu en català!");
  }

  public close(): void {
    if (!this.modalOverlay) return;
    this.modalOverlay.classList.add('hidden');
    soundSynth.playUIBeep(420);
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="wordbook-modal-overlay hidden" id="wordbook-modal-overlay">
        <div class="wordbook-modal-card">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-icon">⭐</span>
              <h2>L'Àlbum de les Paraules Catalanes</h2>
            </div>
            <button class="modal-close-btn" id="btn-wordbook-close" title="Tancar">✖</button>
          </div>

          <div class="wordbook-progress-bar-wrapper">
            <div class="wordbook-progress-info">
              <span id="wordbook-progress-text">Descobertes: 4 / 16 Paraules</span>
              <span class="star-badge">⭐⭐⭐</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" id="wordbook-progress-fill" style="width: 25%;"></div>
            </div>
          </div>

          <div class="wordbook-grid" id="wordbook-grid">
            <!-- Dynamically populated -->
          </div>
        </div>
      </div>
    `;

    this.modalOverlay = this.container.querySelector('#wordbook-modal-overlay');
    this.bindEvents();
    this.renderCards();
  }

  private bindEvents(): void {
    if (!this.modalOverlay) return;

    const closeBtn = this.modalOverlay.querySelector('#btn-wordbook-close');
    closeBtn?.addEventListener('click', () => this.close());

    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) {
        this.close();
      }
    });
  }

  private updateProgressBadge(): void {
    const textEl = this.container.querySelector('#wordbook-progress-text');
    const fillEl = this.container.querySelector('#wordbook-progress-fill') as HTMLElement;
    const { unlocked, total } = this.getUnlockedCount();

    if (textEl) {
      textEl.textContent = `Descobertes: ${unlocked} / ${total} Paraules`;
    }
    if (fillEl) {
      fillEl.style.width = `${Math.round((unlocked / total) * 100)}%`;
    }
  }

  private renderCards(): void {
    const grid = this.container.querySelector('#wordbook-grid');
    if (!grid) return;

    this.updateProgressBadge();

    grid.innerHTML = CATALAN_DICTIONARY.map(card => {
      const isUnlocked = this.unlockedWords.has(card.id);
      return `
        <div class="word-card ${isUnlocked ? 'unlocked' : 'locked'}" data-card-id="${card.id}">
          <div class="word-card-emoji">${isUnlocked ? card.emoji : '❓'}</div>
          <div class="word-card-text">
            <span class="word-card-title">${isUnlocked ? card.word : '???'}</span>
            <div class="word-card-syllables">
              ${isUnlocked ? card.syllables.map(s => `<span class="syll-chip">${s}</span>`).join('') : '<span class="locked-hint">Per descobrir</span>'}
            </div>
          </div>
          ${isUnlocked ? `
            <button class="word-card-sound-btn" title="Escolta">🔊</button>
          ` : ''}
        </div>
      `;
    }).join('');

    // Attach click events on each card
    const cardEls = grid.querySelectorAll('.word-card');
    cardEls.forEach((el) => {
      const cardId = el.getAttribute('data-card-id');
      const card = CATALAN_DICTIONARY.find(c => c.id === cardId);
      if (!card) return;

      el.addEventListener('click', () => {
        if (this.unlockedWords.has(card.id)) {
          // Play pronunciation and sound
          this.playCard(card, el as HTMLElement);
        } else {
          soundSynth.playUIBeep(300);
          voiceHandler.speak(`Aquesta paraula encara està amagada! Construeix una ${card.translationEn.toLowerCase()} per desbloquejar-la!`);
        }
      });
    });
  }

  private playCard(card: CatalanWordCard, cardEl: HTMLElement): void {
    cardEl.classList.add('card-pulse');
    setTimeout(() => cardEl.classList.remove('card-pulse'), 500);

    switch (card.soundType) {
      case 'cow':
        soundSynth.playCowMoo();
        break;
      case 'sheep':
        soundSynth.playSheepBaa();
        break;
      case 'duck':
        soundSynth.playDuckQuack();
        break;
      case 'train':
        soundSynth.playWhistle(0.6);
        break;
      case 'bell':
        soundSynth.playStationBell();
        break;
      case 'magic':
        soundSynth.playMagicRainbow();
        break;
      default:
        soundSynth.playBrickSnap(1.4);
        break;
    }

    const syllablesText = card.syllables.join('-');
    voiceHandler.speak(`${card.article} ${card.word.toLowerCase()}! ${syllablesText}. ${card.sentence}`);
    this.onWordPlay?.(card);
  }
}
