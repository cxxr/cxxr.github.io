/**
 * Application entry point for Hot Dog Stand: The Works.
 */

import { gameState } from './state.js';
import { ScreenManager } from './ui/screenManager.js';
import { soundManager } from './audio/soundManager.js';
import { calculatorModal } from './ui/calculatorModal.js';
import { formatMoney } from './utils/formatters.js';

document.addEventListener('DOMContentLoaded', () => {
  const appRoot = document.getElementById('app-root');
  const screenManager = new ScreenManager(appRoot);

  // Initialize screen manager
  screenManager.init();

  // Top header controls
  const btnSound = document.getElementById('header-btn-sound');
  const btnCalc = document.getElementById('header-btn-calc');
  const btnHelp = document.getElementById('header-btn-help');
  const btnReset = document.getElementById('header-btn-reset');
  const headerCash = document.getElementById('header-cash-display');

  function updateHeader() {
    if (headerCash) {
      headerCash.textContent = formatMoney(gameState.cash);
    }
  }

  // Update header periodically
  setInterval(updateHeader, 500);

  if (btnSound) {
    btnSound.addEventListener('click', () => {
      const isMuted = soundManager.toggleMute();
      btnSound.textContent = isMuted ? '🔇 Sound Off' : '🔊 Sound On';
      btnSound.classList.toggle('muted', isMuted);
    });
  }

  if (btnCalc) {
    btnCalc.addEventListener('click', () => {
      soundManager.playClick();
      calculatorModal.toggle();
    });
  }

  if (btnHelp) {
    btnHelp.addEventListener('click', () => {
      soundManager.playClick();
      const helpModal = document.getElementById('help-modal');
      if (helpModal) helpModal.classList.remove('hidden');
    });
  }

  const helpClose = document.getElementById('help-close-btn');
  if (helpClose) {
    helpClose.addEventListener('click', () => {
      soundManager.playClick();
      const helpModal = document.getElementById('help-modal');
      if (helpModal) helpModal.classList.add('hidden');
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('Start a new game? Any current season progress will be reset.')) {
        soundManager.playCashRegister();
        gameState.resetGame(gameState.difficulty?.id || 'STANDARD');
        screenManager.goToScreen('TITLE');
      }
    });
  }
});
