/**
 * Financial accounting, income statements, balance sheets, and educational debrief.
 */

import { formatMoney, formatPercent } from '../utils/formatters.js';

/**
 * Compiles a full income statement and balance sheet for an event
 */
export function generateEventLedger(event, simReport, spoiledItems, cashBeforeEvent) {
  const grossRevenue = simReport.totalRevenue;
  const cogs = simReport.totalCOGS;
  const grossProfit = grossRevenue - cogs;

  const advertisingExpense = simReport.advertising.cost || 0;
  const permitFee = event.permitFee || 0;
  const totalOperatingExpenses = advertisingExpense + permitFee;

  let spoilageLoss = 0;
  for (const item of spoiledItems) {
    spoilageLoss += item.lossAmount;
  }

  const netProfit = grossProfit - totalOperatingExpenses - spoilageLoss;
  const endingCash = cashBeforeEvent + grossRevenue - advertisingExpense - permitFee;

  // Key performance ratios
  const grossMarginPercent = grossRevenue > 0 ? (grossProfit / grossRevenue) : 0;
  const netMarginPercent = grossRevenue > 0 ? (netProfit / grossRevenue) : 0;

  // Generate personalized business feedback from Frankie
  const frankieDebrief = generateFrankieDebrief({
    netProfit,
    spoilageLoss,
    totalLostSales: simReport.totalLostSales,
    advertisingExpense,
    advertisingLift: simReport.advertising.attendanceMultiplierLift || 0,
    grossRevenue,
    customerSatisfaction: simReport.customerSatisfaction
  });

  // Generate educational math challenge
  const mathChallenge = generateMathChallenge({
    grossRevenue,
    cogs,
    netProfit,
    simReport
  });

  return {
    eventNumber: event.eventNumber,
    eventName: event.name,
    venue: event.venue,
    statement: {
      grossRevenue,
      cogs,
      grossProfit,
      grossMarginPercent,
      operatingExpenses: {
        advertising: advertisingExpense,
        advertisingName: simReport.advertising.name,
        permitFee: permitFee,
        total: totalOperatingExpenses
      },
      spoilageLoss,
      spoiledItems,
      netProfit,
      netMarginPercent
    },
    cashBeforeEvent,
    endingCash,
    performance: {
      itemsSold: simReport.totalItemsSold,
      lostSales: simReport.totalLostSales,
      customerSatisfaction: simReport.customerSatisfaction
    },
    frankieDebrief,
    mathChallenge
  };
}

/**
 * Generates tailored pedagogical feedback from Frankie
 */
function generateFrankieDebrief({
  netProfit,
  spoilageLoss,
  totalLostSales,
  advertisingExpense,
  advertisingLift,
  grossRevenue,
  customerSatisfaction
}) {
  const tips = [];

  if (netProfit > 150) {
    tips.push("Hot dog heaven! You made a stellar net profit today! Your inventory and pricing strategy were dialed in.");
  } else if (netProfit > 0) {
    tips.push("Good honest day's work! You finished in the black with a positive profit. Let's see if we can optimize your margins next time!");
  } else {
    tips.push("Ouch! We took a net loss today. Don't worry—every great entrepreneur learns from red ink. Let's check where the money went.");
  }

  if (spoilageLoss > 20) {
    tips.push(`Watch out for spoilage! You lost ${formatMoney(spoilageLoss)} in unsold perishable goods (like fresh buns). Buy closer to expected attendance!`);
  }

  if (totalLostSales > 30) {
    tips.push(`You had ${totalLostSales} missed sales because you ran out of stock! Leaving hungry fans in line is leaving money on the table.`);
  }

  if (advertisingExpense > 50 && grossRevenue < advertisingExpense * 3) {
    tips.push("Your advertising expense was heavy compared to your return. Make sure the crowd size is large enough to justify premium ad spots!");
  }

  if (customerSatisfaction >= 90) {
    tips.push(`Outstanding customer satisfaction (${customerSatisfaction}%)! Happy customers build a legendary reputation.`);
  }

  return tips;
}

/**
 * Creates an interactive educational math challenge question
 */
export function generateMathChallenge({ grossRevenue, cogs, netProfit, simReport }) {
  const types = ['PROFIT_MARGIN', 'UNIT_FRACTION', 'REVENUE_SHARE'];
  const pickedType = types[Math.floor(Math.random() * types.length)];

  if (pickedType === 'PROFIT_MARGIN' && grossRevenue > 0) {
    const margin = (grossRevenue - cogs) / grossRevenue;
    const roundedPercent = Math.round(margin * 100);
    const wrong1 = Math.max(5, roundedPercent - 15);
    const wrong2 = roundedPercent + 15;
    const wrong3 = Math.round((cogs / grossRevenue) * 100);

    return {
      type: 'PROFIT_MARGIN',
      question: `Your stand had ${formatMoney(grossRevenue)} in sales and ${formatMoney(cogs)} in food costs (COGS). What was your Gross Profit Margin percentage?`,
      hint: "Formula: (Gross Revenue - Food Costs) ÷ Gross Revenue × 100",
      reward: 15.00,
      options: shuffle([
        { text: `${roundedPercent}%`, isCorrect: true },
        { text: `${wrong1}%`, isCorrect: false },
        { text: `${wrong2}%`, isCorrect: false },
        { text: `${wrong3}%`, isCorrect: false }
      ])
    };
  }

  // Fallback to revenue share
  const items = Object.values(simReport.items).filter(i => i.itemRevenue > 0);
  if (items.length > 0 && grossRevenue > 0) {
    const targetItem = items[0];
    const share = Math.round((targetItem.itemRevenue / grossRevenue) * 100);
    const wrong1 = Math.max(10, share - 20);
    const wrong2 = Math.min(90, share + 20);
    const wrong3 = Math.round(100 - share);

    return {
      type: 'REVENUE_SHARE',
      question: `Sales of ${targetItem.name} brought in ${formatMoney(targetItem.itemRevenue)} out of your total ${formatMoney(grossRevenue)} revenue. What percentage was that?`,
      hint: `Divide ${formatMoney(targetItem.itemRevenue)} by ${formatMoney(grossRevenue)} and multiply by 100.`,
      reward: 15.00,
      options: shuffle([
        { text: `${share}%`, isCorrect: true },
        { text: `${wrong1}%`, isCorrect: false },
        { text: `${wrong2}%`, isCorrect: false },
        { text: `${wrong3}%`, isCorrect: false }
      ])
    };
  }

  return null;
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
