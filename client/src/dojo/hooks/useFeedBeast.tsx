import { useCallback } from 'react';
import { useCavosAccount } from './useCavosAccount';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { useCavosTransaction } from './useCavosTransaction';
import toast from 'react-hot-toast';

// Store imports
import useAppStore from '../../zustand/store';

// Types imports
import { FeedTransactionState } from '../../components/types/feed.types';

// Hooks imports
import { useStarknetConnect } from './useStarknetConnect';

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
  const { client } = useDojoSDK();
  const { account } = useCavosAccount();
  const { status } = useStarknetConnect();
  const { executeTransaction } = useCavosTransaction();
  
  // Store state and actions
  const feedTransaction = useAppStore(state => state.feedTransaction);
  const setFeedTransaction = useAppStore(state => state.setFeedTransaction);
  const resetFeedTransaction = useAppStore(state => state.resetFeedTransaction);
  // Note: No longer using optimistic updates - updateFoodAmount not needed
  const hasLiveBeast = useAppStore(state => state.hasLiveBeast);
  const player = useAppStore(state => state.player);

  // Execute feed beast transaction
  const feedBeast = useCallback(async (foodId: number): Promise<FeedActionResult> => {
    // Validation: Check if wallet is connected
    if (status !== "connected") {
      const error = 'Wallet not connected. Please connect your wallet first.';
      toast.error('Please connect your wallet first');
      return { success: false, foodId, error };
    }

    // Validation: Check if account exists
    if (!account) {
      const error = 'No account found. Please connect your wallet.';
      toast.error('Please connect your wallet');
      return { success: false, foodId, error };
    }

    // Validation: Check if player exists
    if (!player) {
      const error = 'No player data found';
      toast.error('Player data not found');
      return { success: false, foodId, error };
    }

    // Validation: Check if beast is live
    if (!hasLiveBeast()) {
      const error = 'No live beast found';
      toast.error('You need a live beast to feed');
      return { success: false, foodId, error };
    }

    // Validation: Check if already feeding
    if (feedTransaction.isFeeding) {
      const error = 'Feed transaction already in progress';
      toast.error('Please wait for current feeding to complete');
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

      // Execute transaction using Cavos
      const calls = [{
        contractAddress: client.client.contractAddresses.game,
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
      toast.error(`Failed to feed beast: ${errorMessage}`, {
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
    account,
    status,
    player,
    hasLiveBeast,
    feedTransaction.isFeeding,
    setFeedTransaction,
    client.game
  ]);

  // Reset transaction state
  const resetTransaction = useCallback(() => {
    resetFeedTransaction();
  }, [resetFeedTransaction]);

  // Computed values with proper boolean types
  const canFeed = Boolean(
    status === "connected" &&
    account &&
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