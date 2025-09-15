import { GAME_IDS, GameIdValue } from '../types/game.types';

/**
 * Simplified coin reward system - cleaner and more maintainable
 * Based on score ranges with fixed coin amounts per tier
 */

export interface ScoreRange {
  min: number;
  max: number;
  coins: number;
  gems: number;
  label: string;
}

export interface CoinReward {
  coins: number;
  gems: number;
  range: ScoreRange;
  percentage: number; // Percentage towards next tier
}

// Flappy Beasts score ranges for coin and gem rewards
const FLAPPY_BEASTS_RANGES: ScoreRange[] = [
  { min: 0, max: 50, coins: 10, gems: 0, label: "Beginner" },
  { min: 51, max: 150, coins: 25, gems: 0, label: "Rookie" },
  { min: 151, max: 300, coins: 50, gems: 0, label: "Flyer" },
  { min: 301, max: 500, coins: 100, gems: 0, label: "Ace Pilot" },
  { min: 501, max: Infinity, coins: 200, gems: 0, label: "Legend" }
];

// Platform Jump score ranges (for future implementation)
const PLATFORM_JUMP_RANGES: ScoreRange[] = [
  { min: 0, max: 250, coins: 15, gems: 0, label: "Beginner" },
  { min: 251, max: 500, coins: 35, gems: 0, label: "Jumper" },
  { min: 501, max: 1000, coins: 75, gems: 0, label: "Bouncer" },
  { min: 1001, max: 2000, coins: 150, gems: 0, label: "Sky Walker" },
  { min: 2001, max: Infinity, coins: 300, gems: 0, label: "Legend" }
];

// Registry of score ranges by game
const GAME_RANGES: Record<GameIdValue, ScoreRange[]> = {
  [GAME_IDS.FLAPPY_BEASTS]: FLAPPY_BEASTS_RANGES,
  [GAME_IDS.PLATFORM_JUMP]: PLATFORM_JUMP_RANGES
};

/**
 * Calculates coin and gem rewards based on score for a specific game
 * @param gameId - Game identifier
 * @param score - Final game score
 * @returns CoinReward object with coins, gems, range info, and progress
 */
export const calculateCoinReward = (gameId: GameIdValue, score: number): CoinReward => {
  const ranges = GAME_RANGES[gameId];
  
  if (!ranges) {
    console.warn(`No score ranges found for game ID: ${gameId}`);
    return { coins: 0, gems: 0, range: { min: 0, max: 0, coins: 0, gems: 0, label: "Unknown" }, percentage: 0 };
  }

  // Find the appropriate range for the score
  const range = ranges.find(range => 
    score >= range.min && score <= range.max
  ) || ranges[0]; // Fallback to first range

  // Calculate percentage towards next tier
  let percentage = 0;
  if (range.max !== Infinity) {
    const rangeSize = range.max - range.min + 1;
    const scoreInRange = score - range.min;
    percentage = Math.min(100, (scoreInRange / rangeSize) * 100);
  } else {
    // For the highest tier, show 100%
    percentage = 100;
  }

  return {
    coins: range.coins,
    gems: range.gems,
    range,
    percentage: Math.round(percentage)
  };
};

/**
 * Gets the next tier information
 * @param gameId - Game identifier
 * @param currentRange - Current score range
 * @returns Next range or null if at max tier
 */
export const getNextTier = (gameId: GameIdValue, currentRange: ScoreRange): ScoreRange | null => {
  const ranges = GAME_RANGES[gameId];
  if (!ranges) return null;

  const currentIndex = ranges.findIndex(range => range === currentRange);
  if (currentIndex === -1 || currentIndex === ranges.length - 1) {
    return null;
  }
  return ranges[currentIndex + 1];
};

/**
 * Hook for coin and gem reward calculation with additional utilities
 * @param gameId - Game identifier
 * @param score - Final game score
 * @returns Coin and gem reward data and utilities
 */
export const useCoinReward = (gameId: GameIdValue, score: number) => {
  const reward = calculateCoinReward(gameId, score);
  const nextTier = getNextTier(gameId, reward.range);
  
  // Calculate points needed for next tier
  const pointsToNextTier = nextTier ? nextTier.min - score : 0;
  
  return {
    ...reward,
    nextTier,
    pointsToNextTier: Math.max(0, pointsToNextTier),
    isMaxTier: nextTier === null
  };
};

/**
 * Get all score ranges for a specific game (useful for UI display)
 * @param gameId - Game identifier
 * @returns Array of score ranges for the game
 */
export const getGameScoreRanges = (gameId: GameIdValue): ScoreRange[] => {
  return GAME_RANGES[gameId] || [];
};

/**
 * Get reward preview for any score (useful for UI previews)
 * @param gameId - Game identifier
 * @param score - Score to preview
 * @returns Coins and gems amount for that score
 */
export const getRewardPreview = (gameId: GameIdValue, score: number): { coins: number; gems: number } => {
  const reward = calculateCoinReward(gameId, score);
  return { coins: reward.coins, gems: reward.gems };
};

// Export the simplified service
const CoinGemRewardService = {
  calculateCoinReward,
  getNextTier,
  useCoinReward,
  getGameScoreRanges,
  getRewardPreview
};

export default CoinGemRewardService;