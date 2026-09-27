import './style.css';
import { GameManager } from './game/GameManager';

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('app');
  if (!container) {
    throw new Error('Could not find #app element');
  }

  // Initialize BlockStory Català
  const game = new GameManager(container);

  // Expose game instance for debugging if needed
  (window as unknown as { game: GameManager }).game = game;
});
