/**
 * Screen Manager & Navigation Router for Hot Dog Stand.
 */

import { gameState, DIFFICULTY_MODES } from '../state.js';
import { formatMoney } from '../utils/formatters.js';
import { soundManager } from '../audio/soundManager.js';
import { renderFrankieSvg, renderBriefingScreen } from './briefingScreen.js';
import { renderInventoryScreen } from './inventoryScreen.js';
import { renderMarketingScreen } from './marketingScreen.js';
import { renderPricingScreen } from './pricingScreen.js';
import { renderSimView } from './simView.js';
import { renderLedgerScreen } from './ledgerScreen.js';
import { renderSeasonCompleteScreen } from './seasonCompleteScreen.js';
import { calculatorModal } from './calculatorModal.js';

export class ScreenManager {
  constructor(appContainer) {
    this.container = appContainer;
    this.currentScreen = 'TITLE';
    this.activeLedger = null;
  }

  init() {
    // Check if there is an ongoing game saved
    const hasSaved = gameState.load();
    if (hasSaved && gameState.currentEventIndex > 0 && !gameState.isSeasonComplete) {
      this.goToScreen('BRIEFING');
    } else {
      this.goToScreen('TITLE');
    }
  }

  goToScreen(screenName, payload = null) {
    this.currentScreen = screenName;
    this.container.innerHTML = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (screenName) {
      case 'TITLE':
        this.renderTitleScreen();
        break;
      case 'BRIEFING':
        renderBriefingScreen(this.container, () => this.goToScreen('INVENTORY'));
        break;
      case 'INVENTORY':
        renderInventoryScreen(
          this.container,
          () => this.goToScreen('MARKETING'),
          () => this.goToScreen('BRIEFING')
        );
        break;
      case 'MARKETING':
        renderMarketingScreen(
          this.container,
          () => this.goToScreen('PRICING'),
          () => this.goToScreen('INVENTORY')
        );
        break;
      case 'PRICING':
        renderPricingScreen(
          this.container,
          () => this.goToScreen('SIMULATION'),
          () => this.goToScreen('MARKETING')
        );
        break;
      case 'SIMULATION':
        renderSimView(this.container, (ledger) => {
          this.activeLedger = ledger;
          this.goToScreen('LEDGER');
        });
        break;
      case 'LEDGER':
        renderLedgerScreen(this.container, this.activeLedger, () => {
          gameState.advanceToNextEvent();
          if (gameState.isSeasonComplete) {
            this.goToScreen('SEASON_COMPLETE');
          } else {
            this.goToScreen('BRIEFING');
          }
        });
        break;
      case 'SEASON_COMPLETE':
        renderSeasonCompleteScreen(this.container, () => this.goToScreen('BRIEFING'));
        break;
    }
  }

  renderTitleScreen() {
    this.container.innerHTML = `
      <div class="title-screen retro-window">
        <div class="retro-titlebar">
          <span class="retro-title-text">🌭 Hot Dog Stand: The Works</span>
        </div>

        <div class="title-hero">
          <div class="title-mascot">
            ${renderFrankieSvg('SUNNY_WARM')}
          </div>
          <div class="title-text-group">
            <h1 class="game-main-title">HOT DOG STAND: THE WORKS</h1>
            <p class="game-subtitle">The Classic Educational Business Simulation Game</p>
            <p class="game-tagline">
              Master supply and demand, balance advertising with profit margins, outsmart the weather, and build your hot dog empire!
            </p>
          </div>
        </div>

        <div class="title-features-banner">
          <div class="feat-card">
            <span class="feat-icon">🌦️</span>
            <h4>Weather & Crowd Dynamics</h4>
            <p>Hot weather drives cold drinks; rainy skies test your inventory control.</p>
          </div>
          <div class="feat-card">
            <span class="feat-icon">📦</span>
            <h4>Real Packaging Math</h4>
            <p>Franks in 10s, buns in 8s. Match your packs and minimize perishable spoilage!</p>
          </div>
          <div class="feat-card">
            <span class="feat-icon">💵</span>
            <h4>Financial Literacy</h4>
            <p>Analyze authentic income statements, COGS, margins, and data graphs.</p>
          </div>
        </div>

        <div class="difficulty-select-box retro-box">
          <h3>Choose Your Challenge Level:</h3>
          <div class="diff-cards-grid">
            ${Object.values(DIFFICULTY_MODES).map(mode => `
              <div class="diff-card ${mode.id === 'STANDARD' ? 'selected' : ''}" data-diff="${mode.id}">
                <div class="diff-header">
                  <span class="diff-name">${mode.name}</span>
                  <span class="diff-badge">${mode.id}</span>
                </div>
                <p class="diff-desc">${mode.description}</p>
                <div class="diff-params">
                  <span>Starting Bankroll: <strong>${formatMoney(mode.startingCash)}</strong></span>
                  <span>Season Profit Target: <strong>${formatMoney(mode.seasonProfitGoal)}</strong></span>
                </div>
                <button class="retro-btn btn-primary btn-start-diff" data-diff="${mode.id}">
                  Start Season as ${mode.name.split(' ')[0]} ➔
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.container.querySelectorAll('.btn-start-diff').forEach(btn => {
      btn.addEventListener('click', () => {
        soundManager.playCashRegister();
        const diff = btn.getAttribute('data-diff');
        gameState.resetGame(diff);
        this.goToScreen('BRIEFING');
      });
    });
  }
}
