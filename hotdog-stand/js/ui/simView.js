/**
 * Live 2D Animated "Game Day" Simulation Screen.
 * Renders animated hot dog cart, vendor, customers, thought bubbles,
 * weather particle effects, live inventory counters, and playback speed controls.
 */

import { gameState } from '../state.js';
import { simulateEvent, SIMULATION_PERIODS } from '../models/simulation.js';
import { processSpoilage } from '../models/inventory.js';
import { generateEventLedger } from '../models/accounting.js';
import { formatMoney, formatNumber } from '../utils/formatters.js';
import { soundManager } from '../audio/soundManager.js';

export function renderSimView(container, onComplete) {
  const event = gameState.currentEvent;
  const weather = event.weather;
  const advertising = gameState.selectedAdvertising;
  const prices = gameState.menuPrices;

  // Run the full deterministic simulation under the hood
  const startingCashBeforeEvent = gameState.cash;
  const startingInventorySnapshot = JSON.parse(JSON.stringify(gameState.inventory));
  const simReport = simulateEvent(event, advertising, prices, startingInventorySnapshot);

  // Spoilage calculation on the ending inventory
  const spoiledItems = processSpoilage(simReport.endingInventory);

  // Generate full accounting ledger
  const eventLedger = generateEventLedger(event, simReport, spoiledItems, startingCashBeforeEvent);

  let currentPeriodIdx = 0;
  let periodProgress = 0; // 0 to 1
  let speedMultiplier = 1;
  let isPaused = false;
  let animFrameId = null;

  // Live counters for display
  let liveRevenue = 0;
  let liveItemsSold = 0;
  let liveStockouts = 0;

  // Active customer sprites on canvas
  let customers = [];
  let speechBubbles = [];
  let weatherParticles = [];

  container.innerHTML = `
    <div class="sim-screen retro-window">
      <div class="retro-titlebar">
        <span class="retro-title-text">🏟️ Game Day Live Simulation — ${event.name}</span>
        <div class="titlebar-badges">
          <span class="badge badge-weather">${weather.icon} ${weather.name} (${weather.temperature}°F)</span>
          <span class="badge badge-crowd">Crowd: ~${formatNumber(simReport.totalAttendance)}</span>
        </div>
      </div>

      <div class="sim-layout">
        <!-- Live HUD Bar -->
        <div class="sim-hud">
          <div class="hud-stat">
            <span class="hud-lbl">Current Period:</span>
            <span class="hud-val highlight" id="hud-period-name">Pre-Game Warmup</span>
          </div>
          <div class="hud-stat">
            <span class="hud-lbl">Register Sales:</span>
            <span class="hud-val text-green" id="hud-revenue">$0.00</span>
          </div>
          <div class="hud-stat">
            <span class="hud-lbl">Items Sold:</span>
            <span class="hud-val" id="hud-sales">0</span>
          </div>
          <div class="hud-stat">
            <span class="hud-lbl">Hungry Stockouts:</span>
            <span class="hud-val text-red" id="hud-stockouts">0</span>
          </div>
          <div class="hud-stat">
            <span class="hud-lbl">Satisfaction:</span>
            <span class="hud-val" id="hud-satisfaction">100%</span>
          </div>
        </div>

        <!-- 2D Animated Canvas Viewport -->
        <div class="canvas-wrapper">
          <canvas id="sim-canvas" width="800" height="400"></canvas>
          <div class="live-ticker" id="live-ticker">Welcome to game day! Fans are entering the gates...</div>
        </div>

        <!-- Simulation Progress & Speed Control Toolbar -->
        <div class="sim-controls-bar">
          <div class="progress-bar-container">
            <div class="progress-bar-fill" id="sim-progress-fill" style="width: 0%"></div>
          </div>

          <div class="speed-buttons-group">
            <button class="retro-btn-sm speed-btn ${speedMultiplier === 1 ? 'active' : ''}" data-speed="1">1x Normal</button>
            <button class="retro-btn-sm speed-btn ${speedMultiplier === 2 ? 'active' : ''}" data-speed="2">2x Fast</button>
            <button class="retro-btn-sm speed-btn ${speedMultiplier === 4 ? 'active' : ''}" data-speed="4">4x Turbo</button>
            <button class="retro-btn-sm btn-pause" id="btn-pause-toggle">⏸ Pause</button>
            <button class="retro-btn btn-primary" id="btn-skip-sim">⚡ Skip to Ledger Results</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const canvas = container.querySelector('#sim-canvas');
  const ctx = canvas.getContext('2d');

  // Initialize weather particles (rain droplets or heat shimmer)
  const isRain = weather.id === 'RAIN_DRIZZLE' || weather.id === 'THUNDERSTORM';
  if (isRain) {
    for (let i = 0; i < 70; i++) {
      weatherParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        len: 10 + Math.random() * 15,
        speed: 8 + Math.random() * 6
      });
    }
  }

  function spawnCustomer() {
    const isEntering = Math.random() > 0.3;
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];
    customers.push({
      x: isEntering ? -30 : canvas.width + 30,
      y: 290 + (Math.random() * 40 - 20),
      targetX: 380 + (Math.random() * 80 - 40),
      speed: 1.5 + Math.random() * 1.5,
      state: 'approaching', // 'approaching', 'ordering', 'leaving'
      orderTimer: 0,
      color: colors[Math.floor(Math.random() * colors.length)],
      hasPurchased: false
    });
  }

  function addSpeechBubble(text, x, y, type = 'happy') {
    speechBubbles.push({
      text,
      x,
      y,
      alpha: 1.0,
      type
    });
  }

  // Animation Loop
  let lastTime = performance.now();

  function animate(now) {
    const deltaMs = now - lastTime;
    lastTime = now;

    if (!isPaused) {
      // Progress through periods
      const periodDurationMs = 7000 / speedMultiplier;
      periodProgress += deltaMs / periodDurationMs;

      // Random customer spawning
      if (Math.random() < 0.05 * speedMultiplier && customers.length < 12) {
        spawnCustomer();
      }

      // Interpolate live stats based on period progress
      const targetPeriodLog = simReport.periodLogs[currentPeriodIdx];
      const prevRev = currentPeriodIdx === 0 ? 0 : simReport.periodLogs[currentPeriodIdx - 1].revenue;
      const targetRev = targetPeriodLog ? targetPeriodLog.revenue : 0;

      // Update ticker message if there are events
      if (targetPeriodLog && targetPeriodLog.events.length > 0 && Math.random() < 0.02) {
        const ev = targetPeriodLog.events[Math.floor(Math.random() * targetPeriodLog.events.length)];
        const ticker = container.querySelector('#live-ticker');
        if (ticker) {
          ticker.textContent = ev.text;
          ticker.className = `live-ticker ticker-${ev.type}`;
        }
      }

      if (periodProgress >= 1.0) {
        periodProgress = 0;
        currentPeriodIdx += 1;

        if (currentPeriodIdx >= SIMULATION_PERIODS.length) {
          finishSimulation();
          return;
        }
      }

      updateLiveStats();
    }

    drawScene();
    animFrameId = requestAnimationFrame(animate);
  }

  function updateLiveStats() {
    const totalPeriods = SIMULATION_PERIODS.length;
    const overallFraction = (currentPeriodIdx + periodProgress) / totalPeriods;

    liveRevenue = simReport.totalRevenue * overallFraction;
    liveItemsSold = Math.round(simReport.totalItemsSold * overallFraction);
    liveStockouts = Math.round(simReport.totalLostSales * overallFraction);

    const hudPeriod = container.querySelector('#hud-period-name');
    const hudRev = container.querySelector('#hud-revenue');
    const hudSales = container.querySelector('#hud-sales');
    const hudStock = container.querySelector('#hud-stockouts');
    const hudSat = container.querySelector('#hud-satisfaction');
    const bar = container.querySelector('#sim-progress-fill');

    if (hudPeriod) hudPeriod.textContent = SIMULATION_PERIODS[currentPeriodIdx]?.name || 'Final Whistle!';
    if (hudRev) hudRev.textContent = formatMoney(liveRevenue);
    if (hudSales) hudSales.textContent = formatNumber(liveItemsSold);
    if (hudStock) hudStock.textContent = formatNumber(liveStockouts);
    if (hudSat) hudSat.textContent = `${simReport.customerSatisfaction}%`;
    if (bar) bar.style.width = `${Math.min(100, Math.round(overallFraction * 100))}%`;
  }

  function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Sky & Background
    if (weather.id === 'HEATWAVE' || weather.id === 'SUNNY_WARM') {
      const grad = ctx.createLinearGradient(0, 0, 0, 260);
      grad.addColorStop(0, '#60A5FA');
      grad.addColorStop(1, '#BFDBFE');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, 260);

      // Bright Sun
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(720, 60, 36, 0, Math.PI * 2);
      ctx.fill();
    } else if (isRain) {
      ctx.fillStyle = '#64748B';
      ctx.fillRect(0, 0, canvas.width, 260);
    } else {
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(0, 0, canvas.width, 260);
    }

    // 2. Distant Stadium / Trees
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(0, 260);
    ctx.lineTo(80, 210);
    ctx.lineTo(240, 210);
    ctx.lineTo(340, 260);
    ctx.lineTo(500, 220);
    ctx.lineTo(650, 220);
    ctx.lineTo(800, 260);
    ctx.fill();

    // 3. Ground / Plaza
    ctx.fillStyle = '#D97706';
    ctx.fillRect(0, 260, canvas.width, 140);
    // Pavement strip
    ctx.fillStyle = '#9CA3AF';
    ctx.fillRect(0, 270, canvas.width, 130);

    // 4. Hot Dog Stand Cart (Centered around x=420, y=240)
    drawHotDogStand(ctx, 420, 240);

    // 5. Draw Customers
    for (let i = customers.length - 1; i >= 0; i--) {
      const c = customers[i];

      if (c.state === 'approaching') {
        const dx = c.targetX - c.x;
        c.x += Math.sign(dx) * c.speed;
        if (Math.abs(dx) < 6) {
          c.state = 'ordering';
          c.orderTimer = 40;
        }
      } else if (c.state === 'ordering') {
        c.orderTimer -= speedMultiplier;
        if (c.orderTimer <= 0) {
          c.state = 'leaving';
          c.hasPurchased = simReport.totalItemsSold > liveItemsSold;
          if (c.hasPurchased) {
            soundManager.playCashRegister();
            addSpeechBubble('🌭 Yum!', c.x, c.y - 45, 'happy');
          } else if (simReport.totalLostSales > liveStockouts) {
            addSpeechBubble('Out of stock?! 😞', c.x, c.y - 45, 'alert');
          }
        }
      } else if (c.state === 'leaving') {
        c.x += c.speed * 1.5;
        if (c.x > canvas.width + 40 || c.x < -40) {
          customers.splice(i, 1);
          continue;
        }
      }

      drawCustomer(ctx, c);
    }

    // 6. Draw Speech Bubbles
    for (let i = speechBubbles.length - 1; i >= 0; i--) {
      const b = speechBubbles[i];
      b.y -= 0.6;
      b.alpha -= 0.015;

      if (b.alpha <= 0) {
        speechBubbles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, b.alpha);
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.roundRect(b.x - 45, b.y - 20, 90, 26, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = b.type === 'alert' ? '#DC2626' : '#1E293B';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.text, b.x, b.y - 3);
      ctx.restore();
    }

    // 7. Weather Particles (Rain)
    if (isRain) {
      ctx.strokeStyle = '#BAE6FD';
      ctx.lineWidth = 1.5;
      for (const p of weatherParticles) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 3, p.y + p.len);
        ctx.stroke();

        p.y += p.speed;
        p.x -= 1;
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      }
    }
  }

  function drawHotDogStand(c, x, y) {
    // Cart Base
    c.fillStyle = '#DC2626'; // Bright Red cart
    c.strokeStyle = '#991B1B';
    c.lineWidth = 3;
    c.fillRect(x - 90, y, 180, 80);
    c.strokeRect(x - 90, y, 180, 80);

    // Stainless steel counter top
    c.fillStyle = '#E2E8F0';
    c.fillRect(x - 95, y - 6, 190, 8);
    c.strokeRect(x - 95, y - 6, 190, 8);

    // Sizzling Grill
    c.fillStyle = '#1E293B';
    c.fillRect(x - 80, y - 18, 50, 12);
    // Miniature franks on grill
    c.fillStyle = '#B91C1C';
    c.fillRect(x - 76, y - 15, 12, 4);
    c.fillRect(x - 60, y - 15, 12, 4);
    c.fillRect(x - 44, y - 15, 12, 4);

    // Condiment Dispensers (Mustard yellow, Ketchup red)
    c.fillStyle = '#EAB308';
    c.fillRect(x + 10, y - 22, 10, 16);
    c.fillStyle = '#EF4444';
    c.fillRect(x + 26, y - 22, 10, 16);

    // Big Cart Wheel
    c.fillStyle = '#475569';
    c.beginPath();
    c.arc(x - 45, y + 80, 24, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#F8FAFC';
    c.beginPath();
    c.arc(x - 45, y + 80, 10, 0, Math.PI * 2);
    c.fill();

    // Red & White Striped Awning
    const stripes = 8;
    const stripeWidth = 190 / stripes;
    for (let i = 0; i < stripes; i++) {
      c.fillStyle = i % 2 === 0 ? '#EF4444' : '#FFFFFF';
      c.fillRect((x - 95) + i * stripeWidth, y - 80, stripeWidth, 26);
    }
    c.strokeStyle = '#991B1B';
    c.strokeRect(x - 95, y - 80, 190, 26);

    // Awning Support Poles
    c.fillStyle = '#64748B';
    c.fillRect(x - 90, y - 80, 5, 75);
    c.fillRect(x + 85, y - 80, 5, 75);

    // Cart Sign
    c.fillStyle = '#FEF08A';
    c.fillRect(x - 65, y + 20, 130, 34);
    c.strokeStyle = '#CA8A04';
    c.lineWidth = 2;
    c.strokeRect(x - 65, y + 20, 130, 34);
    c.fillStyle = '#991B1B';
    c.font = 'bold 13px sans-serif';
    c.textAlign = 'center';
    c.fillText('HOT DOGS & SODAS', x, y + 42);

    // The Vendor behind cart
    c.fillStyle = '#FDE047'; // Vendor shirt
    c.fillRect(x - 12, y - 40, 24, 34);
    c.fillStyle = '#FBBF24'; // Vendor face
    c.beginPath();
    c.arc(x, y - 48, 12, 0, Math.PI * 2);
    c.fill();
    // Chef Hat on Vendor
    c.fillStyle = '#FFFFFF';
    c.fillRect(x - 10, y - 66, 20, 10);
    c.beginPath();
    c.arc(x, y - 68, 12, 0, Math.PI * 2);
    c.fill();
  }

  function drawCustomer(c, cust) {
    // Head
    c.fillStyle = '#FCD34D';
    c.beginPath();
    c.arc(cust.x, cust.y - 30, 9, 0, Math.PI * 2);
    c.fill();

    // Torso / Shirt
    c.fillStyle = cust.color;
    c.fillRect(cust.x - 7, cust.y - 21, 14, 20);

    // Legs / Pants
    c.fillStyle = '#1E293B';
    c.fillRect(cust.x - 6, cust.y - 1, 5, 14);
    c.fillRect(cust.x + 1, cust.y - 1, 5, 14);

    // If holding food
    if (cust.hasPurchased) {
      c.fillStyle = '#DC2626';
      c.fillRect(cust.x + 8, cust.y - 15, 8, 4);
      c.fillStyle = '#FDE047';
      c.fillRect(cust.x + 7, cust.y - 13, 10, 3);
    }
  }

  function finishSimulation() {
    if (animFrameId) cancelAnimationFrame(animFrameId);

    // Record results into gameState
    gameState.inventory = eventLedger.endingCash >= 0 ? simReport.endingInventory : gameState.inventory;
    gameState.recordEventResult(eventLedger);

    soundManager.playCelebration();
    onComplete(eventLedger);
  }

  // Attach controls
  container.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      soundManager.playClick();
      speedMultiplier = parseInt(btn.getAttribute('data-speed'), 10);
      container.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  const pauseBtn = container.querySelector('#btn-pause-toggle');
  pauseBtn.addEventListener('click', () => {
    soundManager.playClick();
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '▶ Resume' : '⏸ Pause';
  });

  container.querySelector('#btn-skip-sim').addEventListener('click', () => {
    soundManager.playCashRegister();
    finishSimulation();
  });

  // Start animation loop
  animFrameId = requestAnimationFrame(animate);
}
