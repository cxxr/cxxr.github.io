/**
 * Pricing Strategy Screen.
 * Teaches unit margins, markup percentage, price elasticity, and consumer psychology.
 */

import { gameState } from '../state.js';
import { MENU_ITEMS } from '../models/inventory.js';
import { calculateElasticityFactor } from '../models/simulation.js';
import { formatMoney, formatPercent, calculateProfitMargin } from '../utils/formatters.js';
import { soundManager } from '../audio/soundManager.js';
import { calculatorModal } from './calculatorModal.js';

export function renderPricingScreen(container, onNext, onBack) {
  // Clone current prices
  const currentPrices = { ...gameState.menuPrices };

  // Calculate estimated unit costs for each item based on current inventory batches
  function getEstimatedUnitCost(itemKey) {
    const item = MENU_ITEMS[itemKey];
    let totalUnitCost = 0;

    for (const req of item.requiredSupplies) {
      const stock = gameState.inventory[req.supplyId];
      if (stock && stock.batches.length > 0) {
        totalUnitCost += stock.batches[0].unitCost * req.count;
      } else {
        // Fallback standard catalog cost
        if (req.supplyId === 'BEEF_FRANKS') totalUnitCost += 0.50 * req.count;
        else if (req.supplyId === 'VEGGIE_FRANKS') totalUnitCost += 0.60 * req.count;
        else if (req.supplyId === 'BUNS') totalUnitCost += 0.25 * req.count;
        else if (req.supplyId === 'CONDIMENTS') totalUnitCost += 0.10 * req.count;
        else if (req.supplyId === 'COLD_SODA') totalUnitCost += 0.45 * req.count;
        else if (req.supplyId === 'WARM_COCOA') totalUnitCost += 0.35 * req.count;
        else if (req.supplyId === 'CHIPS') totalUnitCost += 0.40 * req.count;
      }
    }
    return totalUnitCost;
  }

  function getSentimentInfo(itemKey, price) {
    const item = MENU_ITEMS[itemKey];
    const fairPrice = item.baseFairPrice;
    const ratio = price / fairPrice;
    const elasticity = calculateElasticityFactor(itemKey, price);

    if (ratio < 0.85) {
      return {
        tag: 'Bargain Deal!',
        emoji: '🤩',
        className: 'sentiment-bargain',
        comment: 'Fans will flock to your stand for this bargain price!'
      };
    } else if (ratio <= 1.15) {
      return {
        tag: 'Fair Market Price',
        emoji: '😊',
        className: 'sentiment-fair',
        comment: 'Balanced price. Customers find this very reasonable.'
      };
    } else if (ratio <= 1.45) {
      return {
        tag: 'Pricey',
        emoji: '😐',
        className: 'sentiment-pricey',
        comment: 'A bit high! Some budget-minded fans will skip ordering.'
      };
    } else {
      return {
        tag: 'Highway Robbery!',
        emoji: '😡',
        className: 'sentiment-robbery',
        comment: 'Way too expensive! Most customers will walk away disgusted.'
      };
    }
  }

  function render() {
    container.innerHTML = `
      <div class="pricing-screen retro-window">
        <div class="retro-titlebar">
          <span class="retro-title-text">🏷️ Menu Pricing & Margin Calculator</span>
          <div class="titlebar-badges">
            <span class="badge badge-cash">Cash: ${formatMoney(gameState.cash)}</span>
            <button class="retro-btn-sm" id="btn-open-calc">🧮 Calculator</button>
          </div>
        </div>

        <div class="pricing-content">
          <div class="pricing-intro">
            <h2>Set Your Retail Prices</h2>
            <p>
              Your profit on each sale is <strong>(Selling Price − Food Cost)</strong>.
              Careful though: charge too much and customers will complain about <em>"highway robbery"</em> and walk away empty-handed!
            </p>
          </div>

          <div class="pricing-grid">
            ${Object.entries(MENU_ITEMS).map(([key, item]) => {
              const price = currentPrices[key] || item.defaultPrice;
              const unitCost = getEstimatedUnitCost(key);
              const unitProfit = price - unitCost;
              const margin = calculateProfitMargin(price, unitCost);
              const sentiment = getSentimentInfo(key, price);

              return `
                <div class="price-card" data-item-key="${key}">
                  <div class="price-card-header">
                    <span class="item-icon-lg">${item.icon}</span>
                    <div class="price-title-wrap">
                      <h3>${item.name}</h3>
                      <span class="unit-cost-note">Cost to make: <strong>${formatMoney(unitCost)}</strong></span>
                    </div>
                  </div>

                  <div class="price-adjuster-box">
                    <span class="price-lbl">Selling Price:</span>
                    <div class="price-stepper">
                      <button class="step-btn btn-price-down" data-key="${key}">−</button>
                      <span class="price-val">${formatMoney(price)}</span>
                      <button class="step-btn btn-price-up" data-key="${key}">+</button>
                    </div>
                  </div>

                  <div class="margin-math-box">
                    <div class="margin-row">
                      <span>Profit Per Unit:</span>
                      <strong class="${unitProfit >= 0 ? 'text-green' : 'text-red'}">
                        ${formatMoney(unitProfit)}
                      </strong>
                    </div>
                    <div class="margin-row">
                      <span>Profit Margin %:</span>
                      <strong>${formatPercent(margin, 0)}</strong>
                    </div>
                  </div>

                  <div class="sentiment-badge ${sentiment.className}">
                    <span class="sentiment-emoji">${sentiment.emoji}</span>
                    <div class="sentiment-text">
                      <span class="sentiment-title">${sentiment.tag}</span>
                      <span class="sentiment-desc">${sentiment.comment}</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div class="pricing-action-bar">
            <button class="retro-btn btn-secondary" id="btn-back-marketing">
              ⬅ Back to Advertising
            </button>
            <button class="retro-btn btn-success-lg" id="btn-start-simulation">
              🌭 Open Stand & Start Game Day! ➔
            </button>
          </div>
        </div>
      </div>
    `;

    attachEvents();
  }

  function attachEvents() {
    container.querySelectorAll('.btn-price-down').forEach(btn => {
      btn.addEventListener('click', () => {
        soundManager.playClick();
        const key = btn.getAttribute('data-key');
        const item = MENU_ITEMS[key];
        if (currentPrices[key] > item.minPrice) {
          currentPrices[key] = Math.max(item.minPrice, Math.round((currentPrices[key] - 0.25) * 100) / 100);
          render();
        }
      });
    });

    container.querySelectorAll('.btn-price-up').forEach(btn => {
      btn.addEventListener('click', () => {
        soundManager.playPop();
        const key = btn.getAttribute('data-key');
        const item = MENU_ITEMS[key];
        if (currentPrices[key] < item.maxPrice) {
          currentPrices[key] = Math.min(item.maxPrice, Math.round((currentPrices[key] + 0.25) * 100) / 100);
          render();
        }
      });
    });

    container.querySelector('#btn-open-calc').addEventListener('click', () => {
      soundManager.playClick();
      calculatorModal.toggle();
    });

    container.querySelector('#btn-back-marketing').addEventListener('click', () => {
      soundManager.playClick();
      onBack();
    });

    container.querySelector('#btn-start-simulation').addEventListener('click', () => {
      soundManager.playCashRegister();
      gameState.menuPrices = { ...currentPrices };
      gameState.save();
      onNext();
    });
  }

  render();
}
