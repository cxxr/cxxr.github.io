/**
 * Central State Store for Hot Dog Stand: The Works.
 * Manages game state, active event, inventory, financial history, and persistence.
 */

import { generateEvent, SEASON_SCHEDULE } from './models/events.js';
import { createInitialInventory, ADVERTISING_CAMPAIGNS, MENU_ITEMS } from './models/inventory.js';

const STORAGE_KEY = 'hotdog_stand_game_state_v1';

export const DIFFICULTY_MODES = {
  JUNIOR: {
    id: 'JUNIOR',
    name: 'Junior Vendor (Ages 8-10)',
    description: 'Generous budgets, forgiving weather, and extra math hints.',
    startingCash: 350.00,
    seasonProfitGoal: 1000.00,
    spoilageMultiplier: 0.5,
    allowAutoPackHelper: true
  },
  STANDARD: {
    id: 'STANDARD',
    name: 'Stand Manager (Classic 90s)',
    description: 'Authentic 90s simulation with realistic packaging math and spoilage.',
    startingCash: 250.00,
    seasonProfitGoal: 1500.00,
    spoilageMultiplier: 1.0,
    allowAutoPackHelper: true
  },
  TYCOON: {
    id: 'TYCOON',
    name: 'Franchise Tycoon (Challenging)',
    description: 'Tighter margins, volatile weather, and demanding crowds!',
    startingCash: 180.00,
    seasonProfitGoal: 2200.00,
    spoilageMultiplier: 1.25,
    allowAutoPackHelper: false
  }
};

export class GameState {
  constructor() {
    this.resetGame('STANDARD');
  }

  resetGame(difficultyKey = 'STANDARD') {
    const diff = DIFFICULTY_MODES[difficultyKey] || DIFFICULTY_MODES.STANDARD;
    this.difficulty = diff;
    this.cash = diff.startingCash;
    this.startingCash = diff.startingCash;
    this.seasonProfitGoal = diff.seasonProfitGoal;
    this.currentEventIndex = 0;
    this.inventory = createInitialInventory();
    this.currentEvent = generateEvent(0);
    this.selectedAdvertising = ADVERTISING_CAMPAIGNS[0];
    this.menuPrices = {
      BEEF_DOG: MENU_ITEMS.BEEF_DOG.defaultPrice,
      VEGGIE_DOG: MENU_ITEMS.VEGGIE_DOG.defaultPrice,
      COLD_DRINK: MENU_ITEMS.COLD_DRINK.defaultPrice,
      WARM_DRINK: MENU_ITEMS.WARM_DRINK.defaultPrice,
      SNACK_CHIPS: MENU_ITEMS.SNACK_CHIPS.defaultPrice
    };
    this.eventHistory = [];
    this.isSeasonComplete = false;
    this.mathBonusEarned = 0;
  }

  save() {
    try {
      const serialized = JSON.stringify({
        difficulty: this.difficulty,
        cash: this.cash,
        startingCash: this.startingCash,
        seasonProfitGoal: this.seasonProfitGoal,
        currentEventIndex: this.currentEventIndex,
        inventory: this.inventory,
        currentEvent: this.currentEvent,
        selectedAdvertising: this.selectedAdvertising,
        menuPrices: this.menuPrices,
        eventHistory: this.eventHistory,
        isSeasonComplete: this.isSeasonComplete,
        mathBonusEarned: this.mathBonusEarned
      });
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }

  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return false;
      const parsed = JSON.parse(data);
      Object.assign(this, parsed);
      return true;
    } catch (e) {
      console.warn('Could not load from localStorage:', e);
      return false;
    }
  }

  clearSavedGame() {
    localStorage.removeItem(STORAGE_KEY);
  }

  advanceToNextEvent() {
    this.currentEventIndex += 1;
    if (this.currentEventIndex >= SEASON_SCHEDULE.length) {
      this.isSeasonComplete = true;
    } else {
      this.currentEvent = generateEvent(this.currentEventIndex);
      this.selectedAdvertising = ADVERTISING_CAMPAIGNS[0];
    }
    this.save();
  }

  recordEventResult(ledger) {
    this.cash = ledger.endingCash;
    this.eventHistory.push(ledger);
    this.save();
  }

  awardMathBonus(amount) {
    this.cash += amount;
    this.mathBonusEarned += amount;
    this.save();
  }

  getCumulativeNetProfit() {
    return this.eventHistory.reduce((sum, h) => sum + h.statement.netProfit, 0);
  }

  getTotalRevenue() {
    return this.eventHistory.reduce((sum, h) => sum + h.statement.grossRevenue, 0);
  }

  getTotalCustomersServed() {
    return this.eventHistory.reduce((sum, h) => sum + h.performance.itemsSold, 0);
  }
}

export const gameState = new GameState();
