/**
 * Advertising & Marketing Screen.
 * Teaches advertising trade-offs, crowd lift percentages, and break-even math.
 */

import { gameState } from '../state.js';
import { ADVERTISING_CAMPAIGNS } from '../models/inventory.js';
import { formatMoney, formatNumber, formatPercent } from '../utils/formatters.js';
import { soundManager } from '../audio/soundManager.js';
import { calculatorModal } from './calculatorModal.js';

export function renderMarketingScreen(container, onNext, onBack) {
  let selectedAdId = gameState.selectedAdvertising?.id || 'NONE';

  function render() {
    const event = gameState.currentEvent;
    const baseCrowd = event.expectedAttendance;
    const selectedCampaign = ADVERTISING_CAMPAIGNS.find(a => a.id === selectedAdId) || ADVERTISING_CAMPAIGNS[0];
    const adCost = selectedCampaign.cost;
    const canAfford = gameState.cash >= adCost;

    const estimatedNewCrowd = Math.round(baseCrowd * (1 + selectedCampaign.attendanceMultiplierLift));
    const extraCrowd = estimatedNewCrowd - baseCrowd;

    // Approximate break-even math (assuming avg $1.50 gross profit per customer)
    const avgProfitPerCust = 1.60;
    const breakEvenCustomers = adCost > 0 ? Math.ceil(adCost / avgProfitPerCust) : 0;

    container.innerHTML = `
      <div class="marketing-screen retro-window">
        <div class="retro-titlebar">
          <span class="retro-title-text">📢 Advertising & Promotions Desk</span>
          <div class="titlebar-badges">
            <span class="badge badge-cash">Cash: ${formatMoney(gameState.cash)}</span>
            <button class="retro-btn-sm" id="btn-open-calc">🧮 Calculator</button>
          </div>
        </div>

        <div class="marketing-content">
          <div class="marketing-intro">
            <h2>Spread the Word & Pack the Bleachers!</h2>
            <p>Investing in advertising draws more customers from the surrounding community and venue, but the upfront fee comes straight out of your pocket. Will the extra sales cover the cost?</p>
          </div>

          <div class="marketing-layout">
            <!-- Campaign Selection Cards -->
            <div class="campaign-list">
              ${ADVERTISING_CAMPAIGNS.map(ad => {
                const isSelected = ad.id === selectedAdId;
                const affordable = gameState.cash >= ad.cost;

                return `
                  <div class="campaign-card ${isSelected ? 'selected' : ''} ${!affordable ? 'disabled' : ''}" data-ad-id="${ad.id}">
                    <div class="campaign-icon">${ad.icon}</div>
                    <div class="campaign-info">
                      <div class="campaign-header-row">
                        <h3 class="campaign-title">${ad.name}</h3>
                        <span class="campaign-cost ${ad.cost === 0 ? 'free' : ''}">
                          ${ad.cost === 0 ? 'FREE' : formatMoney(ad.cost)}
                        </span>
                      </div>
                      <p class="campaign-desc">${ad.description}</p>
                      <div class="campaign-stats">
                        <span class="stat-tag lift-tag">⚡ Crowd Lift: +${formatPercent(ad.attendanceMultiplierLift, 0)}</span>
                        ${!affordable ? '<span class="stat-tag unaffordable">⛔ Insufficient Cash</span>' : ''}
                      </div>
                    </div>
                    <div class="campaign-radio">
                      <input type="radio" name="adCampaign" value="${ad.id}" ${isSelected ? 'checked' : ''} ${!affordable ? 'disabled' : ''}>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Mathematical Impact & Break-Even Analysis Box -->
            <div class="marketing-sidebar">
              <div class="sidebar-box roi-box">
                <h3>📊 Advertising Math & ROI</h3>

                <div class="crowd-compare">
                  <div class="crowd-metric">
                    <span class="lbl">Base Attendance:</span>
                    <span class="val">~${formatNumber(baseCrowd)} fans</span>
                  </div>
                  <div class="crowd-metric highlight">
                    <span class="lbl">With This Campaign:</span>
                    <span class="val">~${formatNumber(estimatedNewCrowd)} fans</span>
                  </div>
                  <div class="crowd-metric sub">
                    <span class="lbl">Estimated Extra Fans:</span>
                    <span class="val text-green">+${formatNumber(extraCrowd)} fans</span>
                  </div>
                </div>

                <hr class="retro-divider"/>

                <div class="breakeven-explainer">
                  <h4>💡 Break-Even Analysis:</h4>
                  ${adCost === 0 ? `
                    <p>No ad expense! Every dollar of profit goes straight to your bottom line.</p>
                  ` : `
                    <p>
                      This campaign costs <strong>${formatMoney(adCost)}</strong>.<br/>
                      If you average roughly <strong>$1.60 gross profit</strong> per customer served, you need at least:
                    </p>
                    <div class="breakeven-stat">
                      <span class="be-num">${breakEvenCustomers} extra sales</span>
                      <span class="be-sub">to break even on your marketing investment!</span>
                    </div>
                  `}
                </div>

                <div class="campaign-action-buttons">
                  <button class="retro-btn btn-primary full-width" id="btn-confirm-ad" ${!canAfford ? 'disabled' : ''}>
                    Lock In Advertising & Set Prices ➔
                  </button>
                  <button class="retro-btn btn-secondary full-width" id="btn-back-supplies">
                    ⬅ Back to Supplies
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    attachEvents();
  }

  function attachEvents() {
    container.querySelectorAll('.campaign-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const adId = card.getAttribute('data-ad-id');
        const ad = ADVERTISING_CAMPAIGNS.find(a => a.id === adId);
        if (ad && gameState.cash >= ad.cost) {
          soundManager.playPop();
          selectedAdId = adId;
          render();
        }
      });
    });

    container.querySelector('#btn-open-calc').addEventListener('click', () => {
      soundManager.playClick();
      calculatorModal.toggle();
    });

    container.querySelector('#btn-back-supplies').addEventListener('click', () => {
      soundManager.playClick();
      onBack();
    });

    const confirmBtn = container.querySelector('#btn-confirm-ad');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        const ad = ADVERTISING_CAMPAIGNS.find(a => a.id === selectedAdId);
        if (!ad || gameState.cash < ad.cost) return;

        soundManager.playClick();
        gameState.selectedAdvertising = ad;
        gameState.save();
        onNext();
      });
    }
  }

  render();
}
