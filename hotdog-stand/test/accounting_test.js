import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateEvent } from '../js/models/events.js';
import { ADVERTISING_CAMPAIGNS } from '../js/models/inventory.js';
import { generateEventLedger, generateMathChallenge } from '../js/models/accounting.js';

describe('Hot Dog Stand: Financial Accounting & Debrief Tests', () => {

  it('calculates the income statement correctly', () => {
    const event = generateEvent(0, 'SUNNY_WARM');
    event.permitFee = 20.00;

    const mockSimReport = {
      totalRevenue: 300.00,
      totalCOGS: 110.00,
      advertising: ADVERTISING_CAMPAIGNS[1], // Flyers ($25)
      totalItemsSold: 120,
      totalLostSales: 5,
      customerSatisfaction: 96,
      items: {
        BEEF_DOG: { name: 'Classic All-Beef Dog', itemRevenue: 200.00 }
      }
    };

    const spoiledItems = [
      { supplyId: 'BUNS', name: 'Bakery Fresh Buns', unitsSpoiled: 16, lossAmount: 4.80 }
    ];

    const startingCash = 250.00;
    const ledger = generateEventLedger(event, mockSimReport, spoiledItems, startingCash);

    // Gross profit = 300 - 110 = 190
    assert.strictEqual(ledger.statement.grossRevenue, 300.00);
    assert.strictEqual(ledger.statement.cogs, 110.00);
    assert.strictEqual(ledger.statement.grossProfit, 190.00);

    // Operating expenses = 25 (ad) + 20 (permit) = 45
    assert.strictEqual(ledger.statement.operatingExpenses.total, 45.00);

    // Spoilage = 4.80
    assert.strictEqual(ledger.statement.spoilageLoss, 4.80);

    // Net Profit = 190 - 45 - 4.80 = 140.20
    const expectedNet = 190.00 - 45.00 - 4.80;
    assert.strictEqual(Math.round(ledger.statement.netProfit * 100) / 100, Math.round(expectedNet * 100) / 100);

    // Frankie debrief tips should be generated
    assert(ledger.frankieDebrief.length > 0, 'Frankie debrief should contain advice');
  });

  it('generates valid math challenge with one correct answer', () => {
    const mockSim = {
      items: {
        BEEF_DOG: { name: 'Classic All-Beef Dog', itemRevenue: 150 }
      }
    };
    const challenge = generateMathChallenge({
      grossRevenue: 300,
      cogs: 120,
      netProfit: 130,
      simReport: mockSim
    });

    assert(challenge !== null, 'Math challenge should be generated');
    assert(challenge.options.length === 4, 'Should have 4 multiple-choice options');
    const correctOptions = challenge.options.filter(o => o.isCorrect);
    assert.strictEqual(correctOptions.length, 1, 'Should have exactly 1 correct option');
  });
});
