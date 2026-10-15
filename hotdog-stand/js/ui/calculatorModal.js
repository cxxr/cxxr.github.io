/**
 * Student desk calculator modal with business math quick-helpers.
 */

import { soundManager } from '../audio/soundManager.js';
import { formatMoney } from '../utils/formatters.js';

class CalculatorModal {
  constructor() {
    this.displayValue = '0';
    this.memoryValue = null;
    this.pendingOp = null;
    this.clearOnNextDigit = false;
    this.isOpen = false;
  }

  render() {
    let modal = document.getElementById('calc-modal-container');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'calc-modal-container';
      modal.className = 'modal-overlay hidden';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="calc-window retro-window">
        <div class="retro-titlebar">
          <span class="retro-title-text">🧮 Student Business Calculator</span>
          <button class="retro-close-btn" id="calc-close-btn" aria-label="Close Calculator">✖</button>
        </div>
        <div class="calc-body">
          <div class="calc-display-screen" id="calc-screen">${this.displayValue}</div>

          <div class="calc-quick-formulas">
            <span class="formula-label">Business Formulas:</span>
            <div class="formula-buttons">
              <button class="calc-helper-btn" id="calc-formula-margin" title="Profit Margin Formula">Profit Margin %</button>
              <button class="calc-helper-btn" id="calc-formula-packs" title="Packs to Units Calculator">8-Pack Bun Matcher</button>
            </div>
            <div class="calc-formula-explanation hidden" id="calc-formula-box"></div>
          </div>

          <div class="calc-keypad">
            <button class="calc-btn op-clear" data-action="clear">C</button>
            <button class="calc-btn op-clear" data-action="backspace">⌫</button>
            <button class="calc-btn op" data-action="/">÷</button>
            <button class="calc-btn op" data-action="*">×</button>

            <button class="calc-btn num" data-val="7">7</button>
            <button class="calc-btn num" data-val="8">8</button>
            <button class="calc-btn num" data-val="9">9</button>
            <button class="calc-btn op" data-action="-">−</button>

            <button class="calc-btn num" data-val="4">4</button>
            <button class="calc-btn num" data-val="5">5</button>
            <button class="calc-btn num" data-val="6">6</button>
            <button class="calc-btn op" data-action="+">+</button>

            <button class="calc-btn num" data-val="1">1</button>
            <button class="calc-btn num" data-val="2">2</button>
            <button class="calc-btn num" data-val="3">3</button>
            <button class="calc-btn op-equals" data-action="=">=</button>

            <button class="calc-btn num zero-btn" data-val="0">0</button>
            <button class="calc-btn num" data-val=".">.</button>
          </div>
        </div>
      </div>
    `;

    this.attachEvents(modal);
  }

  attachEvents(modal) {
    modal.querySelector('#calc-close-btn').addEventListener('click', () => this.hide());

    // Keypad clicks
    modal.querySelectorAll('.calc-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        soundManager.playClick();
        const numVal = btn.getAttribute('data-val');
        const action = btn.getAttribute('data-action');

        if (numVal !== null) {
          this.inputDigit(numVal);
        } else if (action) {
          this.handleAction(action);
        }
        this.updateDisplay();
      });
    });

    // Formulas
    const formulaBox = modal.querySelector('#calc-formula-box');
    modal.querySelector('#calc-formula-margin').addEventListener('click', () => {
      soundManager.playPop();
      formulaBox.classList.remove('hidden');
      formulaBox.innerHTML = `
        <strong>Profit Margin Formula:</strong><br/>
        <code>((Price - Cost) ÷ Price) × 100</code><br/>
        <em>Example:</em> Selling hot dog for $2.50 that costs $0.75:<br/>
        ($2.50 - $0.75) ÷ $2.50 = 0.70 (70% margin!)
      `;
    });

    modal.querySelector('#calc-formula-packs').addEventListener('click', () => {
      soundManager.playPop();
      formulaBox.classList.remove('hidden');
      formulaBox.innerHTML = `
        <strong>Hot Dog & Bun Matcher:</strong><br/>
        Hot dogs come in 10s or 50s; buns come in 8s!<br/>
        <em>Formula:</em> Divide total dogs by 8, then round UP.<br/>
        <em>Example:</em> 50 hot dogs ÷ 8 = 6.25 -> You need <strong>7 packs</strong> (56 buns, 6 extra).
      `;
    });
  }

  inputDigit(digit) {
    if (this.clearOnNextDigit) {
      this.displayValue = digit === '.' ? '0.' : digit;
      this.clearOnNextDigit = false;
      return;
    }

    if (digit === '.') {
      if (!this.displayValue.includes('.')) {
        this.displayValue += '.';
      }
      return;
    }

    if (this.displayValue === '0') {
      this.displayValue = digit;
    } else if (this.displayValue.length < 12) {
      this.displayValue += digit;
    }
  }

  handleAction(action) {
    if (action === 'clear') {
      this.displayValue = '0';
      this.memoryValue = null;
      this.pendingOp = null;
      this.clearOnNextDigit = false;
    } else if (action === 'backspace') {
      if (this.displayValue.length > 1) {
        this.displayValue = this.displayValue.slice(0, -1);
      } else {
        this.displayValue = '0';
      }
    } else if (['+', '-', '*', '/'].includes(action)) {
      this.executePending();
      this.pendingOp = action;
      this.memoryValue = parseFloat(this.displayValue);
      this.clearOnNextDigit = true;
    } else if (action === '=') {
      this.executePending();
      this.pendingOp = null;
      this.clearOnNextDigit = true;
    }
  }

  executePending() {
    if (this.pendingOp && this.memoryValue !== null) {
      const current = parseFloat(this.displayValue);
      let res = current;
      if (this.pendingOp === '+') res = this.memoryValue + current;
      if (this.pendingOp === '-') res = this.memoryValue - current;
      if (this.pendingOp === '*') res = this.memoryValue * current;
      if (this.pendingOp === '/') res = current !== 0 ? this.memoryValue / current : 'Error';

      this.displayValue = typeof res === 'number' ? Math.round(res * 10000) / 10000 + '' : res;
      this.memoryValue = null;
    }
  }

  updateDisplay() {
    const screen = document.getElementById('calc-screen');
    if (screen) {
      screen.textContent = this.displayValue;
    }
  }

  show() {
    this.render();
    const modal = document.getElementById('calc-modal-container');
    if (modal) modal.classList.remove('hidden');
    this.isOpen = true;
  }

  hide() {
    const modal = document.getElementById('calc-modal-container');
    if (modal) modal.classList.add('hidden');
    this.isOpen = false;
  }

  toggle() {
    if (this.isOpen) this.hide();
    else this.show();
  }
}

export const calculatorModal = new CalculatorModal();
