/**
 * Season Complete & Tycoon Hall of Fame Screen.
 */

import { gameState, DIFFICULTY_MODES } from '../state.js';
import { formatMoney, formatNumber } from '../utils/formatters.js';
import { soundManager } from '../audio/soundManager.js';
import { renderFrankieSvg } from './briefingScreen.js';

export function renderSeasonCompleteScreen(container, onRestart) {
  const totalProfit = gameState.getCumulativeNetProfit();
  const goal = gameState.seasonProfitGoal;
  const totalRevenue = gameState.getTotalRevenue();
  const totalServed = gameState.getTotalCustomersServed();
  const mathBonus = gameState.mathBonusEarned;

  // Evaluate ranking
  let rankTitle = '';
  let rankBadge = '';
  let rankDesc = '';

  if (totalProfit >= goal * 1.25) {
    rankTitle = 'Legendary Hot Dog Tycoon!';
    rankBadge = '👑 🏆';
    rankDesc = 'Incredible! You crushed your profit goals, handled weather curveballs like a Wall Street wizard, and built an empire!';
  } else if (totalProfit >= goal) {
    rankTitle = 'Master Stand Manager!';
    rankBadge = '🥇';
    rankDesc = 'Congratulations! You reached your season profit goal and ran a profitable, highly organized business!';
  } else if (totalProfit >= goal * 0.7) {
    rankTitle = 'Certified Stand Operator';
    rankBadge = '🥈';
    rankDesc = 'Solid work! You stayed in the black and earned honest profits. With a little tighter inventory control, you could be a tycoon!';
  } else {
    rankTitle = 'Rookie Apprentice Vendor';
    rankBadge = '🥉';
    rankDesc = 'You completed the season! Even the best entrepreneurs take lumps early on. Try again and watch out for bun spoilage!';
  }

  container.innerHTML = `
    <div class="season-complete-screen retro-window">
      <div class="retro-titlebar">
        <span class="retro-title-text">🏆 Season Finale — Tycoon Hall of Fame</span>
      </div>

      <div class="complete-content">
        <div class="rank-banner">
          <div class="frankie-celebrate">
            ${renderFrankieSvg('SUNNY_WARM')}
          </div>
          <div class="rank-details">
            <span class="rank-badge-lg">${rankBadge}</span>
            <h1 class="rank-title">${rankTitle}</h1>
            <p class="rank-desc">${rankDesc}</p>
          </div>
        </div>

        <div class="season-stats-grid">
          <div class="season-stat-card">
            <span class="lbl">Total Cumulative Profit</span>
            <span class="val text-green">${formatMoney(totalProfit)}</span>
            <span class="sub">Season Target: ${formatMoney(goal)}</span>
          </div>

          <div class="season-stat-card">
            <span class="lbl">Gross Sales Revenue</span>
            <span class="val">${formatMoney(totalRevenue)}</span>
            <span class="sub">Across 8 Major Events</span>
          </div>

          <div class="season-stat-card">
            <span class="lbl">Total Food & Drink Served</span>
            <span class="val">${formatNumber(totalServed)}</span>
            <span class="sub">Satisfied Fans</span>
          </div>

          <div class="season-stat-card">
            <span class="lbl">Math Challenge Bonuses</span>
            <span class="val text-blue">+${formatMoney(mathBonus)}</span>
            <span class="sub">Earned via Math Skills</span>
          </div>
        </div>

        <div class="event-history-table-box retro-box">
          <h3>📅 Complete 8-Event Season History</h3>
          <table class="ledger-table history-table">
            <thead>
              <tr>
                <th>Event #</th>
                <th>Event & Venue</th>
                <th>Weather</th>
                <th>Attendance</th>
                <th>Revenue</th>
                <th>Net Profit</th>
              </tr>
            </thead>
            <tbody>
              ${gameState.eventHistory.map(h => `
                <tr>
                  <td>#${h.eventNumber}</td>
                  <td><strong>${h.eventName}</strong><br/><small>${h.venue}</small></td>
                  <td>${h.performance ? formatNumber(h.performance.itemsSold) : ''} items</td>
                  <td>~${formatNumber(h.performance.itemsSold + h.performance.lostSales)}</td>
                  <td class="text-green">${formatMoney(h.statement.grossRevenue)}</td>
                  <td class="${h.statement.netProfit >= 0 ? 'text-green val-strong' : 'text-red val-strong'}">
                    ${formatMoney(h.statement.netProfit)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="restart-options-box">
          <h3>Ready for Your Next Business Adventure?</h3>
          <p>Choose a difficulty level and start a brand new campaign:</p>
          <div class="diff-buttons">
            <button class="retro-btn btn-secondary" data-diff="JUNIOR">Junior Vendor (Easy)</button>
            <button class="retro-btn btn-primary" data-diff="STANDARD">Stand Manager (Classic 90s)</button>
            <button class="retro-btn btn-danger" data-diff="TYCOON">Franchise Tycoon (Challenging)</button>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('.diff-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
      soundManager.playCashRegister();
      const diff = btn.getAttribute('data-diff');
      gameState.resetGame(diff);
      onRestart();
    });
  });
}
