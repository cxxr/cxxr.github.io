/**
 * Inventory, supplies, packaging, and spoilage rules.
 */

export const SUPPLIES_CATALOG = {
  BEEF_FRANKS: {
    id: 'BEEF_FRANKS',
    name: 'All-Beef Franks',
    category: 'perishable',
    shelfLifeEvents: 2, // Lasts 2 events before spoiling
    icon: '🌭',
    description: 'Juicy 100% all-beef hot dogs. Refrigerated.',
    packs: [
      { id: 'beef_pack_10', size: 10, price: 6.00, label: 'Standard Pack (10 ct)' },
      { id: 'beef_carton_50', size: 50, price: 25.00, label: 'Carton (50 ct - 17% off)' },
      { id: 'beef_bulk_100', size: 100, price: 42.00, label: 'Wholesale Crate (100 ct - 30% off)' }
    ]
  },
  VEGGIE_FRANKS: {
    id: 'VEGGIE_FRANKS',
    name: 'Veggie Franks',
    category: 'perishable',
    shelfLifeEvents: 2,
    icon: '🌱',
    description: 'Tasty plant-based veggie franks for health-conscious fans.',
    packs: [
      { id: 'veggie_pack_8', size: 8, price: 5.60, label: 'Standard Pack (8 ct)' },
      { id: 'veggie_carton_40', size: 40, price: 24.00, label: 'Carton (40 ct - 14% off)' }
    ]
  },
  BUNS: {
    id: 'BUNS',
    name: 'Bakery Fresh Buns',
    category: 'highly_perishable',
    shelfLifeEvents: 1, // Fresh baked: unsold buns spoil at end of event!
    icon: '🥖',
    description: 'Soft bakery hot dog buns. Highly perishable—freshness expires fast!',
    packs: [
      { id: 'buns_pack_8', size: 8, price: 2.40, label: 'Standard Bag (8 ct)' },
      { id: 'buns_carton_48', size: 48, price: 12.00, label: 'Baker’s Tray (48 ct - 17% off)' },
      { id: 'buns_bulk_96', size: 96, price: 20.00, label: 'Wholesale Bin (96 ct - 31% off)' }
    ]
  },
  CONDIMENTS: {
    id: 'CONDIMENTS',
    name: 'Condiments & Napkins',
    category: 'shelf_stable',
    shelfLifeEvents: 999, // Does not spoil
    icon: '🥫',
    description: 'Ketchup, mustard, relish dispensers, plus napkins and boats. (1 unit = 50 servings)',
    packs: [
      { id: 'cond_jug_50', size: 50, price: 5.00, label: 'Dispenser Set (50 servings)' },
      { id: 'cond_bulk_200', size: 200, price: 16.00, label: 'Bulk Station (200 servings - 20% off)' }
    ]
  },
  COLD_SODA: {
    id: 'COLD_SODA',
    name: 'Chilled Sodas & Lemonade',
    category: 'shelf_stable',
    shelfLifeEvents: 999,
    icon: '🥤',
    description: 'Crisp canned sodas, lemonade, and bottled ice water. High demand on hot days.',
    packs: [
      { id: 'soda_pack_12', size: 12, price: 6.00, label: '12-Pack Cans' },
      { id: 'soda_case_24', size: 24, price: 10.80, label: 'Case of 24 (10% off)' },
      { id: 'soda_pallet_72', size: 72, price: 28.80, label: 'Pallet of 72 (20% off)' }
    ]
  },
  WARM_COCOA: {
    id: 'WARM_COCOA',
    name: 'Hot Cocoa & Cider',
    category: 'shelf_stable',
    shelfLifeEvents: 999,
    icon: '☕',
    description: 'Steaming cups of rich cocoa and spiced apple cider. Huge hit on chilly or wet days.',
    packs: [
      { id: 'cocoa_box_10', size: 10, price: 4.00, label: 'Box of 10 Cups' },
      { id: 'cocoa_urn_50', size: 50, price: 16.00, label: 'Thermal Urn (50 Cups - 20% off)' }
    ]
  },
  CHIPS: {
    id: 'CHIPS',
    name: 'Chips & Pretzels',
    category: 'shelf_stable',
    shelfLifeEvents: 999,
    icon: '🥨',
    description: 'Crunchy potato chips, pretzels, and roasted peanuts. Long shelf life.',
    packs: [
      { id: 'chips_box_12', size: 12, price: 6.00, label: 'Box of 12 Bags' },
      { id: 'chips_case_48', size: 48, price: 19.20, label: 'Case of 48 Bags (20% off)' }
    ]
  }
};

export const MENU_ITEMS = {
  BEEF_DOG: {
    id: 'BEEF_DOG',
    name: 'Classic All-Beef Dog',
    icon: '🌭',
    description: 'Fresh grilled all-beef frank on a soft bun with your choice of toppings.',
    defaultPrice: 2.75,
    minPrice: 1.00,
    maxPrice: 6.00,
    baseFairPrice: 2.75,
    requiredSupplies: [
      { supplyId: 'BEEF_FRANKS', count: 1 },
      { supplyId: 'BUNS', count: 1 },
      { supplyId: 'CONDIMENTS', count: 1 }
    ],
    popularityWeight: 0.38 // ~38% of attendees consider buying
  },
  VEGGIE_DOG: {
    id: 'VEGGIE_DOG',
    name: 'Veggie Dog',
    icon: '🌱',
    description: 'Delicious meat-free frank on a fresh bun with choice condiments.',
    defaultPrice: 3.25,
    minPrice: 1.50,
    maxPrice: 6.50,
    baseFairPrice: 3.25,
    requiredSupplies: [
      { supplyId: 'VEGGIE_FRANKS', count: 1 },
      { supplyId: 'BUNS', count: 1 },
      { supplyId: 'CONDIMENTS', count: 1 }
    ],
    popularityWeight: 0.12 // ~12% of attendees consider buying
  },
  COLD_DRINK: {
    id: 'COLD_DRINK',
    name: 'Ice-Cold Soda / Lemonade',
    icon: '🥤',
    description: 'Refreshing chilled soda, lemonade, or bottled water.',
    defaultPrice: 1.50,
    minPrice: 0.75,
    maxPrice: 4.00,
    baseFairPrice: 1.50,
    requiredSupplies: [
      { supplyId: 'COLD_SODA', count: 1 }
    ],
    popularityWeight: 0.42
  },
  WARM_DRINK: {
    id: 'WARM_DRINK',
    name: 'Hot Cocoa / Cider',
    icon: '☕',
    description: 'Steaming hot cocoa with mini marshmallows or warm spiced cider.',
    defaultPrice: 1.75,
    minPrice: 0.75,
    maxPrice: 4.00,
    baseFairPrice: 1.75,
    requiredSupplies: [
      { supplyId: 'WARM_COCOA', count: 1 }
    ],
    popularityWeight: 0.15
  },
  SNACK_CHIPS: {
    id: 'SNACK_CHIPS',
    name: 'Chips & Pretzels',
    icon: '🥨',
    description: 'Bag of crispy chips or salted pretzels.',
    defaultPrice: 1.25,
    minPrice: 0.50,
    maxPrice: 3.00,
    baseFairPrice: 1.25,
    requiredSupplies: [
      { supplyId: 'CHIPS', count: 1 }
    ],
    popularityWeight: 0.28
  }
};

/**
 * Advertising options available each event
 */
export const ADVERTISING_CAMPAIGNS = [
  {
    id: 'NONE',
    name: 'No Advertising (Word of Mouth)',
    icon: '🗣️',
    cost: 0.00,
    attendanceMultiplierLift: 0.00,
    description: 'Rely purely on walk-up foot traffic. Zero marketing expense.'
  },
  {
    id: 'FLYERS',
    name: 'Flyers & Posters Around Town',
    icon: '📄',
    cost: 25.00,
    attendanceMultiplierLift: 0.12, // +12% crowd draw
    description: 'Posters hung at local community centers, bulletin boards, and stadium gates.'
  },
  {
    id: 'NEWSPAPER',
    name: 'School / Local Gazette Ad',
    icon: '📰',
    cost: 60.00,
    attendanceMultiplierLift: 0.25, // +25% crowd draw
    description: 'Featured quarter-page advertisement in the local event program and community newspaper.'
  },
  {
    id: 'MASCOT',
    name: 'Roving Mascot & Sign Spinner',
    icon: '🌭',
    cost: 110.00,
    attendanceMultiplierLift: 0.40, // +40% crowd draw
    description: 'Hire an energetic helper dressed as Frankie the Hot Dog to dance with a giant sign!'
  },
  {
    id: 'RADIO',
    name: 'Local Radio Broadcast Spot',
    icon: '📻',
    cost: 195.00,
    attendanceMultiplierLift: 0.65, // +65% crowd draw
    description: 'Catchy 30-second jingle broadcast on the local top-40 and sports radio stations.'
  }
];

/**
 * Creates empty starting inventory structure
 */
export function createInitialInventory() {
  const stock = {};
  for (const key of Object.keys(SUPPLIES_CATALOG)) {
    stock[key] = {
      quantity: 0,
      totalCostPaid: 0,
      batches: [] // Array of { quantity, unitCost, ageEvents }
    };
  }
  return stock;
}

/**
 * Adds purchased packs to inventory and returns order cost
 */
export function purchaseSupplies(inventory, supplyId, packId, packCount = 1) {
  const catalogEntry = SUPPLIES_CATALOG[supplyId];
  if (!catalogEntry) throw new Error(`Unknown supply ID: ${supplyId}`);
  const pack = catalogEntry.packs.find(p => p.id === packId);
  if (!pack) throw new Error(`Unknown pack ID: ${packId} for supply ${supplyId}`);

  const unitsAdded = pack.size * packCount;
  const totalCost = pack.price * packCount;
  const unitCost = totalCost / unitsAdded;

  if (!inventory[supplyId]) {
    inventory[supplyId] = { quantity: 0, totalCostPaid: 0, batches: [] };
  }

  inventory[supplyId].quantity += unitsAdded;
  inventory[supplyId].totalCostPaid += totalCost;
  inventory[supplyId].batches.push({
    quantity: unitsAdded,
    unitCost: unitCost,
    ageEvents: 0
  });

  return { unitsAdded, totalCost, unitCost };
}

/**
 * Evaluates inventory spoilage at the end of an event.
 * Increments age of existing batches; removes batches exceeding shelf life.
 * Returns array of spoiled batch records with financial loss values.
 */
export function processSpoilage(inventory) {
  const spoiledItems = [];

  for (const [supplyId, itemStock] of Object.entries(inventory)) {
    const catalogItem = SUPPLIES_CATALOG[supplyId];
    if (!catalogItem) continue;

    const remainingBatches = [];
    let spoiledUnits = 0;
    let spoiledCost = 0;

    for (const batch of itemStock.batches) {
      batch.ageEvents += 1;
      if (batch.ageEvents >= catalogItem.shelfLifeEvents && batch.quantity > 0) {
        spoiledUnits += batch.quantity;
        spoiledCost += batch.quantity * batch.unitCost;
      } else if (batch.quantity > 0) {
        remainingBatches.push(batch);
      }
    }

    itemStock.batches = remainingBatches;
    itemStock.quantity -= spoiledUnits;

    if (spoiledUnits > 0) {
      spoiledItems.push({
        supplyId,
        name: catalogItem.name,
        icon: catalogItem.icon,
        unitsSpoiled: spoiledUnits,
        lossAmount: spoiledCost
      });
    }
  }

  return spoiledItems;
}
