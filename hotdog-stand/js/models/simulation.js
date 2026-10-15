/**
 * Core mathematical simulation engine for game day execution.
 * Handles customer demand curves, price elasticity, weather multipliers,
 * inventory depletion, lost sales tracking, and satisfaction ratings.
 */

import { MENU_ITEMS } from './inventory.js';

export const SIMULATION_PERIODS = [
  { id: 'p1', name: 'Pre-Game Arrivals', weight: 0.20 },
  { id: 'p2', name: 'First Half / Opening Acts', weight: 0.25 },
  { id: 'p3', name: 'Halftime Rush (Peak Demand!)', weight: 0.35 },
  { id: 'p4', name: 'Final Stretch / Post-Game', weight: 0.20 }
];

/**
 * Calculates price elasticity multiplier for a menu item.
 * 1.0 means baseline demand at fair market price.
 * < 1.0 means customers are deterred by high prices.
 * > 1.0 means customers are attracted by bargain pricing.
 */
export function calculateElasticityFactor(itemKey, currentPrice) {
  const item = MENU_ITEMS[itemKey];
  if (!item) return 1.0;

  const fairPrice = item.baseFairPrice;
  const priceDiffRatio = (currentPrice - fairPrice) / fairPrice;

  if (priceDiffRatio <= 0) {
    // Discount bonus: max 25% bump if heavily discounted
    return 1.0 + Math.min(0.25, Math.abs(priceDiffRatio) * 0.5);
  } else {
    // Price hike penalty: demand drops aggressively
    // At 25% markup, factor ~0.65; at 50% markup, factor ~0.25; at 70%+ markup, drops to 0.
    const penalty = 1.0 - (priceDiffRatio * 1.6);
    return Math.max(0.05, penalty);
  }
}

/**
 * Calculates total expected customer demand for each menu item during the event.
 */
export function calculateDemandForecast(event, advertising, menuPrices) {
  const weather = event.weather;
  const adLift = advertising.attendanceMultiplierLift || 0;
  const effectiveAttendance = Math.round(event.expectedAttendance * (1 + adLift));

  const forecast = {};

  for (const [key, item] of Object.entries(MENU_ITEMS)) {
    const currentPrice = menuPrices[key] || item.defaultPrice;
    const elasticity = calculateElasticityFactor(key, currentPrice);

    // Weather impact by product category
    let weatherMult = 1.0;
    if (key === 'COLD_DRINK') weatherMult = weather.coldDrinkDemandMult;
    else if (key === 'WARM_DRINK') weatherMult = weather.warmDrinkDemandMult;
    else if (key === 'BEEF_DOG' || key === 'VEGGIE_DOG') weatherMult = weather.hotDogDemandMult;
    else if (key === 'SNACK_CHIPS') weatherMult = weather.snackDemandMult;

    // Total expected orders
    const rawDemand = effectiveAttendance * item.popularityWeight * weatherMult * elasticity;
    forecast[key] = {
      menuKey: key,
      name: item.name,
      icon: item.icon,
      price: currentPrice,
      fairPrice: item.baseFairPrice,
      elasticity,
      weatherMult,
      estimatedDemand: Math.round(rawDemand)
    };
  }

  return {
    effectiveAttendance,
    adLift,
    forecast
  };
}

/**
 * Checks if the required supplies exist in inventory to serve 1 unit of a menu item.
 */
export function canServeItem(inventory, itemKey) {
  const item = MENU_ITEMS[itemKey];
  if (!item) return { canServe: false, missingSupply: null };

  for (const req of item.requiredSupplies) {
    const currentStock = inventory[req.supplyId]?.quantity || 0;
    if (currentStock < req.count) {
      return { canServe: false, missingSupply: req.supplyId };
    }
  }
  return { canServe: true, missingSupply: null };
}

/**
 * Deducts the required supplies from inventory for 1 unit of a menu item.
 * Uses FIFO (First In, First Out) for batches to accurately calculate unit COGS.
 */
export function consumeSuppliesForServing(inventory, itemKey) {
  const item = MENU_ITEMS[itemKey];
  let servingCOGS = 0;

  for (const req of item.requiredSupplies) {
    const stock = inventory[req.supplyId];
    if (!stock) continue;

    let unitsNeeded = req.count;
    stock.quantity -= unitsNeeded;

    // Deduct from batches to track COGS
    while (unitsNeeded > 0 && stock.batches.length > 0) {
      const batch = stock.batches[0];
      if (batch.quantity <= unitsNeeded) {
        servingCOGS += batch.quantity * batch.unitCost;
        unitsNeeded -= batch.quantity;
        stock.batches.shift();
      } else {
        servingCOGS += unitsNeeded * batch.unitCost;
        batch.quantity -= unitsNeeded;
        unitsNeeded = 0;
      }
    }
  }

  return servingCOGS;
}

/**
 * Runs the complete event simulation across all periods.
 * Returns tick-by-tick simulation results, totals, and customer feedback.
 */
export function simulateEvent(event, advertising, menuPrices, startingInventory) {
  // Deep clone inventory so we don't mutate unexpectedly until confirmed
  const workingInventory = JSON.parse(JSON.stringify(startingInventory));

  const forecastData = calculateDemandForecast(event, advertising, menuPrices);
  const totalAttendance = forecastData.effectiveAttendance;

  const salesReport = {
    eventNumber: event.eventNumber,
    eventName: event.name,
    venue: event.venue,
    weather: event.weather,
    totalAttendance,
    advertising,
    items: {},
    lostSalesByReason: {},
    totalRevenue: 0,
    totalCOGS: 0,
    totalItemsSold: 0,
    totalCustomersServed: 0,
    totalLostSales: 0,
    periodLogs: [],
    customerComments: []
  };

  // Initialize item records
  for (const key of Object.keys(MENU_ITEMS)) {
    salesReport.items[key] = {
      menuKey: key,
      name: MENU_ITEMS[key].name,
      icon: MENU_ITEMS[key].icon,
      price: menuPrices[key] || MENU_ITEMS[key].defaultPrice,
      estimatedDemand: forecastData.forecast[key].estimatedDemand,
      unitsSold: 0,
      unitsLostStockout: 0,
      unitsLostTooExpensive: 0,
      itemRevenue: 0,
      itemCOGS: 0
    };
  }

  // Simulation execution across periods
  for (const period of SIMULATION_PERIODS) {
    const periodAttendance = Math.round(totalAttendance * period.weight);
    let periodRevenue = 0;
    let periodSalesCount = 0;
    let periodStockoutCount = 0;
    const periodEvents = [];

    for (const [key, item] of Object.entries(MENU_ITEMS)) {
      const itemForecast = forecastData.forecast[key];
      const periodPotentialDemand = Math.round(itemForecast.estimatedDemand * period.weight);
      const currentPrice = menuPrices[key] || item.defaultPrice;

      // Price tolerance check
      const isPriceGouging = currentPrice > item.baseFairPrice * 1.45;
      const isBargain = currentPrice < item.baseFairPrice * 0.85;

      for (let i = 0; i < periodPotentialDemand; i++) {
        const check = canServeItem(workingInventory, key);

        if (check.canServe) {
          const cogs = consumeSuppliesForServing(workingInventory, key);
          salesReport.items[key].unitsSold += 1;
          salesReport.items[key].itemRevenue += currentPrice;
          salesReport.items[key].itemCOGS += cogs;

          periodRevenue += currentPrice;
          periodSalesCount += 1;
          salesReport.totalRevenue += currentPrice;
          salesReport.totalCOGS += cogs;
          salesReport.totalItemsSold += 1;
        } else {
          // Stockout!
          salesReport.items[key].unitsLostStockout += 1;
          periodStockoutCount += 1;
          salesReport.totalLostSales += 1;

          const reasonKey = `Out of ${check.missingSupply}`;
          salesReport.lostSalesByReason[reasonKey] = (salesReport.lostSalesByReason[reasonKey] || 0) + 1;
        }
      }

      // Generate realistic kid-friendly customer feedback
      if (salesReport.items[key].unitsLostStockout > 0 && Math.random() < 0.4) {
        periodEvents.push({
          type: 'alert',
          text: `Sold out of ${item.name}! Fans walked away hungry.`
        });
      } else if (isPriceGouging && Math.random() < 0.3) {
        periodEvents.push({
          type: 'warning',
          text: `"$${currentPrice.toFixed(2)} for ${item.name}?! That's highway robbery!"`
        });
      } else if (isBargain && Math.random() < 0.3) {
        periodEvents.push({
          type: 'happy',
          text: `"Wow, $${currentPrice.toFixed(2)} for ${item.name} is a super deal!"`
        });
      }
    }

    salesReport.periodLogs.push({
      periodId: period.id,
      name: period.name,
      periodAttendance,
      revenue: periodRevenue,
      salesCount: periodSalesCount,
      stockouts: periodStockoutCount,
      events: periodEvents
    });
  }

  // Calculate customer satisfaction rating (0-100%)
  const totalPotentialOrders = salesReport.totalItemsSold + salesReport.totalLostSales;
  let satisfactionScore = 100;
  if (totalPotentialOrders > 0) {
    const fulfillmentRate = salesReport.totalItemsSold / totalPotentialOrders;
    satisfactionScore = Math.round(fulfillmentRate * 100);
  }
  salesReport.customerSatisfaction = satisfactionScore;

  // Add ending inventory to report
  salesReport.endingInventory = workingInventory;

  return salesReport;
}
