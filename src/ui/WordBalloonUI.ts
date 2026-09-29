import { CATALAN_DICTIONARY, type CatalanWordCard } from '../data/catalanAudioCatalog';
import { voiceHandler } from '../engine/VoiceHandler';
import { soundSynth } from '../engine/SoundSynth';

export class WordBalloonUI {
  private container: HTMLElement;
  private currentCard: CatalanWordCard | null = null;
  private fadeTimeout: number | null = null;

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'word-balloon-container';
    parent.appendChild(this.container);
  }

  /**
   * Displays the popup for a given Catalan word card or brick shape
   */
  public showForShape(shape: string): void {
    const card = CATALAN_DICTIONARY.find(c => c.id === shape || c.shapeMatch.includes(shape));
    if (!card) return;
    this.showCard(card);
  }

  public showCard(card: CatalanWordCard): void {
    this.currentCard = card;
    if (this.fadeTimeout) {
      window.clearTimeout(this.fadeTimeout);
    }

    // Play associated sound effect
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
      case 'pop':
      default:
        soundSynth.playBrickSnap(1.3);
        break;
    }

    // Speak in Catalan
    const syllablesText = card.syllables.join('-');
    voiceHandler.speak(`${card.article} ${card.word.toLowerCase()}! ${syllablesText}. ${card.sentence}`);

    this.container.innerHTML = `
      <div class="word-balloon-card animate-pop" id="balloon-card">
        <div class="balloon-emoji-badge">${card.emoji}</div>
        <div class="balloon-text-content">
          <div class="balloon-word-row">
            <span class="balloon-article">${card.article}</span>
            <span class="balloon-word">${card.word}</span>
            <div class="balloon-syllables">
              ${card.syllables.map(s => `<span class="syllable-pill">${s}</span>`).join('')}
            </div>
          </div>
          <p class="balloon-sentence">${card.sentence}</p>
        </div>
        <button class="balloon-speak-btn" id="btn-balloon-repeat" title="Escolta de nou">
          <span>🔊</span>
        </button>
      </div>
    `;

    const repeatBtn = this.container.querySelector('#btn-balloon-repeat');
    repeatBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.playCurrentCard();
    });

    // Auto dismiss after 3.8s
    this.fadeTimeout = window.setTimeout(() => {
      const cardEl = this.container.querySelector('#balloon-card');
      if (cardEl) {
        cardEl.classList.add('animate-fadeout');
        setTimeout(() => {
          this.container.innerHTML = '';
        }, 300);
      }
    }, 3800);
  }

  private playCurrentCard(): void {
    if (!this.currentCard) return;
    const card = this.currentCard;
    const syllablesText = card.syllables.join('-');
    voiceHandler.speak(`${card.word.toLowerCase()}! ${syllablesText}. ${card.sentence}`);
    soundSynth.playAnimalJump();
  }
}
