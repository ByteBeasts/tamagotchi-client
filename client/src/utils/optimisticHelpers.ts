/**
 * Optimistic Update Helpers
 * Utilities for calculating optimistic state updates based on game mechanics
 */

import { BEAST_FAVORITE_FOODS } from '../constants/foodMarket.constants';

// Constants from Cairo contract
export const STATS_CONFIG = {
  MAX_STAT: 100,
  MIN_STAT: 0,
  UPDATE_POINTS: {
    XS: 2,  // Extra Small
    S: 4,   // Small
    M: 6,   // Medium
    L: 8,   // Large
    XL: 10  // Extra Large
  }
} as const;

// Stat array indices
export const STAT_INDICES = {
  PLAYER: 0,
  BEAST_ID: 1,
  IS_ALIVE: 2,
  IS_AWAKE: 3,
  HUNGER: 4,
  ENERGY: 5,
  HAPPINESS: 6,
  HYGIENE: 7,
  CLEAN_STATUS: 8,
  LAST_TIMESTAMP: 9
} as const;

// Beast types
export type BeastType = 1 | 2 | 3; // Light (1), Magic (2), Shadow (3)

/**
 * Calculate optimistic stats for feed action
 */
export function calculateOptimisticFeed(
  currentStats: number[],
  foodId: number,
  beastType: BeastType
): number[] {
  if (!currentStats || currentStats.length < 10) {
    console.warn('Invalid stats array for optimistic feed');
    return currentStats;
  }

  const newStats = [...currentStats];
  const isFavorite = BEAST_FAVORITE_FOODS[beastType]?.includes(foodId) || false;
  
  // Food stat increments based on contract logic
  const increments = isFavorite
    ? { hunger: 8, happiness: 4, energy: 2 }
    : { hunger: 4, happiness: 4, energy: 2 };
  
  // Apply increments with max validation
  newStats[STAT_INDICES.HUNGER] = Math.min(
    STATS_CONFIG.MAX_STAT,
    (newStats[STAT_INDICES.HUNGER] || 0) + increments.hunger
  );
  
  newStats[STAT_INDICES.HAPPINESS] = Math.min(
    STATS_CONFIG.MAX_STAT,
    (newStats[STAT_INDICES.HAPPINESS] || 0) + increments.happiness
  );
  
  newStats[STAT_INDICES.ENERGY] = Math.min(
    STATS_CONFIG.MAX_STAT,
    (newStats[STAT_INDICES.ENERGY] || 0) + increments.energy
  );
  
  return newStats;
}

/**
 * Calculate optimistic stats for clean action
 */
export function calculateOptimisticClean(currentStats: number[]): number[] {
  if (!currentStats || currentStats.length < 10) {
    console.warn('Invalid stats array for optimistic clean');
    return currentStats;
  }

  const newStats = [...currentStats];
  
  // Clean increments based on contract
  newStats[STAT_INDICES.HYGIENE] = Math.min(
    STATS_CONFIG.MAX_STAT,
    (newStats[STAT_INDICES.HYGIENE] || 0) + STATS_CONFIG.UPDATE_POINTS.XL
  );
  
  newStats[STAT_INDICES.HAPPINESS] = Math.min(
    STATS_CONFIG.MAX_STAT,
    (newStats[STAT_INDICES.HAPPINESS] || 0) + STATS_CONFIG.UPDATE_POINTS.XS
  );
  
  // Update clean status based on hygiene level
  newStats[STAT_INDICES.CLEAN_STATUS] = newStats[STAT_INDICES.HYGIENE] >= 80 ? 1 : 0;
  
  return newStats;
}

/**
 * Calculate optimistic stats for sleep/awake toggle
 */
export function calculateOptimisticSleepAwake(currentStats: number[]): number[] {
  if (!currentStats || currentStats.length < 10) {
    console.warn('Invalid stats array for optimistic sleep/awake');
    return currentStats;
  }

  const newStats = [...currentStats];
  
  // Toggle awake status (no stat changes, just state)
  newStats[STAT_INDICES.IS_AWAKE] = newStats[STAT_INDICES.IS_AWAKE] ? 0 : 1;
  
  return newStats;
}

/**
 * Calculate optimistic stats for play action
 */
export function calculateOptimisticPlay(currentStats: number[]): number[] {
  if (!currentStats || currentStats.length < 10) {
    console.warn('Invalid stats array for optimistic play');
    return currentStats;
  }

  const newStats = [...currentStats];
  
  // Play increments/decrements based on contract
  newStats[STAT_INDICES.HAPPINESS] = Math.min(
    STATS_CONFIG.MAX_STAT,
    (newStats[STAT_INDICES.HAPPINESS] || 0) + STATS_CONFIG.UPDATE_POINTS.XL
  );
  
  newStats[STAT_INDICES.ENERGY] = Math.max(
    STATS_CONFIG.MIN_STAT,
    (newStats[STAT_INDICES.ENERGY] || 0) - STATS_CONFIG.UPDATE_POINTS.L
  );
  
  newStats[STAT_INDICES.HUNGER] = Math.max(
    STATS_CONFIG.MIN_STAT,
    (newStats[STAT_INDICES.HUNGER] || 0) - STATS_CONFIG.UPDATE_POINTS.S
  );
  
  return newStats;
}

/**
 * Calculate optimistic stats for pet action
 */
export function calculateOptimisticPet(currentStats: number[]): number[] {
  if (!currentStats || currentStats.length < 10) {
    console.warn('Invalid stats array for optimistic pet');
    return currentStats;
  }

  const newStats = [...currentStats];
  
  // Pet increments based on contract
  newStats[STAT_INDICES.ENERGY] = Math.min(
    STATS_CONFIG.MAX_STAT,
    (newStats[STAT_INDICES.ENERGY] || 0) + STATS_CONFIG.UPDATE_POINTS.S
  );
  
  newStats[STAT_INDICES.HAPPINESS] = Math.min(
    STATS_CONFIG.MAX_STAT,
    (newStats[STAT_INDICES.HAPPINESS] || 0) + STATS_CONFIG.UPDATE_POINTS.S
  );
  
  return newStats;
}

/**
 * Validate if stats are within valid bounds
 */
export function validateStats(stats: number[]): boolean {
  if (!stats || stats.length < 10) return false;
  
  // Check all stat values are within bounds
  const statsToCheck = [
    STAT_INDICES.HUNGER,
    STAT_INDICES.ENERGY,
    STAT_INDICES.HAPPINESS,
    STAT_INDICES.HYGIENE
  ];
  
  for (const index of statsToCheck) {
    const value = stats[index];
    if (value < STATS_CONFIG.MIN_STAT || value > STATS_CONFIG.MAX_STAT) {
      return false;
    }
  }
  
  return true;
}

/**
 * Get current beast type from live beast data
 */
export function getBeastType(liveBeast: any): BeastType | null {
  if (!liveBeast?.beast?.beast_type) return null;
  
  const type = Number(liveBeast.beast.beast_type);
  if (type === 1 || type === 2 || type === 3) {
    return type as BeastType;
  }
  
  return null;
}

/**
 * Create a stats object from array for easier reading
 */
export function statsArrayToObject(stats: number[]) {
  if (!stats || stats.length < 10) return null;
  
  return {
    player: stats[STAT_INDICES.PLAYER],
    beastId: stats[STAT_INDICES.BEAST_ID],
    isAlive: Boolean(stats[STAT_INDICES.IS_ALIVE]),
    isAwake: Boolean(stats[STAT_INDICES.IS_AWAKE]),
    hunger: stats[STAT_INDICES.HUNGER],
    energy: stats[STAT_INDICES.ENERGY],
    happiness: stats[STAT_INDICES.HAPPINESS],
    hygiene: stats[STAT_INDICES.HYGIENE],
    cleanStatus: stats[STAT_INDICES.CLEAN_STATUS],
    lastTimestamp: stats[STAT_INDICES.LAST_TIMESTAMP]
  };
}

/**
 * Calculate optimistic food inventory update
 */
export function calculateOptimisticFoodInventory(
  currentFoods: any[],
  foodId: number,
  amount: number = -1
): any[] {
  return currentFoods.map(food => {
    if (Number(food.id) === foodId) {
      const newAmount = Math.max(0, Number(food.amount) + amount);
      return { ...food, amount: newAmount };
    }
    return food;
  });
}

/**
 * Check if beast is alive from stats
 */
export function isBeastAlive(stats: number[]): boolean {
  if (!stats || stats.length < 10) return false;
  return Boolean(stats[STAT_INDICES.IS_ALIVE]);
}

/**
 * Check if beast is awake from stats
 */
export function isBeastAwake(stats: number[]): boolean {
  if (!stats || stats.length < 10) return false;
  return Boolean(stats[STAT_INDICES.IS_AWAKE]);
}