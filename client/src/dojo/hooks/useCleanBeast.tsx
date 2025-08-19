import { useCallback } from 'react';
import { useOptimisticTransaction } from './useOptimisticTransaction';
import toast from 'react-hot-toast';

// Store imports
import useAppStore from '../../zustand/store';
import { getContractAddresses } from '../../config/cavosConfig';

// Optimistic helpers
import { calculateOptimisticClean, isBeastAlive } from '../../utils/optimisticHelpers';

// Hooks for post-transaction sync
import { useRealTimeStatus } from './useRealTimeStatus';
import { useUpdateBeast } from './useUpdateBeast';

// Types imports
import { CleanTransactionState } from '../../components/types/clean.types';

// Hook return interface
interface UseCleanBeastReturn {
  // State
  cleanTransaction: CleanTransactionState;
  
  // Actions
  cleanBeast: () => Promise<CleanActionResult>;
  resetTransaction: () => void;
  
  // Computed
  canClean: boolean;
  isCleaningInProgress: boolean;
}

// Clean action result interface
interface CleanActionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

/**
 * Hook for managing clean beast transactions
 * Handles contract interactions with proper validation and error handling
 * Follows the same pattern as useFeedBeast for consistency
 */
export const useCleanBeast = (): UseCleanBeastReturn => {
  const { executeOptimistic } = useOptimisticTransaction();
  
  // Get sync hooks for post-transaction updates
  const { fetchLatestStatus } = useRealTimeStatus();
  const { updateBeast } = useUpdateBeast();
  
  // Get Cavos auth state for validation
  const cavosAuth = useAppStore(state => state.cavos);
  
  // Store state and actions
  const cleanTransaction = useAppStore(state => state.cleanTransaction);
  const setCleanTransaction = useAppStore(state => state.setCleanTransaction);
  const resetCleanTransaction = useAppStore(state => state.resetCleanTransaction);
  const hasLiveBeast = useAppStore(state => state.hasLiveBeast);
  const player = useAppStore(state => state.player);
  
  // Get data needed for optimistic updates
  const realTimeStatus = useAppStore(state => state.realTimeStatus);
  const setRealTimeStatus = useAppStore(state => state.setRealTimeStatus);

  // Execute clean beast transaction
  const cleanBeast = useCallback(async (): Promise<CleanActionResult> => {
    // Validation: Check if Cavos is authenticated
    if (!cavosAuth.isAuthenticated || !cavosAuth.wallet || !cavosAuth.accessToken) {
      const error = 'Please login with ByteBeasts to clean your beast.';
      toast.error('Please connect to play!');
      return { success: false, error };
    }

    // Validation: Check if player exists
    if (!player) {
      const error = 'No player data found';
      toast.error('Unable to find your game data!');
      return { success: false, error };
    }

    // Validation: Check if beast is live
    if (!hasLiveBeast()) {
      const error = 'No live beast found';
      toast.error('You need a beast to clean!');
      return { success: false, error };
    }

    // Validation: Check if already cleaning
    if (cleanTransaction.isCleaningInProgress) {
      const error = 'Clean transaction already in progress';
      toast.error('Your beast is still being cleaned!');
      return { success: false, error };
    }
    
    // Validation: Check if beast is alive
    if (!isBeastAlive(realTimeStatus)) {
      const error = 'Beast is not alive';
      toast.error('Your beast needs to be revived first!');
      return { success: false, error };
    }

    // DON'T set loading state here - we want optimistic UI without spinner

    // Execute transaction with optimistic updates
    const contractAddresses = getContractAddresses();
    
    const calls = [{
      contractAddress: contractAddresses.game,
      entrypoint: 'clean',
      calldata: []
    }];
    
    const result = await executeOptimistic(calls, {
      // Capture current state
      captureState: () => ({
        originalStatus: [...realTimeStatus]
      }),
      
      // Apply optimistic update
      onOptimisticUpdate: () => {
        // Update stats optimistically
        const optimisticStats = calculateOptimisticClean(realTimeStatus);
        setRealTimeStatus(optimisticStats, true); // skipSync = true
        
        // No toast here - let the UI handle visual feedback
      },
      
      // Rollback on failure
      onRollback: (originalState: any) => {
        setRealTimeStatus(originalState.originalStatus, true);
        console.log('Clean transaction rolled back');
      },
      
      // On success, schedule background sync
      onSuccess: (txHash: string) => {
        console.log('✅ Clean transaction successful:', txHash);
        
        // Clear any transaction state
        setCleanTransaction({
          isCleaningInProgress: false,
          transactionHash: txHash,
          error: null,
        });
        
        // Schedule background sync after blockchain confirmation
        setTimeout(async () => {
          try {
            console.log('🔄 Starting post-clean sync...');
            
            // Update beast to trigger contract recalculation
            const updateSuccess = await updateBeast();
            if (updateSuccess) {
              console.log('✅ Beast updated successfully');
            }
            
            // Fetch latest status with skipSync to avoid re-mounting
            await fetchLatestStatus(true);
            console.log('✅ Status synced with blockchain');
            
          } catch (syncError) {
            console.error('⚠️ Background sync failed:', syncError);
            // Try to at least sync status
            try {
              await fetchLatestStatus(true);
            } catch (e) {
              console.error('Failed to sync status:', e);
            }
          }
        }, 2000); // Wait 2 seconds for blockchain confirmation
      },
      
      // On error
      onError: (error: any) => {
        console.error('Clean transaction failed:', error);
        
        // Clear transaction state on error
        setCleanTransaction({
          isCleaningInProgress: false,
          transactionHash: null,
          error: error?.message || 'Transaction failed',
        });
        
        // No error toast - already handled by validation
      }
    });
    
    if (result.success) {
      return {
        success: true,
        transactionHash: result.txHash,
      };
    } else {
      return {
        success: false,
        error: result.error?.message || 'Transaction failed',
      };
    }

  }, [
    cavosAuth.isAuthenticated,
    cavosAuth.wallet,
    cavosAuth.accessToken,
    player,
    hasLiveBeast,
    cleanTransaction.isCleaningInProgress,
    setCleanTransaction,
    executeOptimistic,
    realTimeStatus,
    setRealTimeStatus,
    updateBeast,
    fetchLatestStatus
  ]);

  // Reset transaction state
  const resetTransaction = useCallback(() => {
    resetCleanTransaction();
  }, [resetCleanTransaction]);

  // Computed values with proper boolean types
  const canClean = Boolean(
    cavosAuth.isAuthenticated &&
    cavosAuth.wallet &&
    cavosAuth.accessToken &&
    player &&
    hasLiveBeast() &&
    !cleanTransaction.isCleaningInProgress
  );
  
  const isCleaningInProgress = Boolean(cleanTransaction.isCleaningInProgress);

  return {
    // State
    cleanTransaction,
    
    // Actions
    cleanBeast,
    resetTransaction,
    
    // Computed
    canClean,
    isCleaningInProgress,
  };
};