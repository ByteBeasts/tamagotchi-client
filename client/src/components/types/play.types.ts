import type { Screen } from "../types/screens";

// Enum for Game IDs - keeps consistency with backend
export enum GameId {
  FLAPPY_BEASTS = "flappy_beasts",
  PLATFORM_JUMP = "platform_jump"
}

// Interface for mini-games (all are fullscreen as separate screens)
export interface MiniGame {
  id: GameId;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  component?: React.ComponentType<MiniGameScreenProps>; // Optional until implemented
}

// Props that all mini-game screen components will receive
export interface MiniGameScreenProps {
  // Navigation - only for returning to play screen
  onExitGame: () => void; // Returns to PlayScreen
  gameId: GameId;
  
  // Beast data
  beastId: string | number;
  beastImage: string;
  beastDisplayName: string;
  
  // Player data
  playerAddress: string;
  
  // Dojo integration
  handleAction?: (actionName: string, actionFn: () => Promise<any>) => Promise<any>;
  client?: any;
  account?: any;
}

// Result returned when game completes
export interface GameResult {
  score: number;
  rewards: GameRewards;
  isNewHighScore: boolean;
  gameData?: any; // Additional game-specific data
}

// Rewards system with coins and gems
export interface GameRewards {
  coins: number;
  gems: number;
  range: ScoreRange;
  percentage: number; // Percentage towards next tier
}

// Score ranges with coins and gems
export interface ScoreRange {
  min: number;
  max: number;
  coins: number;
  gems: number;
  label: string;
}

// Dojo context passed to mini-games (simplified)
export interface DojoContext {
  client?: any;
  account?: any;
  handleAction?: (actionName: string, actionFn: () => Promise<any>) => Promise<any>;
}

// Game statistics for tracking
export interface GameStats {
  gamesPlayed: number;
  totalScore: number;
  highScore: number;
  averageScore: number;
  lastPlayed: number;
}

// Component Props for PlayScreen and related components
export interface PlayScreenProps {
  onNavigation: (screen: Screen, gameId?: GameId) => void;
  playerAddress: string;
  isBeastSleeping?: boolean;
}

export interface GameCarouselProps {
  games: MiniGame[];
  onGameSelect: (gameId: GameId) => void;
}

export interface BeastPlayDisplayProps {
  beastImage: string;
  altText: string;
}

// Game Over Modal Props (simple modal for returning to play screen)
export interface GameOverModalProps {
  isOpen: boolean;
  gameResult: GameResult;
  onPlayAgain: () => void;
  onExitGame: () => void; // Returns to PlayScreen
  gameName: string;
}

// Energy system for mini-games
export interface EnergyRequirement {
  minimumEnergy: number;
  energyCost: number;
  warningThreshold: number;
}