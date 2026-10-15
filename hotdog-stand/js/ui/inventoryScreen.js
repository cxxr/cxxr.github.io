/**
 * Supplies Purchasing & Inventory Screen.
 * Lets players order supplies, compare bulk unit costs, match bun-to-dog ratios,
 * and manage perishable shelf-life risk.
 */

import { gameState } from '../state.js';
import { SUPPLIES_CATALOG, purchaseSupplies } from '../models/inventory.js';
import { formatMoney, formatNumber } from '../utils/formatters.js';
import { soundManager } from '../audio/soundManager.js';
import { calculatorModal } from './calculatorModal.js';

export function renderInventoryScreen(container, onNext, onBack) {
  // Temporary shopping cart: { [packId]: { supplyId, pack, count: 0 } }
  const cart = {};

  for (const [supplyId, catalogItem] of Object.entries(SUPPLIES_CATALOG)) {
    for (const pack of catalogItem.packs) {
      cart[pack.id] = { supplyId, pack, count: 0 };
    }
  }

  function getCartTotals() {
    let totalCost = 0;
    const addedUnits = {};

    for (const item of Object.values(cart)) {
      if (item.count > 0) {
        totalCost += item.pack.price * item.count;
        addedUnits[item.supplyId] = (addedUnits[item.supplyId] || 0) + (item.pack.size * item.count);
      }
    }

    const totalDogs = (gameState.inventory.BEEF_FRANKS.quantity + (addedUnits.BEEF_FRANKS || 0)) +
                      (gameState.inventory.VEGGIE_FRANKS.quantity + (addedUnits.VEGGIE_FRANKS || 0));

    const totalBuns = gameState.inventory.BUNS.quantity + (addedUnits.BUNS || 0);

    return { totalCost, addedUnits, totalDogs, totalBuns };
  }

  function render() {
    const { totalCost, totalDogs, totalBuns } = getCartTotals();
    const remainingCash = gameState.cash - totalCost;
    const hasEnoughCash = remainingCash >= 0;

    const dogBunDiff = totalBuns - totalDogs;
    let matchAlert = '';
    if (totalDogs === 0 && totalBuns === 0) {
      matchAlert = `<span class="matcher-hint neutral">ℹ️ You haven't added any hot dogs or buns yet.</span>`;
    } else if (dogBunDiff < 0) {
      matchAlert = `
        <span class="matcher-hint warning">
          ⚠️ <strong>Bun Shortage!</strong> You have ${totalDogs} franks but only ${totalBuns} buns (${Math.abs(dogBunDiff)} franks will go unserved!).
        </span>
      `;
    } else if (dogBunDiff > 0) {
      matchAlert = `
        <span class="matcher-hint caution">
          🍞 <strong>Extra Buns:</strong> You have ${dogBunDiff} more buns than franks. Fresh buns spoil at the end of the day!
        </span>
      `;
    } else {
      matchAlert = `
        <span class="matcher-hint success">
          ✅ <strong>Perfect Balance!</strong> Exactly ${totalDogs} franks and ${totalBuns} buns!
        </span>
      `;
    }

    container.innerHTML = `
      <div class="inventory-screen retro-window">
        <div class="retro-titlebar">
          <span class="retro-title-text">🛒 Supplies Catalog & Inventory Management</span>
          <div class="titlebar-badges">
            <span class="badge badge-cash">Cash: ${formatMoney(gameState.cash)}</span>
            <button class="retro-btn-sm" id="btn-open-calc" title="Open Business Calculator">🧮 Calculator</button>
          </div>
        </div>

        <div class="inventory-layout">
          <!-- Main Catalog Left Side -->
          <div class="catalog-scroll-panel">
            <div class="catalog-instructions">
              <p>Review current stock and purchase supplies. <strong>Watch out:</strong> Fresh buns spoil after 1 event, while franks last 2 events!</p>
            </div>

            <div class="catalog-grid">
              ${Object.entries(SUPPLIES_CATALOG).map(([supplyId, item]) => {
                const currentStock = gameState.inventory[supplyId]?.quantity || 0;
                let shelfLifeBadge = '';
                if (item.shelfLifeEvents === 1) {
                  shelfLifeBadge = '<span class="badge-spoil spoil-high">⚠️ Highly Perishable (1 Event)</span>';
                } else if (item.shelfLifeEvents === 2) {
                  shelfLifeBadge = '<span class="badge-spoil spoil-med">Refrigerated (2 Events)</span>';
                } else {
                  shelfLifeBadge = '<span class="badge-spoil spoil-safe">Shelf-Stable</span>';
                }

                return `
                  <div class="catalog-item-card">
                    <div class="item-card-header">
                      <span class="item-icon">${item.icon}</span>
                      <div class="item-meta">
                        <h4>${item.name}</h4>
                        <div class="item-stock-row">
                          <span class="stock-pill">Current Stock: <strong>${currentStock}</strong></span>
                          ${shelfLifeBadge}
                        </div>
                      </div>
                    </div>

                    <div class="pack-options-list">
                      ${item.packs.map(pack => {
                        const count = cart[pack.id].count;
                        const unitCost = pack.price / pack.size;
                        return `
                          <div class="pack-option-row ${count > 0 ? 'selected' : ''}">
                            <div class="pack-desc">
                              <span class="pack-title">${pack.label}</span>
                              <span class="pack-math">${formatMoney(pack.price)} total · <em>(${formatMoney(unitCost)}/ea)</em></span>
                            </div>
                            <div class="pack-counter">
                              <button class="counter-btn btn-minus" data-pack-id="${pack.id}" ${count === 0 ? 'disabled' : ''}>-</button>
                              <span class="count-display">${count}</span>
                              <button class="counter-btn btn-plus" data-pack-id="${pack.id}">+</button>
                            </div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Shopping Cart & Matcher Sidebar Right Side -->
          <div class="cart-sidebar">
            <div class="sidebar-box order-summary-box">
              <h3>📦 Order Summary</h3>

              <!-- Bun & Dog Matcher Widget -->
              <div class="matcher-box">
                <h4>🌭 Bun & Frank Matcher</h4>
                <div class="matcher-counts">
                  <div class="count-box">
                    <span class="lbl">Total Dogs</span>
                    <span class="val">${totalDogs}</span>
                  </div>
                  <span class="vs">vs</span>
                  <div class="count-box">
                    <span class="lbl">Total Buns</span>
                    <span class="val">${totalBuns}</span>
                  </div>
                </div>
                <div class="matcher-status">
                  ${matchAlert}
                </div>
                <button class="retro-btn-sm btn-subtle" id="btn-balance-buns" title="Calculates 8-packs of buns to cover franks">
                  ✨ Auto-Balance Buns (8-packs)
                </button>
              </div>

              <!-- Cost Totals -->
              <div class="cost-breakdown">
                <div class="cost-row">
                  <span>Current Bank Balance:</span>
                  <strong>${formatMoney(gameState.cash)}</strong>
                </div>
                <div class="cost-row">
                  <span>New Order Total:</span>
                  <strong class="order-cost">${formatMoney(totalCost)}</strong>
                </div>
                <hr class="retro-divider"/>
                <div class="cost-row balance-row ${hasEnoughCash ? 'positive' : 'negative'}">
                  <span>Remaining Cash:</span>
                  <strong>${formatMoney(remainingCash)}</strong>
                </div>
              </div>

              ${!hasEnoughCash ? `
                <div class="alert-box alert-error">
                  ⛔ <strong>Insufficient Funds!</strong> Remove items to bring order cost within your ${formatMoney(gameState.cash)} budget.
                </div>
              ` : ''}

              <div class="cart-action-buttons">
                <button class="retro-btn btn-primary full-width" id="btn-confirm-supplies" ${!hasEnoughCash ? 'disabled' : ''}>
                  Confirm Order & Set Ads ➔
                </button>
                <button class="retro-btn btn-secondary full-width" id="btn-back-briefing">
                  ⬅ Back to Briefing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    attachEvents();
  }

  function attachEvents() {
    // Minus pack
    container.querySelectorAll('.btn-minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        soundManager.playClick();
        const packId = btn.getAttribute('data-pack-id');
        if (cart[packId] && cart[packId].count > 0) {
          cart[packId].count -= 1;
          render();
        }
      });
    });

    // Plus pack
    container.querySelectorAll('.btn-plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        soundManager.playPop();
        const packId = btn.getAttribute('data-pack-id');
        if (cart[packId]) {
          cart[packId].count += 1;
          render();
        }
      });
    });

    // Auto-balance buns button
    const balanceBtn = container.querySelector('#btn-balance-buns');
    if (balanceBtn) {
      balanceBtn.addEventListener('click', () => {
        soundManager.playPop();
        const { totalDogs } = getCartTotals();
        const existingBuns = gameState.inventory.BUNS.quantity;
        const neededBuns = Math.max(0, totalDogs - existingBuns);

        // Reset bun counts in cart
        cart['buns_pack_8'].count = 0;
        cart['buns_carton_48'].count = 0;
        cart['buns_bulk_96'].count = 0;

        if (neededBuns > 0) {
          // Use largest economical cartons first, then 8-packs
          let rem = neededBuns;
          if (rem >= 96) {
            const bulkCount = Math.floor(rem / 96);
            cart['buns_bulk_96'].count = bulkCount;
            rem -= bulkCount * 96;
          }
          if (rem >= 48) {
            const cartonCount = Math.floor(rem / 48);
            cart['buns_carton_48'].count = cartonCount;
            rem -= cartonCount * 48;
          }
          if (rem > 0) {
            const pack8Count = Math.ceil(rem / 8);
            cart['buns_pack_8'].count = pack8Count;
          }
        }
        render();
      });
    }

    // Open calculator
    container.querySelector('#btn-open-calc').addEventListener('click', () => {
      soundManager.playClick();
      calculatorModal.toggle();
    });

    // Back to briefing
    container.querySelector('#btn-back-briefing').addEventListener('click', () => {
      soundManager.playClick();
      onBack();
    });

    // Confirm supplies and checkout
    const confirmBtn = container.querySelector('#btn-confirm-supplies');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        const { totalCost } = getCartTotals();
        if (totalCost > gameState.cash) return;

        soundManager.playCashRegister();

        // Commit purchases to gameState
        for (const item of Object.values(cart)) {
          if (item.count > 0) {
            purchaseSupplies(gameState.inventory, item.supplyId, item.pack.id, item.count);
          }
        }
        gameState.cash -= totalCost;
        gameState.save();

        onNext();
      });
    }
  }

  render();
}
