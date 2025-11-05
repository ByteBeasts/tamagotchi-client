// src/utils/habitRewardCalculator.ts

/**
 * Reward tiers configuration based on habit difficulty
 * As specified in goal_tracker_product_spec.md line 131-152
 */

export type HabitDifficulty = 1 | 2 | 3; // Easy (1⭐), Medium (2⭐), Hard (3⭐)

export interface HabitReward {
  // Guaranteed rewards
  coins: number;

  // Probabilistic rewards
  gems: number; // 0 if not won
  foodId: number | null; // null if no food won

  // Metadata for logging
  gemChance: number; // Percentage that was rolled
  foodChance: number; // Percentage that was rolled
}

/**
 * Reward tier configuration
 */
const REWARD_TIERS = {
  1: { // Easy (1⭐)
    coins: 50,
    gemChance: 0.1, // 0.1% chance of 1 gem
    gemAmount: 1,
    foodChance: 5, // 5% chance of basic food
  },
  2: { // Medium (2⭐)
    coins: 100,
    gemChance: 5, // 5% chance of 1-2 gems
    gemAmountMin: 1,
    gemAmountMax: 2,
    foodChance: 10, // 10% chance of food
  },
  3: { // Hard (3⭐)
    coins: 150,
    gemChance: 10, // 10% chance of 2-3 gems
    gemAmountMin: 2,
    gemAmountMax: 3,
    foodChance: 15, // 15% chance of food
    magicFoodChance: 5, // 5% chance of magic food
  },
} as const;

/**
 * Food ID ranges
 */
const FOOD_IDS = {
  BASIC_MIN: 1,
  BASIC_MAX: 16,
  MAGIC_MIN: 17,
  MAGIC_MAX: 20,
} as const;

/**
 * Get a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Roll a percentage chance (0-100)
 * Returns true if the roll succeeds
 */
function rollChance(percentage: number): boolean {
  return Math.random() * 100 < percentage;
}

/**
 * Get a random basic food ID (1-16)
 */
function getRandomBasicFood(): number {
  return randomInt(FOOD_IDS.BASIC_MIN, FOOD_IDS.BASIC_MAX);
}

/**
 * Get a random magic food ID (17-20)
 */
function getRandomMagicFood(): number {
  return randomInt(FOOD_IDS.MAGIC_MIN, FOOD_IDS.MAGIC_MAX);
}

/**
 * Calculate rewards for completing a habit based on difficulty
 *
 * @param difficulty - Habit difficulty (1 = Easy, 2 = Medium, 3 = Hard)
 * @returns Reward object with coins, gems, and food
 *
 * @example
 * // Easy habit (1⭐)
 * const reward = calculateHabitReward(1);
 * // { coins: 50, gems: 0, foodId: null, gemChance: 0.1, foodChance: 5 }
 *
 * @example
 * // Hard habit (3⭐) - lucky roll
 * const reward = calculateHabitReward(3);
 * // { coins: 150, gems: 3, foodId: 18, gemChance: 10, foodChance: 15 }
 */
export function calculateHabitReward(difficulty: HabitDifficulty): HabitReward {
  const tier = REWARD_TIERS[difficulty];

  // Guaranteed coins
  const coins = tier.coins;

  // Roll for gems
  let gems = 0;
  const gemRoll = rollChance(tier.gemChance);
  if (gemRoll) {
    if (difficulty === 1) {
      const easyTier = REWARD_TIERS[1];
      gems = easyTier.gemAmount;
    } else if (difficulty === 2) {
      const mediumTier = REWARD_TIERS[2];
      gems = randomInt(mediumTier.gemAmountMin, mediumTier.gemAmountMax);
    } else {
      const hardTier = REWARD_TIERS[3];
      gems = randomInt(hardTier.gemAmountMin, hardTier.gemAmountMax);
    }
  }

  // Roll for food
  let foodId: number | null = null;

  if (difficulty === 3) {
    // Hard habits: 5% chance of magic food, then 15% chance of basic food
    const hardTier = REWARD_TIERS[3];
    const magicFoodRoll = rollChance(hardTier.magicFoodChance);
    if (magicFoodRoll) {
      foodId = getRandomMagicFood();
    } else {
      const basicFoodRoll = rollChance(tier.foodChance);
      if (basicFoodRoll) {
        foodId = getRandomBasicFood();
      }
    }
  } else {
    // Easy and Medium: just roll for basic food
    const foodRoll = rollChance(tier.foodChance);
    if (foodRoll) {
      foodId = getRandomBasicFood();
    }
  }

  return {
    coins,
    gems,
    foodId,
    gemChance: tier.gemChance,
    foodChance: tier.foodChance,
  };
}

/**
 * Get display text for reward
 * Useful for showing what the user won
 */
export function getRewardDisplayText(reward: HabitReward): string[] {
  const messages: string[] = [];

  messages.push(`+${reward.coins} coins`);

  if (reward.gems > 0) {
    messages.push(`+${reward.gems} gem${reward.gems > 1 ? 's' : ''} 💎`);
  }

  if (reward.foodId !== null) {
    const isMagicFood = reward.foodId >= FOOD_IDS.MAGIC_MIN;
    messages.push(`+1 ${isMagicFood ? 'magic' : ''} food 🍎`);
  }

  return messages;
}

/**
 * Get summary of possible rewards for a difficulty tier
 * Useful for showing users what they can earn
 */
export function getRewardTierSummary(difficulty: HabitDifficulty): string {
  const parts: string[] = [];

  if (difficulty === 1) {
    const tier = REWARD_TIERS[1];
    parts.push(`${tier.coins} coins guaranteed`);
    parts.push(`${tier.gemChance}% chance of ${tier.gemAmount} gem`);
    parts.push(`${tier.foodChance}% chance of food`);
  } else if (difficulty === 2) {
    const tier = REWARD_TIERS[2];
    parts.push(`${tier.coins} coins guaranteed`);
    parts.push(`${tier.gemChance}% chance of 1-2 gems`);
    parts.push(`${tier.foodChance}% chance of food`);
  } else {
    const tier = REWARD_TIERS[3];
    parts.push(`${tier.coins} coins guaranteed`);
    parts.push(`${tier.gemChance}% chance of 2-3 gems`);
    parts.push(`${tier.magicFoodChance}% chance of magic food`);
    parts.push(`${tier.foodChance}% chance of food`);
  }

  return parts.join(' • ');
}

/**
 * Check if food reward is magic food
 */
export function isMagicFood(foodId: number | null): boolean {
  if (foodId === null) return false;
  return foodId >= FOOD_IDS.MAGIC_MIN && foodId <= FOOD_IDS.MAGIC_MAX;
}

/**
 * Export constants for use in other modules
 */
export const REWARD_CONSTANTS = {
  FOOD_IDS,
  REWARD_TIERS,
} as const;
