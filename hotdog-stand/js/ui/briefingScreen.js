/**
 * Briefing Screen & Frankie the Weather Wiener.
 * Introduces the event venue, crowd conditions, and weather forecast.
 */

import { gameState } from '../state.js';
import { formatMoney, formatNumber } from '../utils/formatters.js';
import { soundManager } from '../audio/soundManager.js';

export function renderFrankieSvg(weatherId) {
  const isRain = weatherId === 'RAIN_DRIZZLE' || weatherId === 'THUNDERSTORM';
  const isHot = weatherId === 'HEATWAVE' || weatherId === 'SUNNY_WARM';
  const isCold = weatherId === 'CHILLY_WIND';

  // Dynamic accessories based on weather
  let accessory = '';
  if (isRain) {
    // Yellow rain hat + umbrella
    accessory = `
      <!-- Rain Hat -->
      <path d="M 50 25 Q 70 8 90 25 Z" fill="#FACC15" stroke="#CA8A04" stroke-width="2"/>
      <ellipse cx="70" cy="25" rx="28" ry="6" fill="#FACC15" stroke="#CA8A04" stroke-width="2"/>
      <!-- Umbrella in hand -->
      <path d="M 100 45 Q 115 20 130 45 Z" fill="#3B82F6" stroke="#1D4ED8" stroke-width="2"/>
      <line x1="115" y1="45" x2="115" y2="85" stroke="#475569" stroke-width="3"/>
      <path d="M 115 85 Q 118 92 112 92" stroke="#475569" stroke-width="3" fill="none"/>
    `;
  } else if (isHot) {
    // Cool sunglasses
    accessory = `
      <!-- Sunglasses -->
      <rect x="52" y="38" width="16" height="12" rx="3" fill="#0F172A"/>
      <rect x="72" y="38" width="16" height="12" rx="3" fill="#0F172A"/>
      <line x1="68" y1="42" x2="72" y2="42" stroke="#0F172A" stroke-width="3"/>
      <line x1="45" y1="42" x2="52" y2="42" stroke="#0F172A" stroke-width="2"/>
      <line x1="88" y1="42" x2="95" y2="42" stroke="#0F172A" stroke-width="2"/>
      <!-- Shine on glasses -->
      <line x1="54" y1="40" x2="60" y2="46" stroke="#94A3B8" stroke-width="1.5"/>
      <line x1="74" y1="40" x2="80" y2="46" stroke="#94A3B8" stroke-width="1.5"/>
    `;
  } else if (isCold) {
    // Cozy winter scarf
    accessory = `
      <!-- Cozy knit scarf -->
      <path d="M 48 55 Q 70 65 92 55 Q 96 68 70 70 Q 44 68 48 55 Z" fill="#DC2626" stroke="#991B1B" stroke-width="2"/>
      <rect x="72" y="66" width="12" height="24" rx="2" fill="#DC2626" stroke="#991B1B" stroke-width="1.5"/>
      <line x1="72" y1="90" x2="84" y2="90" stroke="#FEF08A" stroke-width="2" stroke-dasharray="3,2"/>
    `;
  } else {
    // Classic Chef Hat
    accessory = `
      <!-- Chef Hat -->
      <path d="M 52 28 C 45 10 95 10 88 28 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
      <rect x="53" y="24" width="34" height="6" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1.5"/>
    `;
  }

  return `
    <svg class="frankie-svg" viewBox="0 0 140 140" width="130" height="130" aria-label="Frankie the Weather Wiener">
      <!-- Hot Dog Bun (Back) -->
      <path d="M 42 30 Q 30 75 42 120 Q 52 125 58 118 Q 48 75 58 32 Q 52 25 42 30 Z" fill="#EAB308" stroke="#CA8A04" stroke-width="2.5"/>
      
      <!-- Hot Dog Frank Body -->
      <rect x="52" y="22" width="36" height="98" rx="18" fill="#DC2626" stroke="#991B1B" stroke-width="2.5"/>

      <!-- Mustard Zig-Zag Squiggle -->
      <path d="M 70 34 Q 62 45 78 52 Q 62 62 78 72 Q 62 82 78 92 Q 65 102 70 110" 
            fill="none" stroke="#FBBF24" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Hot Dog Bun (Front) -->
      <path d="M 82 32 Q 72 75 82 118 Q 88 125 98 120 Q 110 75 98 30 Q 88 25 82 32 Z" fill="#FDE047" stroke="#CA8A04" stroke-width="2.5"/>

      <!-- Eyes & Smile (if not wearing sunglasses) -->
      ${!isHot ? `
        <ellipse cx="64" cy="42" rx="3.5" ry="4.5" fill="#1E293B"/>
        <ellipse cx="76" cy="42" rx="3.5" ry="4.5" fill="#1E293B"/>
        <circle cx="65" cy="40.5" r="1.2" fill="#FFFFFF"/>
        <circle cx="77" cy="40.5" r="1.2" fill="#FFFFFF"/>
        <!-- Friendly smile -->
        <path d="M 64 50 Q 70 56 76 50" fill="none" stroke="#1E293B" stroke-width="2" stroke-linecap="round"/>
      ` : ''}

      <!-- Cheerful rosy cheeks -->
      <circle cx="58" cy="48" r="3" fill="#F87171" opacity="0.6"/>
      <circle cx="82" cy="48" r="3" fill="#F87171" opacity="0.6"/>

      <!-- Cartoon Hands -->
      <!-- Left Hand waving -->
      <path d="M 52 65 Q 35 60 30 50 Q 32 45 38 48 Q 44 52 52 58" fill="#DC2626" stroke="#991B1B" stroke-width="2"/>
      <!-- Right Hand -->
      <path d="M 88 65 Q 102 70 110 78 Q 106 82 98 76 Q 92 72 88 60" fill="#DC2626" stroke="#991B1B" stroke-width="2"/>

      <!-- Accessories (Hat, Sunglasses, Scarf, or Rain Gear) -->
      ${accessory}

      <!-- Cute little shoes -->
      <ellipse cx="60" cy="124" rx="7" ry="4" fill="#1E293B"/>
      <ellipse cx="80" cy="124" rx="7" ry="4" fill="#1E293B"/>
    </svg>
  `;
}

export function renderBriefingScreen(container, onNext) {
  const event = gameState.currentEvent;
  const weather = event.weather;

  container.innerHTML = `
    <div class="briefing-screen retro-window">
      <div class="retro-titlebar">
        <span class="retro-title-text">🏟️ Event Briefing — Event ${event.eventNumber} of ${event.totalEvents}</span>
        <div class="titlebar-badges">
          <span class="badge badge-cash">Cash: ${formatMoney(gameState.cash)}</span>
        </div>
      </div>

      <div class="briefing-content">
        <!-- Event Header Banner -->
        <div class="event-banner">
          <div class="event-heading-group">
            <span class="event-tag">UPCOMING EVENT</span>
            <h1 class="event-title">${event.name}</h1>
            <p class="event-venue">📍 <strong>${event.venue}</strong></p>
          </div>
          <div class="event-stat-box">
            <div class="stat-pill">
              <span class="stat-label">Expected Crowd</span>
              <span class="stat-val">~${formatNumber(event.expectedAttendance)} fans</span>
            </div>
            <div class="stat-pill">
              <span class="stat-label">Stand Permit Fee</span>
              <span class="stat-val fee">${formatMoney(event.permitFee)}</span>
            </div>
          </div>
        </div>

        <!-- Frankie's Weather Wiener Forecast Card -->
        <div class="frankie-forecast-card">
          <div class="frankie-avatar-col">
            ${renderFrankieSvg(weather.id)}
            <span class="frankie-name-tag">Frankie the Wiener</span>
          </div>

          <div class="frankie-speech-col">
            <div class="speech-bubble">
              <div class="forecast-header">
                <span class="weather-icon-lg">${weather.icon}</span>
                <div class="weather-title-group">
                  <span class="forecast-temp">${weather.temperature}°F — ${weather.name}</span>
                  <span class="forecast-condition">${weather.description}</span>
                </div>
              </div>
              <div class="speech-body">
                <p class="frankie-quote">"${weather.frankieAdvice}"</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Venue Intel & Demographics -->
        <div class="intel-grid">
          <div class="intel-card">
            <h3>📋 Venue Notes & Consumer Intel</h3>
            <p>${event.specialNote}</p>
            <p class="flavor-text"><em>"${event.flavorText}"</em></p>
          </div>

          <div class="intel-card season-goal-card">
            <h3>🎯 Season Business Progress</h3>
            <div class="progress-stats">
              <div class="p-row">
                <span>Completed Events:</span>
                <strong>${gameState.currentEventIndex} of ${event.totalEvents}</strong>
              </div>
              <div class="p-row">
                <span>Cumulative Net Profit:</span>
                <strong class="${gameState.getCumulativeNetProfit() >= 0 ? 'text-green' : 'text-red'}">
                  ${formatMoney(gameState.getCumulativeNetProfit())}
                </strong>
              </div>
              <div class="p-row">
                <span>Season Profit Target:</span>
                <strong>${formatMoney(gameState.seasonProfitGoal)}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <div class="action-bar right-align">
          <button class="retro-btn btn-primary" id="btn-goto-supplies">
            Order Supplies & Manage Inventory ➔
          </button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#btn-goto-supplies').addEventListener('click', () => {
    soundManager.playClick();
    onNext();
  });
}
