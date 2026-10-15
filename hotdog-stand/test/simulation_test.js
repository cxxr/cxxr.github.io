import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateEvent, WEATHER_TYPES } from '../js/models/events.js';
import {
  createInitialInventory,
  purchaseSupplies,
  processSpoilage,
  ADVERTISING_CAMPAIGNS
} from '../js/models/inventory.js';
import {
  calculateElasticityFactor,
  calculateDemandForecast,
  canServeItem,
  consumeSuppliesForServing,
  simulateEvent
} from '../js/models/simulation.js';

describe('Hot Dog Stand: Simulation and Demand Math Tests', () => {

  it('calculates price elasticity correctly', () => {
    // At fair price, factor should be 1.0
    const normal = calculateElasticityFactor('BEEF_DOG', 2.75);
    assert.strictEqual(normal, 1.0);

    // Overpricing by 50% should penalize demand significantly
    const overpriced = calculateElasticityFactor('BEEF_DOG', 4.125);
    assert(overpriced < 0.35, `Expected factor < 0.35, got ${overpriced}`);

    // Discounting should give a modest boost
    const bargain = calculateElasticityFactor('BEEF_DOG', 2.00);
    assert(bargain > 1.0, `Expected factor > 1.0, got ${bargain}`);
  });

  it('adjusts demand according to weather', () => {
    const heatEvent = generateEvent(0, 'HEATWAVE');
    const chillyEvent = generateEvent(0, 'CHILLY_WIND');
    const ad = ADVERTISING_CAMPAIGNS[0];
    const prices = { BEEF_DOG: 2.75, COLD_DRINK: 1.50, WARM_DRINK: 1.75 };

    const heatForecast = calculateDemandForecast(heatEvent, ad, prices);
    const chillyForecast = calculateDemandForecast(chillyEvent, ad, prices);

    // Heatwave should drive cold drink demand way higher than chilly wind
    assert(
      heatForecast.forecast.COLD_DRINK.estimatedDemand > chillyForecast.forecast.COLD_DRINK.estimatedDemand,
      'Heatwave cold drink demand should exceed chilly cold drink demand'
    );

    // Chilly wind should drive warm drink demand higher than heatwave
    assert(
      chillyForecast.forecast.WARM_DRINK.estimatedDemand > heatForecast.forecast.WARM_DRINK.estimatedDemand,
      'Chilly warm drink demand should exceed heatwave warm drink demand'
    );
  });

  it('manages inventory purchasing and pack size math', () => {
    const inv = createInitialInventory();

    // Purchase 1 carton of beef franks (50 count)
    const beefResult = purchaseSupplies(inv, 'BEEF_FRANKS', 'beef_carton_50', 1);
    assert.strictEqual(beefResult.unitsAdded, 50);
    assert.strictEqual(beefResult.totalCost, 25.00);
    assert.strictEqual(beefResult.unitCost, 0.50);
    assert.strictEqual(inv.BEEF_FRANKS.quantity, 50);

    // Purchase 1 tray of buns (48 count)
    const bunResult = purchaseSupplies(inv, 'BUNS', 'buns_carton_48', 1);
    assert.strictEqual(bunResult.unitsAdded, 48);
    assert.strictEqual(bunResult.unitCost, 0.25);

    // Notice we have 50 franks and 48 buns -> can only serve 48 hot dogs before buns run out!
    assert.strictEqual(inv.BUNS.quantity, 48);
  });

  it('simulates stockouts when supplies are depleted', () => {
    const inv = createInitialInventory();
    // Buy 10 beef franks, but only 8 buns!
    purchaseSupplies(inv, 'BEEF_FRANKS', 'beef_pack_10', 1);
    purchaseSupplies(inv, 'BUNS', 'buns_pack_8', 1);
    purchaseSupplies(inv, 'CONDIMENTS', 'cond_jug_50', 1);

    // Can serve 8 dogs
    for (let i = 0; i < 8; i++) {
      const check = canServeItem(inv, 'BEEF_DOG');
      assert.strictEqual(check.canServe, true);
      consumeSuppliesForServing(inv, 'BEEF_DOG');
    }

    assert.strictEqual(inv.BUNS.quantity, 0);
    assert.strictEqual(inv.BEEF_FRANKS.quantity, 2);

    // 9th dog should fail because buns are missing!
    const check9 = canServeItem(inv, 'BEEF_DOG');
    assert.strictEqual(check9.canServe, false);
    assert.strictEqual(check9.missingSupply, 'BUNS');
  });

  it('processes perishable spoilage accurately', () => {
    const inv = createInitialInventory();
    purchaseSupplies(inv, 'BUNS', 'buns_pack_8', 2); // 16 buns
    purchaseSupplies(inv, 'COLD_SODA', 'soda_pack_12', 1); // 12 sodas

    assert.strictEqual(inv.BUNS.quantity, 16);
    assert.strictEqual(inv.COLD_SODA.quantity, 12);

    // Process end of 1st event
    const spoiled = processSpoilage(inv);
    // Buns have shelf life of 1 event, so unsold fresh buns spoil
    assert.strictEqual(spoiled.length, 1);
    assert.strictEqual(spoiled[0].supplyId, 'BUNS');
    assert.strictEqual(spoiled[0].unitsSpoiled, 16);
    assert.strictEqual(inv.BUNS.quantity, 0);

    // Canned sodas are shelf stable and should NOT spoil
    assert.strictEqual(inv.COLD_SODA.quantity, 12);
  });

  it('runs complete event simulation and generates report', () => {
    const event = generateEvent(0, 'SUNNY_WARM');
    const ad = ADVERTISING_CAMPAIGNS[1]; // Flyers
    const prices = {
      BEEF_DOG: 2.75,
      VEGGIE_DOG: 3.25,
      COLD_DRINK: 1.50,
      WARM_DRINK: 1.75,
      SNACK_CHIPS: 1.25
    };

    const inv = createInitialInventory();
    purchaseSupplies(inv, 'BEEF_FRANKS', 'beef_carton_50', 2); // 100
    purchaseSupplies(inv, 'BUNS', 'buns_bulk_96', 1); // 96
    purchaseSupplies(inv, 'BUNS', 'buns_pack_8', 1); // +8 = 104 buns
    purchaseSupplies(inv, 'CONDIMENTS', 'cond_jug_50', 2); // 100
    purchaseSupplies(inv, 'COLD_SODA', 'soda_case_24', 3); // 72

    const report = simulateEvent(event, ad, prices, inv);

    assert(report.totalRevenue > 0, 'Total revenue should be positive');
    assert(report.totalItemsSold > 0, 'Items should be sold');
    assert(report.periodLogs.length === 4, 'Should contain 4 periods');
    assert(report.customerSatisfaction >= 0 && report.customerSatisfaction <= 100, 'Satisfaction between 0 and 100');
  });
});
