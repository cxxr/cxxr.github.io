/**
 * Financial Ledger, Analytics Charts, Frankie's Debrief, and Math Challenge Screen.
 */

import { gameState } from '../state.js';
import { formatMoney, formatNumber, formatPercent } from '../utils/formatters.js';
import { soundManager } from '../audio/soundManager.js';
import { renderFrankieSvg } from './briefingScreen.js';
import { calculatorModal } from './calculatorModal.js';

export function renderLedgerScreen(container, ledger, onContinue) {
  const statement = ledger.statement;
  const isNetProfitPositive = statement.netProfit >= 0;
  let mathChallengeAnswered = false;

  function render() {
    container.innerHTML = `
      <div class="ledger-screen retro-window">
        <div class="retro-titlebar">
          <span class="retro-title-text">📑 Financial Statement & Event Debrief — Event ${ledger.eventNumber}</span>
          <div class="titlebar-badges">
            <span class="badge badge-cash">New Cash Balance: ${formatMoney(ledger.endingCash)}</span>
            <button class="retro-btn-sm" id="btn-open-calc">🧮 Calculator</button>
          </div>
        </div>

        <div class="ledger-content">
          <!-- Top Hero Summary Card -->
          <div class="profit-hero-card ${isNetProfitPositive ? 'profit-positive' : 'profit-negative'}">
            <div class="hero-left">
              <span class="hero-lbl">Event ${ledger.eventNumber} Net Result:</span>
              <h1 class="hero-net-amount">${formatMoney(statement.netProfit)}</h1>
              <span class="hero-subtext">
                ${isNetProfitPositive ? '🎉 Terrific Job! You made a profit today!' : '⚠️ Operating at a loss. Review expenses below to bounce back!'}
              </span>
            </div>
            <div class="hero-metrics">
              <div class="hero-pill">
                <span class="hp-lbl">Customers Served</span>
                <span class="hp-val">${formatNumber(ledger.performance.itemsSold)}</span>
              </div>
              <div class="hero-pill">
                <span class="hp-lbl">Lost Sales (Stockouts)</span>
                <span class="hp-val ${ledger.performance.lostSales > 0 ? 'text-red' : ''}">${formatNumber(ledger.performance.lostSales)}</span>
              </div>
              <div class="hero-pill">
                <span class="hp-lbl">Customer Satisfaction</span>
                <span class="hp-val">${ledger.performance.customerSatisfaction}%</span>
              </div>
            </div>
          </div>

          <div class="ledger-grid-layout">
            <!-- Left Column: Detailed Income Statement Table -->
            <div class="statement-col">
              <div class="retro-box">
                <h3 class="box-title">💵 Official Income Statement</h3>
                <table class="ledger-table">
                  <tbody>
                    <tr class="row-header">
                      <td>Gross Revenue (Total Sales)</td>
                      <td class="text-right val-strong text-green">${formatMoney(statement.grossRevenue)}</td>
                    </tr>
                    <tr class="row-sub">
                      <td>&nbsp;&nbsp;Less: Cost of Goods Sold (COGS)</td>
                      <td class="text-right text-red">−${formatMoney(statement.cogs)}</td>
                    </tr>
                    <tr class="row-highlight">
                      <td><strong>= Gross Profit</strong> <span class="margin-badge">(${formatPercent(statement.grossMarginPercent, 0)} margin)</span></td>
                      <td class="text-right val-strong">${formatMoney(statement.grossProfit)}</td>
                    </tr>

                    <tr class="row-header">
                      <td>Less: Operating Expenses</td>
                      <td></td>
                    </tr>
                    <tr class="row-sub">
                      <td>&nbsp;&nbsp;• Advertising: <em>${statement.operatingExpenses.advertisingName}</em></td>
                      <td class="text-right">−${formatMoney(statement.operatingExpenses.advertising)}</td>
                    </tr>
                    <tr class="row-sub">
                      <td>&nbsp;&nbsp;• Venue Permit Fee</td>
                      <td class="text-right">−${formatMoney(statement.operatingExpenses.permitFee)}</td>
                    </tr>

                    <tr class="row-header">
                      <td>Less: Spoilage & Waste Loss</td>
                      <td class="text-right text-red">
                        ${statement.spoilageLoss > 0 ? `−${formatMoney(statement.spoilageLoss)}` : '$0.00'}
                      </td>
                    </tr>
                    ${statement.spoiledItems.map(sp => `
                      <tr class="row-sub row-spoil">
                        <td>&nbsp;&nbsp;• ${sp.icon} ${sp.name}: ${sp.unitsSpoiled} spoiled units</td>
                        <td class="text-right">−${formatMoney(sp.lossAmount)}</td>
                      </tr>
                    `).join('')}

                    <tr class="row-final ${isNetProfitPositive ? 'final-positive' : 'final-negative'}">
                      <td><strong>= Net Profit / (Loss)</strong></td>
                      <td class="text-right val-hero">${formatMoney(statement.netProfit)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Interactive Chart: Season Profit Trajectory -->
              <div class="retro-box chart-box">
                <h3 class="box-title">📈 Season Profit Trajectory</h3>
                <canvas id="profit-chart-canvas" width="460" height="160"></canvas>
              </div>
            </div>

            <!-- Right Column: Frankie's Debrief & Math Challenge -->
            <div class="debrief-col">
              <!-- Frankie's Advice Box -->
              <div class="retro-box frankie-debrief-box">
                <div class="debrief-header">
                  ${renderFrankieSvg(ledger.statement.spoilageLoss > 20 ? 'CHILLY_WIND' : 'SUNNY_WARM')}
                  <div>
                    <h4>Frankie's Business Debrief</h4>
                    <p class="debrief-sub">Here is what the numbers tell us:</p>
                  </div>
                </div>
                <div class="debrief-tips-list">
                  ${ledger.frankieDebrief.map(tip => `
                    <div class="tip-bubble">
                      <span class="tip-bullet">🌭</span>
                      <p>${tip}</p>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Optional Educational Math Challenge -->
              ${ledger.mathChallenge ? `
                <div class="retro-box challenge-box" id="challenge-box">
                  <div class="challenge-header">
                    <h4>⭐ Bonus Math Challenge!</h4>
                    <span class="reward-tag">Earn +${formatMoney(ledger.mathChallenge.reward)} Bonus Cash!</span>
                  </div>
                  <p class="challenge-q">${ledger.mathChallenge.question}</p>
                  <p class="challenge-hint"><em>💡 ${ledger.mathChallenge.hint}</em></p>

                  <div class="challenge-options" id="challenge-options">
                    ${ledger.mathChallenge.options.map((opt, idx) => `
                      <button class="retro-btn-sm btn-challenge-opt" data-opt-idx="${idx}" ${mathChallengeAnswered ? 'disabled' : ''}>
                        ${opt.text}
                      </button>
                    `).join('')}
                  </div>
                  <div class="challenge-result-msg hidden" id="challenge-result"></div>
                </div>
              ` : ''}

              <!-- Season Progress Goal Bar -->
              <div class="retro-box season-bar-box">
                <h4>🎯 Season Goal: ${formatMoney(gameState.seasonProfitGoal)} Profit</h4>
                <div class="progress-bar-container">
                  <div class="progress-bar-fill" style="width: ${Math.min(100, Math.max(0, Math.round((gameState.getCumulativeNetProfit() / gameState.seasonProfitGoal) * 100)))}%"></div>
                </div>
                <div class="season-bar-labels">
                  <span>Current Cumulative Profit: <strong>${formatMoney(gameState.getCumulativeNetProfit())}</strong></span>
                  <span>Target: <strong>${formatMoney(gameState.seasonProfitGoal)}</strong></span>
                </div>
              </div>

              <!-- Action Button -->
              <div class="action-buttons-wrap">
                <button class="retro-btn btn-primary-lg full-width" id="btn-next-event">
                  ${gameState.currentEventIndex >= 7 ? '🏆 View Season Finale & Tycoon Rating ➔' : `Continue to Event ${gameState.currentEventIndex + 2} ➔`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    attachEvents();
    drawProfitChart();
  }

  function drawProfitChart() {
    const canvas = container.querySelector('#profit-chart-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const history = gameState.eventHistory;
    if (history.length === 0) return;

    const w = canvas.width;
    const h = canvas.height;
    const padding = 35;

    // Background grid
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    for (let y = padding; y <= h - padding; y += 30) {
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(w - padding, y);
      ctx.stroke();
    }

    // Cumulative points
    let cumulative = 0;
    const points = [0];
    for (const item of history) {
      cumulative += item.statement.netProfit;
      points.push(cumulative);
    }

    const maxVal = Math.max(gameState.seasonProfitGoal, ...points, 100);
    const minVal = Math.min(0, ...points);
    const range = maxVal - minVal;

    function getY(val) {
      return (h - padding) - ((val - minVal) / range) * (h - padding * 2);
    }

    function getX(idx) {
      return padding + (idx / Math.max(1, points.length - 1)) * (w - padding * 2);
    }

    // Zero line
    const zeroY = getY(0);
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding, zeroY);
    ctx.lineTo(w - padding, zeroY);
    ctx.stroke();

    // Target goal line (dashed green)
    const goalY = getY(gameState.seasonProfitGoal);
    ctx.strokeStyle = '#10B981';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding, goalY);
    ctx.lineTo(w - padding, goalY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Cumulative Profit Line
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach((val, idx) => {
      const px = getX(idx);
      const py = getY(val);
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Draw point dots
    points.forEach((val, idx) => {
      const px = getX(idx);
      const py = getY(val);
      ctx.fillStyle = val >= 0 ? '#10B981' : '#EF4444';
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  function attachEvents() {
    container.querySelector('#btn-open-calc').addEventListener('click', () => {
      soundManager.playClick();
      calculatorModal.toggle();
    });

    // Math Challenge option clicks
    const optButtons = container.querySelectorAll('.btn-challenge-opt');
    optButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (mathChallengeAnswered) return;
        const optIdx = parseInt(btn.getAttribute('data-opt-idx'), 10);
        const opt = ledger.mathChallenge.options[optIdx];
        const resultMsg = container.querySelector('#challenge-result');

        mathChallengeAnswered = true;
        optButtons.forEach(b => b.setAttribute('disabled', 'true'));

        if (opt.isCorrect) {
          soundManager.playCelebration();
          gameState.awardMathBonus(ledger.mathChallenge.reward);
          btn.classList.add('btn-opt-correct');
          if (resultMsg) {
            resultMsg.classList.remove('hidden');
            resultMsg.className = 'challenge-result-msg msg-correct';
            resultMsg.innerHTML = `🎉 <strong>Correct!</strong> You earned a <strong>+${formatMoney(ledger.mathChallenge.reward)}</strong> cash bonus!`;
          }
        } else {
          soundManager.playWobbleLoss();
          btn.classList.add('btn-opt-incorrect');
          if (resultMsg) {
            resultMsg.classList.remove('hidden');
            resultMsg.className = 'challenge-result-msg msg-wrong';
            resultMsg.innerHTML = `Nice try! The correct answer was <strong>${ledger.mathChallenge.options.find(o => o.isCorrect).text}</strong>.`;
          }
        }
      });
    });

    // Next event button
    container.querySelector('#btn-next-event').addEventListener('click', () => {
      soundManager.playClick();
      onContinue();
    });
  }

  render();
}
