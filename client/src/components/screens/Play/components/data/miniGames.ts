import { MiniGame, GameId } from "../../../../types/play.types";
import flappyGameIcon from "../../../../../assets/icons/games/flappy.webp";
import platformGameIcon from "../../../../../assets/icons/games/platform.webp";

// Import mini-game screen components
import FlappyBeastsScreen from "../minigames/flappybeast/FlappyBeastsScreen";
// import { PlatformJumpScreen } from "../../../Game/PlatformJumpScreen"; // Will implement later

/**
 * Registry of all available mini-games
 * Each game is a separate screen component
 */
export const MINI_GAMES: MiniGame[] = [
  {
    id: GameId.FLAPPY_BEASTS,
    title: "Flappy Beasts",
    description: "Guide your beast through obstacles by tapping to fly!",
    icon: flappyGameIcon,
    isActive: true,
    component: FlappyBeastsScreen, // ✅ ACTIVATED!
  },
  {
    id: GameId.PLATFORM_JUMP,
    title: "Platform Jump",
    description: "Jump as high as you can on moving platforms!",
    icon: platformGameIcon,
    isActive: false, // Disabled for now until implemented
    // component: PlatformJumpScreen, // Will implement later
  }
];

/**
 * Get games by availability
 */
export const getAvailableGames = (): MiniGame[] => {
  return MINI_GAMES.filter(game => game.isActive);
};

/**
 * Get a specific game by ID
 */
export const getGameById = (gameId: GameId): MiniGame | undefined => {
  return MINI_GAMES.find(game => game.id === gameId);
};

/**
 * Check if a game is available and active
 */
export const isGameAvailable = (gameId: GameId): boolean => {
  const game = getGameById(gameId);
  return !!(game && game.isActive);
};

/**
 * Get total number of available games
 */
export const getTotalAvailableGames = (): number => {
  return getAvailableGames().length;
};

/**
 * Check if a game has a component ready for rendering
 */
export const hasGameComponent = (gameId: GameId): boolean => {
  const game = getGameById(gameId);
  return !!(game && game.component);
};