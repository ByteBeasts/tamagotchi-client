// constants/foodMarket.constants.ts

// Import existing food assets from feed constants - NO DUPLICATES!
import { FOOD_ASSETS } from './feed.constants';

/**
 * Food categories for marketplace organization
 */
export type FoodCategory = 'fruits' | 'vegetables' | 'meats' | 'sweets' | 'fast_food';

/**
 * Beast types for food preferences
 */
export type BeastType = 1 | 2 | 3; // Light (1), Magic (2), Shadow (3)

/**
 * Food stat increments based on whether it's favorite or not
 */
export interface FoodStatIncrements {
  hunger: number;
  happiness: number;
  energy: number;
}

/**
 * Market food item interface - extends base with market-specific data
 */
export interface MarketFoodItem {
  id: number;
  name: string;
  description: string;
  image: string;
  category: FoodCategory;
  price: number;
  healthiness: number; // 1-5 scale (1 = unhealthy/cheap, 5 = healthy/expensive)
  hungerRestore: number;
  owned: boolean; // Whether player has this food in inventory
  ownedAmount?: number; // How many player currently has
  statIncrements?: Record<BeastType, FoodStatIncrements>; // Stat increments per beast type
}

/**
 * Favorite foods mapping per beast type
 * Light Beast (1): Cherry (3), Fish (10), Corn (15)
 * Magic Beast (2): Chicken (8), Apple (1), Cheese (7)  
 * Shadow Beast (3): Beef (13), Blueberry (12), Potato (16)
 */
export const BEAST_FAVORITE_FOODS: Record<BeastType, number[]> = {
  1: [3, 10, 15], // Light Beast favorites
  2: [8, 1, 7],   // Magic Beast favorites
  3: [13, 12, 16] // Shadow Beast favorites
};

/**
 * Default stat increments for foods
 */
export const DEFAULT_INCREMENTS = {
  FAVORITE: { hunger: 8, happiness: 4, energy: 2 },
  NORMAL: { hunger: 4, happiness: 4, energy: 2 }
};

/**
 * Helper to get stat increments for a food based on beast type
 */
export const getFoodStatIncrements = (foodId: number, beastType: BeastType): FoodStatIncrements => {
  const isFavorite = BEAST_FAVORITE_FOODS[beastType]?.includes(foodId) || false;
  return isFavorite ? DEFAULT_INCREMENTS.FAVORITE : DEFAULT_INCREMENTS.NORMAL;
};

/**
 * Food market data - categorized and priced by healthiness
 * Pricing logic: Less healthy = cheaper, More healthy = expensive
 * Now includes stat increments per beast type
 */
export const FOOD_MARKET_DATA: Record<number, Omit<MarketFoodItem, 'owned' | 'ownedAmount'>> = {
  // 🍎 FRUITS (Healthy = More Expensive)
  1: {
    id: 1,
    name: 'Apple',
    description: 'Fresh and crunchy, packed with vitamins and fiber',
    image: FOOD_ASSETS[1].img,
    category: 'fruits',
    healthiness: 5,
    hungerRestore: 25,
    price: 50, // Most expensive fruit
    statIncrements: {
      1: { hunger: 4, happiness: 4, energy: 2 }, // Normal for Light Beast
      2: { hunger: 8, happiness: 4, energy: 2 }, // FAVORITE for Magic Beast
      3: { hunger: 4, happiness: 4, energy: 2 }, // Normal for Shadow Beast
    },
  },
  2: {
    id: 2,
    name: 'Banana',
    description: 'Rich in potassium and natural sugars for quick energy',
    image: FOOD_ASSETS[2].img,
    category: 'fruits',
    healthiness: 4,
    hungerRestore: 20,
    price: 40,
    statIncrements: {
      1: { hunger: 4, happiness: 4, energy: 2 }, // Normal for all beasts
      2: { hunger: 4, happiness: 4, energy: 2 },
      3: { hunger: 4, happiness: 4, energy: 2 },
    },
  },
  3: {
    id: 3,
    name: 'Cherry',
    description: 'Sweet and juicy, full of antioxidants',
    image: FOOD_ASSETS[3].img,
    category: 'fruits',
    healthiness: 4,
    hungerRestore: 15,
    price: 45,
    statIncrements: {
      1: { hunger: 8, happiness: 4, energy: 2 }, // FAVORITE for Light Beast
      2: { hunger: 4, happiness: 4, energy: 2 }, // Normal for Magic Beast
      3: { hunger: 4, happiness: 4, energy: 2 }, // Normal for Shadow Beast
    },
  },
  12: {
    id: 12,
    name: 'Blueberry',
    description: 'Superfruit packed with antioxidants and vitamins',
    image: FOOD_ASSETS[12].img,
    category: 'fruits',
    healthiness: 5,
    hungerRestore: 20,
    price: 55, // Most expensive overall
    statIncrements: {
      1: { hunger: 4, happiness: 4, energy: 2 }, // Normal for Light Beast
      2: { hunger: 4, happiness: 4, energy: 2 }, // Normal for Magic Beast
      3: { hunger: 8, happiness: 4, energy: 2 }, // FAVORITE for Shadow Beast
    },
  },

  // 🥬 VEGETABLES (Healthy = More Expensive)
  15: {
    id: 15,
    name: 'Corn',
    description: 'Sweet corn kernels, good source of fiber',
    image: FOOD_ASSETS[15].img,
    category: 'vegetables',
    healthiness: 4,
    hungerRestore: 30,
    price: 35,
    statIncrements: {
      1: { hunger: 8, happiness: 4, energy: 2 }, // FAVORITE for Light Beast
      2: { hunger: 4, happiness: 4, energy: 2 }, // Normal for Magic Beast
      3: { hunger: 4, happiness: 4, energy: 2 }, // Normal for Shadow Beast
    },
  },
  16: {
    id: 16,
    name: 'Potato',
    description: 'Hearty and filling, rich in potassium',
    image: FOOD_ASSETS[16].img,
    category: 'vegetables',
    healthiness: 3,
    hungerRestore: 35,
    price: 25,
    statIncrements: {
      1: { hunger: 4, happiness: 4, energy: 2 }, // Normal for Light Beast
      2: { hunger: 4, happiness: 4, energy: 2 }, // Normal for Magic Beast
      3: { hunger: 8, happiness: 4, energy: 2 }, // FAVORITE for Shadow Beast
    },
  },

  // 🥩 MEATS (Medium Health = Medium Price)
  8: {
    id: 8,
    name: 'Chicken',
    description: 'Lean protein, excellent for muscle development',
    image: FOOD_ASSETS[8].img,
    category: 'meats',
    healthiness: 4,
    hungerRestore: 45,
    price: 60,
    statIncrements: {
      1: { hunger: 4, happiness: 4, energy: 2 }, // Normal for Light Beast
      2: { hunger: 8, happiness: 4, energy: 2 }, // FAVORITE for Magic Beast
      3: { hunger: 4, happiness: 4, energy: 2 }, // Normal for Shadow Beast
    },
  },
  10: {
    id: 10,
    name: 'Fish',
    description: 'Fresh catch, rich in omega-3 fatty acids',
    image: FOOD_ASSETS[10].img,
    category: 'meats',
    healthiness: 5,
    hungerRestore: 40,
    price: 70, // Most expensive meat
    statIncrements: {
      1: { hunger: 8, happiness: 4, energy: 2 }, // FAVORITE for Light Beast
      2: { hunger: 4, happiness: 4, energy: 2 }, // Normal for Magic Beast
      3: { hunger: 4, happiness: 4, energy: 2 }, // Normal for Shadow Beast
    },
  },
  13: {
    id: 13,
    name: 'Beef',
    description: 'Premium red meat, high in protein and iron',
    image: FOOD_ASSETS[13].img,
    category: 'meats',
    healthiness: 3,
    hungerRestore: 50,
    price: 45,
    statIncrements: {
      1: { hunger: 4, happiness: 4, energy: 2 }, // Normal for Light Beast
      2: { hunger: 4, happiness: 4, energy: 2 }, // Normal for Magic Beast
      3: { hunger: 8, happiness: 4, energy: 2 }, // FAVORITE for Shadow Beast
    },
  },
  9: {
    id: 9,
    name: 'Eggs',
    description: 'Farm fresh eggs, complete protein source',
    image: FOOD_ASSETS[9].img,
    category: 'meats',
    healthiness: 4,
    hungerRestore: 30,
    price: 30,
    statIncrements: {
      1: { hunger: 4, happiness: 4, energy: 2 }, // Normal for all beasts
      2: { hunger: 4, happiness: 4, energy: 2 },
      3: { hunger: 4, happiness: 4, energy: 2 },
    },
  },
  7: {
    id: 7,
    name: 'Cheese',
    description: 'Creamy cheese, good source of calcium',
    image: FOOD_ASSETS[7].img,
    category: 'meats', // Dairy fits here for simplicity
    healthiness: 3,
    hungerRestore: 25,
    price: 35,
    statIncrements: {
      1: { hunger: 4, happiness: 4, energy: 2 }, // Normal for Light Beast
      2: { hunger: 8, happiness: 4, energy: 2 }, // FAVORITE for Magic Beast
      3: { hunger: 4, happiness: 4, energy: 2 }, // Normal for Shadow Beast
    },
  },

  // 🍰 SWEETS (Unhealthy = Cheaper)
  5: {
    id: 5,
    name: 'Chocolate Cake',
    description: 'Decadent chocolate treat, pure indulgence',
    image: FOOD_ASSETS[5].img,
    category: 'sweets',
    healthiness: 1,
    hungerRestore: 35,
    price: 15, // Cheapest sweet
    statIncrements: {
      1: { hunger: 4, happiness: 4, energy: 2 }, // Normal for all beasts
      2: { hunger: 4, happiness: 4, energy: 2 },
      3: { hunger: 4, happiness: 4, energy: 2 },
    },
  },
  6: {
    id: 6,
    name: 'Strawberry Cake',
    description: 'Sweet and fluffy, with strawberry flavor',
    image: FOOD_ASSETS[6].img,
    category: 'sweets',
    healthiness: 1,
    hungerRestore: 30,
    price: 18,
    statIncrements: {
      1: { hunger: 4, happiness: 4, energy: 2 }, // Normal for all beasts
      2: { hunger: 4, happiness: 4, energy: 2 },
      3: { hunger: 4, happiness: 4, energy: 2 },
    },
  },

  // 🍟 FAST FOOD (Unhealthy = Cheapest)
  4: {
    id: 4,
    name: 'Burger',
    description: 'Juicy burger, quick and satisfying',
    image: FOOD_ASSETS[4].img,
    category: 'fast_food',
    healthiness: 1,
    hungerRestore: 40,
    price: 10, // Cheapest overall
    statIncrements: {
      1: { hunger: 4, happiness: 4, energy: 2 }, // Normal for all beasts
      2: { hunger: 4, happiness: 4, energy: 2 },
      3: { hunger: 4, happiness: 4, energy: 2 },
    },
  },
  11: {
    id: 11,
    name: 'French Fries',
    description: 'Crispy golden fries, addictive and tasty',
    image: FOOD_ASSETS[11].img,
    category: 'fast_food',
    healthiness: 1,
    hungerRestore: 25,
    price: 12,
    statIncrements: {
      1: { hunger: 4, happiness: 4, energy: 2 }, // Normal for all beasts
      2: { hunger: 4, happiness: 4, energy: 2 },
      3: { hunger: 4, happiness: 4, energy: 2 },
    },
  },
  14: {
    id: 14,
    name: 'Pizza',
    description: 'Cheesy pizza slice, comfort food at its best',
    image: FOOD_ASSETS[14].img,
    category: 'fast_food',
    healthiness: 2,
    hungerRestore: 45,
    price: 20,
    statIncrements: {
      1: { hunger: 4, happiness: 4, energy: 2 }, // Normal for all beasts
      2: { hunger: 4, happiness: 4, energy: 2 },
      3: { hunger: 4, happiness: 4, energy: 2 },
    },
  },
};

/**
 * Category display configuration
 */
export const FOOD_CATEGORIES_CONFIG = {
  fruits: {
    name: 'Fruits',
    emoji: '🍎',
    description: 'Fresh and healthy, packed with vitamins',
    color: 'rgb(16, 185, 129)', 
  },
  vegetables: {
    name: 'Vegetables',
    emoji: '🥬',
    description: 'Nutritious and wholesome',
    color: 'rgb(6, 182, 212)', 
  },
  meats: {
    name: 'Proteins',
    emoji: '🥩',
    description: 'High protein, builds strength',
    color: 'rgb(217, 70, 239)', 
  },
  sweets: {
    name: 'Sweets',
    emoji: '🍰',
    description: 'Indulgent treats for special occasions',
    color: 'rgb(251, 191, 36)', 
  },
  fast_food: {
    name: 'Fast Food',
    emoji: '🍟',
    description: 'Quick and convenient, but not so healthy',
    color: 'rgb(141, 141, 141)', 
  },
} as const;

/**
 * Helper function to get foods by category
 */
export const getFoodsByCategory = (category: FoodCategory): Array<Omit<MarketFoodItem, 'owned' | 'ownedAmount'>> => {
  return Object.values(FOOD_MARKET_DATA).filter(food => food.category === category);
};

/**
 * Helper function to get food market data by ID
 */
export const getFoodMarketDataById = (id: number): Omit<MarketFoodItem, 'owned' | 'ownedAmount'> | undefined => {
  return FOOD_MARKET_DATA[id];
};

/**
 * Get category order for display (healthiest first)
 */
export const CATEGORY_DISPLAY_ORDER: FoodCategory[] = [
  'fruits',
  'vegetables', 
  'meats',
  'sweets',
  'fast_food'
];

export default FOOD_MARKET_DATA;