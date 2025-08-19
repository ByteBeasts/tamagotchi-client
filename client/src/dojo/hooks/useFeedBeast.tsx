import { useCallback } from 'react';
import { useOptimisticTransaction } from './useOptimisticTransaction';
import toast from 'react-hot-toast';

// Store imports
import useAppStore from '../../zustand/store';
import { getContractAddresses } from '../../config/cavosConfig';

// Optimistic helpers
import { 
  calculateOptimisticFeed, 
  calculateOptimisticFoodInventory,
  getBeastType,
  isBeastAlive 
} from '../../utils/optimisticHelpers';

// Inventario necesario para optimistic updates de comida
import { useFoodInventory } from './useFoodInventory';

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
  const { executeOptimistic } = useOptimisticTransaction();
  
  // Inventario para optimistic updates de comida
  const { foods, silentRefetch, updateFoodAmountOptimistic } = useFoodInventory();
  
  // Get Cavos auth state for validation
  const cavosAuth = useAppStore(state => state.cavos);
  
  // Store state and actions
  const feedTransaction = useAppStore(state => state.feedTransaction);
  const setFeedTransaction = useAppStore(state => state.setFeedTransaction);
  const resetFeedTransaction = useAppStore(state => state.resetFeedTransaction);
  const hasLiveBeast = useAppStore(state => state.hasLiveBeast);
  const player = useAppStore(state => state.player);
  
  // Get data needed for optimistic updates
  const realTimeStatus = useAppStore(state => state.realTimeStatus);
  const setRealTimeStatus = useAppStore(state => state.setRealTimeStatus);
  const liveBeast = useAppStore(state => state.liveBeast);

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
    
    // Validation: Check if food is available
    const currentFood = foods.find(f => Number(f.id) === foodId);
    if (!currentFood || currentFood.count <= 0) {
      const error = 'Food not available';
      toast.error('This food is not available!');
      return { success: false, foodId, error };
    }
    
    // Validation: Check if beast is alive
    if (!isBeastAlive(realTimeStatus)) {
      const error = 'Beast is not alive';
      toast.error('Your beast needs to be revived first!');
      return { success: false, foodId, error };
    }

    // Get beast type for favorite food calculation
    const beastType = getBeastType(liveBeast);
    if (!beastType) {
      console.warn('Could not determine beast type, using default food values');
    }
    
    // Start transaction - set loading state
    setFeedTransaction({
      isFeeding: true,
      feedingFoodId: foodId,
      transactionHash: null,
      error: null,
    });

    // Execute transaction with optimistic updates
    const contractAddresses = getContractAddresses();
    
    const calls = [{
      contractAddress: contractAddresses.game,
      entrypoint: 'feed',
      calldata: [foodId.toString()]
    }];
    
    const result = await executeOptimistic(calls, {
      // Capture current state
      captureState: () => ({
        originalStatus: [...realTimeStatus]
      }),
      
      // Apply optimistic update
      onOptimisticUpdate: () => {
        // Update stats optimistically
        if (beastType) {
          const optimisticStats = calculateOptimisticFeed(realTimeStatus, foodId, beastType);
          setRealTimeStatus(optimisticStats, true); // skipSync = true
        }
        
        // Update food inventory optimistically (correct way)
        updateFoodAmountOptimistic(foodId, -1);
        
        // Show success toast immediately
        toast.success(`🎉 Food fed to your beast!`, {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#10B981',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '16px',
          },
        });
      },
      
      // Rollback on failure
      onRollback: (originalState: any) => {
        setRealTimeStatus(originalState.originalStatus, true);
        // Rollback food inventory by adding the food back
        updateFoodAmountOptimistic(foodId, +1);
        console.log('Feed transaction rolled back');
      },
      
      // On success, schedule background sync
      onSuccess: (txHash: string) => {
        console.log('✅ Feed transaction successful:', txHash);
        
        // Update transaction state
        setFeedTransaction({
          isFeeding: false,
          feedingFoodId: null,
          transactionHash: txHash,
          error: null,
        });
        
        // Schedule background sync after blockchain confirmation
        // Solo sync del inventario de comida - beast stats usan optimistic
        setTimeout(async () => {
          try {
            // Check if there are pending feeding operations before syncing
            const currentFeedState = useAppStore.getState().feedTransaction;
            if (currentFeedState.isFeeding) {
              console.log('🔄 Skipping food inventory sync - feeding in progress');
              return;
            }
            
            console.log('🔄 Syncing food inventory after feed...');
            await silentRefetch();
            console.log('✅ Food inventory synced - beast stats use optimistic updates');
          } catch (syncError) {
            console.error('⚠️ Food inventory sync failed:', syncError);
          }
        }, 5000); // Wait 5 seconds for blockchain confirmation
      },
      
      // On error
      onError: (error: any) => {
        console.error('Feed transaction failed:', error);
        
        // Update transaction state
        setFeedTransaction({
          isFeeding: false,
          feedingFoodId: null,
          transactionHash: null,
          error: error?.message || 'Transaction failed',
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
      }
    });
    
    if (result.success) {
      return {
        success: true,
        foodId,
        transactionHash: result.txHash,
      };
    } else {
      return {
        success: false,
        foodId,
        error: result.error?.message || 'Transaction failed',
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
    executeOptimistic,
    realTimeStatus,
    setRealTimeStatus,
    liveBeast,
    silentRefetch,
    updateFoodAmountOptimistic
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