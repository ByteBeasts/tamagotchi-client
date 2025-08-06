import { useCallback } from 'react';
import { useCavosTransaction } from './useCavosTransaction';
import toast from 'react-hot-toast';
import MixpanelService from '../../services/mixpanelService';

// Store imports
import useAppStore from '../../zustand/store';
import { getContractAddresses } from '../../config/cavosConfig';

// Types imports
import { FeedTransactionState } from '../../components/types/feed.types';

// Hook return interface
interface UseFeedBeastReturn {
  // State
  feedTransaction: FeedTransactionState;
  
  // Actions
  feedBeast: (foodId: number) => Promise<FeedActionResult>;
  resetTransaction: () => void;
  
  // Computed
  canFeed: boolean;
  isFeeding: boolean;
}

// Feed action result interface
interface FeedActionResult {
  success: boolean;
  foodId: number;
  transactionHash?: string;
  error?: string;
}

/**
 * Hook for managing feed beast transactions
 * Handles contract interactions, optimistic updates, and error recovery
 */
export const useFeedBeast = (): UseFeedBeastReturn => {
  const { executeTransaction } = useCavosTransaction();
  
  // Get Cavos auth state for validation
  const cavosAuth = useAppStore(state => state.cavos);
  
  // Store state and actions
  const feedTransaction = useAppStore(state => state.feedTransaction);
  const setFeedTransaction = useAppStore(state => state.setFeedTransaction);
  const resetFeedTransaction = useAppStore(state => state.resetFeedTransaction);
  // Note: No longer using optimistic updates - updateFoodAmount not needed
  const hasLiveBeast = useAppStore(state => state.hasLiveBeast);
  const player = useAppStore(state => state.player);

  // Execute feed beast transaction
  const feedBeast = useCallback(async (foodId: number): Promise<FeedActionResult> => {
    // Validation: Check if Cavos is authenticated
    if (!cavosAuth.isAuthenticated || !cavosAuth.wallet || !cavosAuth.accessToken) {
      const error = 'Please login with ByteBeasts to feed your beast.';
      toast.error('Please connect to play!');
      return { success: false, foodId, error };
    }

    // Validation: Check if player exists
    if (!player) {
      const error = 'No player data found';
      toast.error('Unable to find your game data!');
      return { success: false, foodId, error };
    }

    // Validation: Check if beast is live
    if (!hasLiveBeast()) {
      const error = 'No live beast found';
      toast.error('You need a beast to feed!');
      return { success: false, foodId, error };
    }

    // Validation: Check if already feeding
    if (feedTransaction.isFeeding) {
      const error = 'Feed transaction already in progress';
      toast.error('Your beast is still eating!');
      return { success: false, foodId, error };
    }

    try {
      // Start transaction - set loading state
      setFeedTransaction({
        isFeeding: true,
        feedingFoodId: foodId,
        transactionHash: null,
        error: null,
      });

      // Execute transaction using Cavos with dynamic contract address
      const contractAddresses = getContractAddresses();
      
      const calls = [{
        contractAddress: contractAddresses.game,
        entrypoint: 'feed',
        calldata: [foodId.toString()]
      }];
      
      const transactionHash = await executeTransaction(calls);
      
      // Create a compatible response object
      const tx = {
        transaction_hash: transactionHash,
        code: "SUCCESS"
      };
      
      // Check transaction result
      if (tx && tx.code === "SUCCESS") {
        // Track successful beast care action
        const liveBeast = useAppStore.getState().liveBeast;
        const player = useAppStore.getState().player;
        
        if (liveBeast.beast && liveBeast.status && player) {
          MixpanelService.trackBeastCare('Fed', {
            beast_id: liveBeast.beast.beast_id,
            species: liveBeast.beast.specie.toString(),
            hunger_level: liveBeast.status.hunger,
            happiness_level: liveBeast.status.happiness,
            energy_level: liveBeast.status.energy,
            hygiene_level: liveBeast.status.hygiene,
            user_streak: player.daily_streak,
            is_emergency: liveBeast.status.hunger < 20
          });
        }

        // Update transaction state with success
        setFeedTransaction({
          isFeeding: false,
          feedingFoodId: null,
          transactionHash: tx.transaction_hash,
          error: null,
        });

        return {
          success: true,
          foodId,
          transactionHash: tx.transaction_hash,
        };
        
      } else {
        throw new Error("Feed transaction failed with code: " + tx?.code);
      }

    } catch (error: any) {
      console.error('Feed transaction failed:', error);

      // Update transaction state with error (no optimistic update to revert)
      const errorMessage = error?.message || error?.toString() || 'Transaction failed';
      setFeedTransaction({
        isFeeding: false,
        feedingFoodId: null,
        transactionHash: null,
        error: errorMessage,
      });

      // Show error toast
      toast.error('Unable to feed your beast. Try again!', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#EF4444',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '16px',
        },
      });

      return {
        success: false,
        foodId,
        error: errorMessage,
      };
    }
  }, [
    cavosAuth.isAuthenticated,
    cavosAuth.wallet,
    cavosAuth.accessToken,
    player,
    hasLiveBeast,
    feedTransaction.isFeeding,
    setFeedTransaction,
    executeTransaction
  ]);

  // Reset transaction state
  const resetTransaction = useCallback(() => {
    resetFeedTransaction();
  }, [resetFeedTransaction]);

  // Computed values with proper boolean types
  const canFeed = Boolean(
    cavosAuth.isAuthenticated &&
    cavosAuth.wallet &&
    cavosAuth.accessToken &&
    player &&
    hasLiveBeast() &&
    !feedTransaction.isFeeding
  );
  
  const isFeeding = Boolean(feedTransaction.isFeeding);

  return {
    // State
    feedTransaction,
    
    // Actions
    feedBeast,
    resetTransaction,
    
    // Computed
    canFeed,
    isFeeding,
  };
};