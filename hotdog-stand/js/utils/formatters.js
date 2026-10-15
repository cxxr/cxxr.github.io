/**
 * Utility functions for currency formatting, numbers, and math helpers.
 */

export function formatMoney(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$0.00';
  }
  const isNegative = amount < 0;
  const absVal = Math.abs(amount).toFixed(2);
  return isNegative ? `-$${absVal}` : `$${absVal}`;
}

export function formatPercent(ratio, decimals = 1) {
  if (isNaN(ratio) || ratio === null) return '0%';
  return `${(ratio * 100).toFixed(decimals)}%`;
}

export function formatNumber(num) {
  if (isNaN(num) || num === null) return '0';
  return Math.round(num).toLocaleString('en-US');
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Calculates profit margin: (price - cost) / price
 */
export function calculateProfitMargin(price, unitCost) {
  if (!price || price <= 0) return 0;
  return (price - unitCost) / price;
}

/**
 * Calculates how many packs of item A and item B are needed to cover target servings
 */
export function calculatePackRequirements(targetCount, packSize) {
  if (packSize <= 0 || targetCount <= 0) return { packs: 0, totalUnits: 0, leftover: 0 };
  const packs = Math.ceil(targetCount / packSize);
  const totalUnits = packs * packSize;
  const leftover = totalUnits - targetCount;
  return { packs, totalUnits, leftover };
}
