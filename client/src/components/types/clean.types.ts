import type { Screen } from "../types/screens";

export interface CleanScreenProps {
  onNavigation: (screen: Screen) => void;
  playerAddress: string;
  rainDuration?: number;
  isBeastSleeping?: boolean;
}

export interface CloudControllerProps {
  isCloudOn: boolean;
  onCloudClick: () => void;
  cloudFrames: string[];
  isAnimating: boolean;
  currentFrameIndex: number;
  disabled?: boolean;
}

export interface BeastDisplayProps {
  beastImage: string;
  altText: string;
}

/**
 * Clean transaction state interface
 * Tracks the state of cleaning transactions
 */
export interface CleanTransactionState {
  isCleaningInProgress: boolean;
  transactionHash: string | null;
  error: string | null;
}

/**
 * Clean action result interface
 * Returned by the cleanBeast function
 */
export interface CleanActionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}